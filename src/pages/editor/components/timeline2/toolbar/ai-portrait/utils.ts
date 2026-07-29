import ndarray, { NdArray, TypedArray } from 'ndarray';
import { imageDecode, imageEncode } from './codecs';
import localforage from 'localforage';
import { util } from '@utils/index';

export const config = {
  path: '/assets/ai/onnxruntime-web',
  mode: '/modnet_fp16.onnx',
  resolution: 512, // 精度
};

const localId = config.mode.replaceAll('/', '_').replace('.', '_');

let mode: any = null;
export async function loadModel() {
  // 脚本加载
  await loadScript(config.path + '/ort.webgpu.min.js');
  const ort = (window as any).ort;

  if (!mode) {
    // wasm加载路径
    ort.env.wasm.wasmPaths = config.path + '/';

    // 配置兼容
    ort.env.wasm.numThreads = 1;

    // 模型缓存到indexdb
    const mbuffer = await localforage.getItem(localId);
    const modelBuffer = mbuffer ? mbuffer : await fetchModel(config.path + config.mode);
    mode = await ort.InferenceSession.create(modelBuffer as any, {
      executionProviders: ['webgpu'],
      // graphOptimizationLevel: "all",
      // executionMode: "parallel",
      // enableCpuMemArena: true,
    });
    await localforage.setItem(localId, modelBuffer);
  }
  return mode;
}

// 将图片转换为模型输入张量
export async function sessionRun(image: HTMLImageElement) {
  const ort = (window as any).ort;
  const imageTensor: NdArray<Uint8Array> = await imageSourceToImageData(image.src);
  const keepAspect = false;
  let resizedImageTensor = tensorResizeBilinear(imageTensor, config.resolution, config.resolution, keepAspect);

  const inputTensor = tensorHWCtoBCHW(resizedImageTensor);

  // 归一化
  // const iData = new Float32Array(3 * config.resolution * config.resolution).fill(0);
  // for (let i = 0; i < iData.length; i++) {
  //   iData[i] = inputTensor.data[i] / 255.0; // 假设原始图像是 [0,255]
  // }

  const inputData = new ort.Tensor(
    'float32',
    // iData,
    // [1, 3, config.resolution, config.resolution],
    new Float32Array(inputTensor.data),
    inputTensor.shape,
  );

  const results = await mode.run(
    {
      input: inputData,
    },
    {},
  );

  const outputKVPairs: NdArray<Float32Array>[] = [];
  const output: any = results['output'];
  const shape: number[] = output.dims as number[];
  const data: Float32Array = output.data as Float32Array;
  const tensor = ndarray(data, shape);
  outputKVPairs.push(tensor);

  let alphamask = ndarray(outputKVPairs[0].data, [config.resolution, config.resolution, 1]);
  let alphamaskU8 = convertFloat32ToUint8(alphamask);
  return [alphamaskU8, imageTensor, resizedImageTensor];
}

type ImageSource = ImageData | ArrayBuffer | Uint8Array | Blob | URL | string | NdArray<Uint8Array>;

