import localforage from 'localforage';
import cv, { Mat } from 'opencv-ts';
import { util } from '@utils/index';

export const config = {
  path: '/assets/ai/onnxruntime-web',
  mode: '/realesrgan-x4.onnx',
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
export async function sessionRun(image: HTMLImageElement, resolution: number, callback: any) {
  const ort = (window as any).ort;
  // 运行模型推理
  const { imageTersorData, alphaChannel } = await processImage(image);
  const inputTensor = new ort.Tensor('float32', imageTersorData, [1, 3, image.height, image.width]);
  const result = await runModel(inputTensor, mode, v => {
    console.log(v);
    callback(v);
  });
  const chwToHwcData = postProcess(result.data, image.width * 4, image.height * 4, alphaChannel, image.width, image.height);
  const imageData = new ImageData(new Uint8ClampedArray(chwToHwcData), image.width * 4, image.height * 4);
  const url = imageDataToDataURL(imageData);
  // const zurl = resizeImage(url, image.width * resolution, image.height * resolution);
  return url;
}

function postProcess(floatData: Float32Array, width: number, height: number, alphaChannel?: Uint8ClampedArray, originalWidth?: number, originalHeight?: number) {
  const size = width * height;
  const hwcData = new Uint8ClampedArray(size * 4); // 预分配内存
  const scaleX = originalWidth ? width / originalWidth : 1;
  const scaleY = originalHeight ? height / originalHeight : 1;
  
  for (let i = 0; i < size; i++) {
    const h = Math.floor(i / width);
    const w = i % width;
    const baseHwc = i * 4;

    for (let c = 0; c < 3; c++) {
      const chwIndex = c * size + h * width + w;
      // 使用Math.max/min替代条件判断并直接进行归一化
      hwcData[baseHwc + c] = Math.max(0, Math.min(1, floatData[chwIndex])) * 255;
    }
    
    // 恢复Alpha通道：如果有原始Alpha通道数据，进行插值；否则保持不透明
    if (alphaChannel && originalWidth && originalHeight) {
      const originalW = Math.floor(w / scaleX);
      const originalH = Math.floor(h / scaleY);
      const originalIndex = Math.min(originalWidth - 1, Math.max(0, originalW)) + 
                           Math.min(originalHeight - 1, Math.max(0, originalH)) * originalWidth;
      hwcData[baseHwc + 3] = alphaChannel[originalIndex];
    } else {
      hwcData[baseHwc + 3] = 255; // 设置Alpha通道
    }
  }
  return hwcData;
}

function imageDataToDataURL(imageData: ImageData) {
  // 创建 canvas
  const canvas = createCanvas(imageData.width, imageData.height);
  // 绘制 imageData 到 canvas
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageData, 0, 0);

  // 导出为数据 URL
  return canvas.toDataURL();
}

