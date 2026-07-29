import localforage from 'localforage';
import { Toast } from '@douyinfe/semi-ui';
import {
  loadScript,
  CheckBrowserSupport,
  fetchModel,
  loadImage,
  imageDataToDataURL,
  channelTo,
  resultImageData,
} from './tools';

let model = null;
const path = '/assets/ai/onnxruntime-web';
export async function paint(imageFile: File | HTMLImageElement, maskBase64: string) {
  // 脚本加载
  const checkBS = new CheckBrowserSupport();
  const supportVal = await checkBS.init();
  if (supportVal.webgpu) {
    await loadScript(path + '/ort.webgpu.min.js');
  } else if (supportVal.wasm) {
    if (supportVal.simd || supportVal.threads) {
      await loadScript(path + '/ort.wasm.min.js');
    } else {
      await loadScript(path + '/ort.wasm-core.min.js');
    }
  } else {
    await loadScript(path + '/ort.min.js');
  }
  const ort = (window as any).ort;

  if (!model) {
    // wasm加载路径
    ort.env.wasm.wasmPaths = path + '/';

    // 配置兼容
    if (supportVal.webgpu) {
      ort.env.wasm.numThreads = 1;
    } else {
      if (supportVal.threads) {
        ort.env.wasm.numThreads = navigator.hardwareConcurrency ?? 4;
      }
      if (supportVal.simd) {
        ort.env.wasm.simd = true;
      }
      ort.env.wasm.proxy = true;
    }

    // 模型缓存到indexdb
    const mbuffer = await localforage.getItem('rubber_model');
    const modelBuffer = mbuffer ? mbuffer : await fetchModel(path + '/migan_pipeline_v2.onnx');
    model = await ort.InferenceSession.create(modelBuffer as any, {
      executionProviders: [supportVal.webgpu ? 'webgpu' : 'wasm'],
    });
    await localforage.setItem('rubber_model', modelBuffer);
  }

  // 获取图片数据
  const [originalImg, originalMark] = await Promise.all([
    imageFile instanceof HTMLImageElement ? imageFile : loadImage(URL.createObjectURL(imageFile)),
    loadImage(maskBase64),
  ]);

  // AI推理
  const results = await model.run({
    [model.inputNames[0]]: new ort.Tensor('uint8', channelTo(originalImg, 3), [
      1,
      3,
      originalImg.height,
      originalImg.width,
    ]),
    [model.inputNames[1]]: new ort.Tensor('uint8', channelTo(originalMark, 1), [
      1,
      1,
      originalMark.height,
      originalMark.width,
    ]),
  });
  const outsTensor = results[model.outputNames[0]];
  // 3通道数据恢复成4通道数据
  const rData = resultImageData(outsTensor.data, originalImg.width, originalImg.height);
  const imageData = new ImageData(new Uint8ClampedArray(rData), originalImg.width, originalImg.height);

  const result = imageDataToDataURL(imageData);
  return result;
}