export function imageBitmapToImageData(imageBitmap: ImageBitmap): ImageData {
  var canvas = createCanvas(imageBitmap.width, imageBitmap.height);
  var ctx = canvas.getContext('2d')!;
  ctx.drawImage(imageBitmap, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function createTypeArray<T extends TypedArray>(length: number) {
  if (typeof Uint8Array !== 'undefined') {
    return new Uint8Array(length) as T;
  } else if (typeof Uint8ClampedArray !== 'undefined') {
    return new Uint8ClampedArray(length) as T;
  } else if (typeof Uint16Array !== 'undefined') {
    return new Uint16Array(length) as T;
  } else if (typeof Uint32Array !== 'undefined') {
    return new Uint32Array(length) as T;
  } else if (typeof Float32Array !== 'undefined') {
    return new Float32Array(length) as T;
  } else if (typeof Float64Array !== 'undefined') {
    return new Float64Array(length) as T;
  } else {
    throw new Error('TypedArray not supported');
  }
}
export function tensorResizeBilinear<T extends TypedArray>(
  imageTensor: NdArray<T>,
  newWidth: number,
  newHeight: number,
  proportional: boolean = false,
): NdArray<T> {
  const [srcHeight, srcWidth, srcChannels] = imageTensor.shape;

  let scaleX = srcWidth / newWidth;
  let scaleY = srcHeight / newHeight;

  if (proportional) {
    const downscaling = Math.max(scaleX, scaleY) > 1.0;
    scaleX = scaleY = downscaling ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
  }

  // Create a new NdArray to store the resized image
  const resizedImageData = ndarray(createTypeArray<T>(srcChannels * newWidth * newHeight), [
    newHeight,
    newWidth,
    srcChannels,
  ]);
  // Perform interpolation to fill the resized NdArray
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const srcX = x * scaleX;
      const srcY = y * scaleY;
      const x1 = Math.max(Math.floor(srcX), 0);
      const x2 = Math.min(Math.ceil(srcX), srcWidth - 1);
      const y1 = Math.max(Math.floor(srcY), 0);
      const y2 = Math.min(Math.ceil(srcY), srcHeight - 1);

      const dx = srcX - x1;
      const dy = srcY - y1;

      for (let c = 0; c < srcChannels; c++) {
        const p1 = imageTensor.get(y1, x1, c);
        const p2 = imageTensor.get(y1, x2, c);
        const p3 = imageTensor.get(y2, x1, c);
        const p4 = imageTensor.get(y2, x2, c);

        // Perform bilinear interpolation
        const interpolatedValue = (1 - dx) * (1 - dy) * p1 + dx * (1 - dy) * p2 + (1 - dx) * dy * p3 + dx * dy * p4;
        // console.log(interpolatedValue);
        resizedImageData.set(y, x, c, interpolatedValue);
      }
    }
  }

  return resizedImageData;
}

export function tensorHWCtoBCHW(
  imageTensor: NdArray<Uint8Array>,
  mean: number[] = [128, 128, 128],
  std: number[] = [256, 256, 256],
): NdArray<Float32Array> {
  var imageBufferData = imageTensor.data;
  const [srcHeight, srcWidth, srcChannels] = imageTensor.shape;
  const stride = srcHeight * srcWidth;
  const float32Data = new Float32Array(3 * stride);

  // r_0, r_1, .... g_0,g_1, .... b_0
  for (let i = 0, j = 0; i < imageBufferData.length; i += 4, j += 1) {
    float32Data[j] = (imageBufferData[i] - mean[0]) / std[0];
    float32Data[j + stride] = (imageBufferData[i + 1] - mean[1]) / std[1];
    float32Data[j + stride + stride] = (imageBufferData[i + 2] - mean[2]) / std[2];
  }

  return ndarray(float32Data, [1, 3, srcHeight, srcWidth]);
}

export async function imageSourceToImageData(image: ImageSource): Promise<NdArray<Uint8Array>> {
  if (typeof image === 'string') {
    image = new URL(image);
  }
  if (image instanceof URL) {
    const response = await fetch(image, {});
    image = await response.blob();
  }
  if (image instanceof ArrayBuffer || ArrayBuffer.isView(image)) {
    //@ts-ignore
    image = new Blob([image]);
  }
  if (image instanceof Blob) {
    image = await imageDecode(image);
  }
  return image as NdArray<Uint8Array>;
}

export function convertFloat32ToUint8(float32Array: NdArray<Float32Array>): NdArray<Uint8Array> {
  const uint8Array = new Uint8Array(float32Array.data.length);
  for (let i = 0; i < float32Array.data.length; i++) {
    uint8Array[i] = float32Array.data[i] * 255;
  }
  return ndarray(uint8Array, float32Array.shape);
}

export function createCanvas(width, height): any {
  let canvas: any = undefined;
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(width, height);
  } else {
    canvas = document.createElement('canvas');
  }

  if (!canvas) {
    throw new Error(`Canvas nor OffscreenCanvas are available in the current context.`);
  }
  return canvas;
}

/**
 * 缩放 Alpha 掩码到目标尺寸（双线性插值）
 * @param {Float32Array} alphaData - 原始掩码数据（512x512）
 * @param {number} srcSize - 原始尺寸（512）
 * @param {number} dstWidth - 目标宽度（1000）
 * @param {number} dstHeight - 目标高度（500）
 * @returns {Float32Array} 缩放后的掩码数据（1000x500）
 */