async function runModel(inputTensor, inferenceSession, progressCallback: (n: number) => void) {
  const ort = (window as any).ort;

  // 输入图像尺寸
  const [batchSize, channelCount, inputHeight, inputWidth] = inputTensor.dims;
  const inputPixelCount = inputWidth * inputHeight;

  // 输出图像尺寸 (假设4倍上采样)
  const outputWidth = inputWidth * 4;
  const outputHeight = inputHeight * 4;
  const outputPixelCount = outputWidth * outputHeight;

  // 创建输出张量
  const outputDims = [batchSize, channelCount, outputHeight, outputWidth];
  const outputTensor = new ort.Tensor(
    'float32',
    new Float32Array(batchSize * channelCount * outputPixelCount),
    outputDims,
  );

  // 通道偏移量
  const redChannelOffset = 0;
  const greenChannelOffset = inputPixelCount;
  const blueChannelOffset = inputPixelCount * 2;

  const outputRedOffset = 0;
  const outputGreenOffset = outputPixelCount;
  const outputBlueOffset = outputPixelCount * 2;

  // 瓦片处理参数
  const tileSize = 64;
  const tilePadding = 6;
  const effectiveTileSize = tileSize - tilePadding * 2;

  // 计算瓦片数量
  const tilesX = Math.ceil(inputWidth / effectiveTileSize);
  const tilesY = Math.ceil(inputHeight / effectiveTileSize);
  const totalTiles = tilesX * tilesY;

  // 处理进度跟踪
  let processedTiles = 0;

  // 遍历所有瓦片
  for (let tileXIndex = 0; tileXIndex < tilesX; tileXIndex++) {
    for (let tileYIndex = 0; tileYIndex < tilesY; tileYIndex++) {
      // 计算当前瓦片的实际尺寸
      const tileActualWidth = Math.min(effectiveTileSize, inputWidth - tileXIndex * effectiveTileSize);
      const tileActualHeight = Math.min(effectiveTileSize, inputHeight - tileYIndex * effectiveTileSize);

      // 创建带padding的瓦片数据
      const paddedTileData = new Float32Array(tileSize * tileSize * channelCount);
      const paddedRedOffset = 0;
      const paddedGreenOffset = tileSize * tileSize;
      const paddedBlueOffset = tileSize * tileSize * 2;

      // 填充瓦片数据，处理边界情况
      for (let yPadding = -tilePadding; yPadding < effectiveTileSize + tilePadding; yPadding++) {
        for (let xPadding = -tilePadding; xPadding < effectiveTileSize + tilePadding; xPadding++) {
          // 计算在原图中的坐标 (处理边界溢出)
          const sourceX = Math.max(0, Math.min(inputWidth - 1, tileXIndex * effectiveTileSize + xPadding));
          const sourceY = Math.max(0, Math.min(inputHeight - 1, tileYIndex * effectiveTileSize + yPadding));

          // 计算在瓦片中的坐标
          const tileX = xPadding + tilePadding;
          const tileY = yPadding + tilePadding;

          // 复制像素数据到瓦片
          const sourceIndex = sourceX + sourceY * inputWidth;
          const tileIndex = tileX + tileY * tileSize;

          paddedTileData[tileIndex + paddedRedOffset] = inputTensor.data[sourceIndex + redChannelOffset];
          paddedTileData[tileIndex + paddedGreenOffset] = inputTensor.data[sourceIndex + greenChannelOffset];
          paddedTileData[tileIndex + paddedBlueOffset] = inputTensor.data[sourceIndex + blueChannelOffset];
        }
      }

      // 模型推理
      const tileTensor = new ort.Tensor('float32', paddedTileData, [1, channelCount, tileSize, tileSize]);
      const inferenceResults = await inferenceSession.run({ 'input.1': tileTensor });
      const modelOutput = inferenceResults['1895'];

      // 计算输出瓦片参数
      const outputTileWidth = tileActualWidth * 4;
      const outputTileHeight = tileActualHeight * 4;
      const outputTileSize = tileSize * 4;
      const outputTileEffectiveSize = effectiveTileSize * 4;
      const outputTilePadding = tilePadding * 4;

      // 输出瓦片通道偏移量
      const outputTileRedOffset = 0;
      const outputTileGreenOffset = outputTileSize * outputTileSize;
      const outputTileBlueOffset = outputTileSize * outputTileSize * 2;

      // 合并结果到输出张量
      for (let y = 0; y < outputTileHeight; y++) {
        for (let x = 0; x < outputTileWidth; x++) {
          // 计算在输出图像中的坐标
          const outputX = tileXIndex * outputTileEffectiveSize + x;
          const outputY = tileYIndex * outputTileEffectiveSize + y;

          // 计算在模型输出中的坐标
          const modelOutputX = x + outputTilePadding;
          const modelOutputY = y + outputTilePadding;

          // 计算索引
          const outputIndex = outputX + outputY * outputWidth;
          const modelOutputIndex = modelOutputX + modelOutputY * outputTileSize;

          // 复制结果到输出张量
          outputTensor.data[outputIndex + outputRedOffset] = modelOutput.data[modelOutputIndex + outputTileRedOffset];
          outputTensor.data[outputIndex + outputGreenOffset] =
            modelOutput.data[modelOutputIndex + outputTileGreenOffset];
          outputTensor.data[outputIndex + outputBlueOffset] = modelOutput.data[modelOutputIndex + outputTileBlueOffset];
        }
      }

      // 更新进度
      processedTiles++;
      progressCallback(Math.round((100 * processedTiles) / totalTiles));
    }
  }

  return outputTensor;
}

async function processImage(img: HTMLImageElement): Promise<any> {
  // 创建临时Mat对象的容器，用于自动资源释放
  const matStack = new cv.MatVector();

  try {
    // 读取图像并转换颜色空间
    const src = cv.imread(img);
    matStack.push_back(src);

    const src_rgb = new cv.Mat();
    matStack.push_back(src_rgb);

    cv.cvtColor(src, src_rgb, cv.COLOR_RGBA2RGB);

    // 提取原始Alpha通道
    const alphaChannel = new Uint8ClampedArray(img.width * img.height);
    alphaChannel.fill(255); // 默认不透明
    const channels = new cv.MatVector();
    cv.split(src, channels);
    if (channels.size() >= 4) {
      const alphaMat = channels.get(3);
      alphaChannel.set(alphaMat.data);
    }
    channels.delete();

    // 调用图像处理函数
    const result = await image2Float32Array(src_rgb);

    // 返回处理结果和Alpha通道
    return { imageTersorData: result, alphaChannel };
  } catch (error) {
    console.error('图像处理过程中发生错误:', error);
    throw error; // 向上抛出错误
  } finally {
    // 确保所有Mat对象被释放
    matStack.delete();
  }
}

function image2Float32Array(img: Mat) {
  const channels = new cv.MatVector();
  try {
    cv.split(img, channels);

    const channelCount = channels.size();
    const height = img.rows;
    const width = img.cols;
    const pixelCount = height * width;

    // 创建 CHW 格式的数组
    const chwArray = new Float32Array(channelCount * pixelCount);

    // 遍历每个通道
    for (let channel = 0; channel < channelCount; channel++) {
      const channelMat = channels.get(channel);
      const channelData = channelMat.data;

      // 将 HWC 数据转换为 CHW 格式并归一化
      for (let i = 0; i < pixelCount; i++) {
        chwArray[channel * pixelCount + i] = channelData[i] / 255.0;
      }
    }

    return chwArray;
  } finally {
    // 确保资源释放
    channels.delete();
  }
}

export function createCanvas(width, height): any {
  const canvas: any = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

// 缩放图到原图尺寸（1000x500）​
export async function resizeImage(imageURL, targetWidth, targetHeight) {
  const canvas = createCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');

  // 直接缩放绘制（使用浏览器内置插值）
  ctx.imageSmoothingEnabled = true; // 启用抗锯齿
  const _img = await util.imgLazy(imageURL);
  ctx.drawImage(_img, 0, 0, targetWidth, targetHeight);

  return canvas.toDataURL();
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
