const navigator = (window as any).navigator;

export interface SupportVal {
  webgpu: boolean;
  wasm: boolean;
  simd: boolean;
  threads: boolean;
}

/**
 * 检测浏览器支持
 */
export class CheckBrowserSupport {
  public async init(): Promise<SupportVal> {
    return {
      webgpu: await this._checkWebgpu(),
      wasm: this._wasm(),
      simd: await this._simd(),
      threads: await this._threads(),
    };
  }

  // 是否支持WEBGPU
  private async _checkWebgpu() {
    if (!navigator.gpu) {
      return false;
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      return false;
    }
    return true;
  }

  // 是否支持wasm
  private _wasm() {
    return (
      typeof WebAssembly === "object" &&
      typeof WebAssembly.instantiate === "function"
    );
  }

  // 是否支持多线程
  private async _threads() {
    const u8 = new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1,
      1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11,
    ]);
    try {
      return (
        typeof MessageChannel !== "undefined" &&
          new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),
        WebAssembly.validate(u8)
      );
      // eslint-disable-next-line @typescript-eslint/no-shadow
    } catch (e) {
      return !1;
    }
  }

  // WASM SIMD（WebAssembly SIMD）是一种WebAssembly的扩展，用于支持单指令多数据（SIMD）并行计算
  private async _simd() {
    return WebAssembly.validate(
      new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10,
        1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
      ])
    );
  }
}

/**
 * 动态加载脚本
 * @param url
 * @param callback
 */
export function loadScript(url: string) {
  return new Promise((resolve) => {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.onload = () => {
      resolve(true);
    };
    document.head.appendChild(script);
  });
}

/**
 * 加载图片
 * @param url
 * @returns
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
    img.src = url;
  });
}

/**
 * imageData 转化成 base64
 * @param imageData
 * @returns
 */
export function imageDataToDataURL(imageData) {
  // 创建 canvas
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  // 绘制 imageData 到 canvas
  const ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);
  // 导出为数据 URL
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

export function imgToData(originalImg: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = originalImg.width;
  canvas.height = originalImg.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(originalImg, 0, 0, originalImg.width, originalImg.height);

  // 获取图像数据
  const imageData = ctx.getImageData(
    0,
    0,
    originalImg.width,
    originalImg.height
  ).data;

  return imageData;
}

/**
 * 处理返回的结果
 * @param u8Data
 * @param width
 * @param height
 * @returns
 */
export function resultImageData(
  u8Data: Uint8Array,
  width: number,
  height: number
) {
  const arr = [];
  const size = width * height;
  const toRVal = (v: number) => {
    if (v > 255) {
      return 255;
    } else if (v < 0) {
      return 0;
    } else {
      return v;
    }
  };
  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      arr.push(
        toRVal(u8Data[0 * size + h * width + w]),
        toRVal(u8Data[1 * size + h * width + w]),
        toRVal(u8Data[2 * size + h * width + w]),
        255
      );
    }
  }
  return arr;
}

export function canvasScale(scale, originalCanvas) {
  // 创建临时 canvas 用于放大
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = originalCanvas.width * scale;
  tempCanvas.height = originalCanvas.height * scale;
  const tempCtx = tempCanvas.getContext('2d');

  // 将原始内容绘制到临时 canvas 上并放大
  tempCtx.drawImage(originalCanvas, 0, 0, tempCanvas.width, tempCanvas.height);

  // document.body.appendChild(tempCanvas)

  // 获取放大后的 ImageData
  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

  return imageData;
}

// 通道转化，默认图片是4通道（rgba），转化成1通道(a)或者3通道(rgba)
export function channelTo(img: HTMLImageElement, channel: 1 | 3) {
  const imageData = imgToData(img);
  if (channel === 1) {
    const arr = [];
    for (let i = 0; i < imageData.length; i += 4) {
      if (imageData[i + 3]) {
        arr.push(0);
      } else {
        arr.push(255);
      }
    }
    return new Uint8Array(arr);
  } else if (channel === 3) {
    const arr = new Uint8Array(3 * img.width * img.height);
    const arrRGB = [[], [], []];
    for (let i = 0; i < imageData.length; i += 4) {
      arrRGB[0].push(imageData[i + 0]);
      arrRGB[1].push(imageData[i + 1]);
      arrRGB[2].push(imageData[i + 2]);
    }
    for (let c = 0; c < 3; c++) {
      for (let h = 0; h < img.height; h++) {
        for (let w = 0; w < img.width; w++) {
          arr[c * img.height * img.width + h * img.width + w] =
            arrRGB[c][h * img.width + w];
        }
      }
    }
    return new Uint8Array(arr);
  } else {
    console.error("参数错误，channel只能是1或者3");
  }
}