export function resizeAlphaMask(alphaData, srcSize, dstWidth, dstHeight) {
  const scaledMask = new Float32Array(dstWidth * dstHeight);

  for (let y = 0; y < dstHeight; y++) {
    for (let x = 0; x < dstWidth; x++) {
      // 计算原始掩码的坐标（浮点数）
      const srcX = (x / dstWidth) * (srcSize - 1);
      const srcY = (y / dstHeight) * (srcSize - 1);

      // 双线性插值
      const x1 = Math.floor(srcX),
        y1 = Math.floor(srcY);
      const x2 = Math.min(x1 + 1, srcSize - 1),
        y2 = Math.min(y1 + 1, srcSize - 1);
      const dx = srcX - x1,
        dy = srcY - y1;

      // 四个邻近点的 Alpha 值
      const alpha11 = alphaData[y1 * srcSize + x1];
      const alpha12 = alphaData[y2 * srcSize + x1];
      const alpha21 = alphaData[y1 * srcSize + x2];
      const alpha22 = alphaData[y2 * srcSize + x2];

      // 加权平均
      scaledMask[y * dstWidth + x] =
        (1 - dx) * (1 - dy) * alpha11 + dx * (1 - dy) * alpha21 + (1 - dx) * dy * alpha12 + dx * dy * alpha22;
    }
  }
  return scaledMask;
}

// 步骤1：将 maskData 转为临时图片（512x512）​
export function alphaDataToImage(alphaData, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 创建 ImageData（RGBA）
  const imageData = ctx.createImageData(width, height);
  for (let i = 0; i < alphaData.length; i++) {
    // const alpha = Math.round(alphaData[i] * 255); // 假设 alphaData 范围 [0,1]
    imageData.data[i * 4] = 0; // R (0)
    imageData.data[i * 4 + 1] = 0; // G (0)
    imageData.data[i * 4 + 2] = 0; // B (0)
    imageData.data[i * 4 + 3] = alphaData[i]; // A
  }
  // 绘制到 Canvas
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// 步骤2：缩放掩码图到原图尺寸（1000x500）​
export async function resizeImage(image, targetWidth, targetHeight) {
  const canvas = createCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');

  // 直接缩放绘制（使用浏览器内置插值）
  ctx.imageSmoothingEnabled = true; // 启用抗锯齿
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  return canvas;
}

// 步骤3：用缩放后的掩码图抠取原图​
export async function applyMask(imageTensor, resizedMaskCanvas) {
  // 2. 提取缩放后的掩码 Alpha 数据
  const maskCtx = resizedMaskCanvas.getContext('2d');
  const maskData = maskCtx.getImageData(0, 0, resizedMaskCanvas.width, resizedMaskCanvas.height);

  // 4. 应用 Alpha 通道（直接取掩码的 Red 通道作为 Alpha）
  for (let i = 0; i < maskData.data.length / 4; i++) {
    imageTensor.data[i * 4 + 3] = maskData.data[i * 4 + 3]; // 使用掩码的 Alpha
  }

  const blob = await imageEncode(imageTensor);
  return URL.createObjectURL(blob);
}

/**
 * fetch模型
 * @param url
 * @returns
 */
export async function fetchModel(url: string) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return buffer;
}

/**
 * 动态加载脚本
 * @param url
 * @param callback
 */
export function loadScript(url: string) {
  return new Promise(resolve => {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = () => {
      resolve(true);
    };
    document.head.appendChild(script);
  });
}

export async function blobUrlToBase64(blobUrl: string) {
  try {
    // 从Blob URL获取Blob对象
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态: ${response.status}`);
    }
    const blob = await response.blob();

    // 将Blob转换为Base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('转换Blob URL到Base64时出错:', error);
    throw error;
  }
}

// 执行AI推理
export function run(url: string, uploadBase64: (params: { content: string; name: string }) => Promise<any>) {
  return new Promise(resolve => {
    const image = new Image();
    image.src = url;
    image.onload = async () => {
      try {
        await loadModel();
        const [alphamask, imageTensor, resizeImageTensor] = await sessionRun(image);
        // 生成临时掩码图（512x512）
        const maskCanvas = alphaDataToImage(alphamask.data, config.resolution, config.resolution);
        // 缩放掩码图到 1000x500
        const resizedMaskCanvas = await resizeImage(maskCanvas, image.naturalWidth, image.naturalHeight);
        // 抠图
        const finalUrl = await applyMask(imageTensor, resizedMaskCanvas);
        // console.log('finalUrl', finalUrl);
        // 文件上传
        const base64 = (await blobUrlToBase64(finalUrl)) as string;

        const [res] = await uploadBase64({
          content: base64,
          name: util.randomID() + '.png',
        });
        res.base64 = base64;
        resolve(res);
      } catch (error) {
        resolve(null);
        console.error('推理失败:', error);
      } finally {
        console.log('over');
      }
    };
  });
}
