import { getFileTypeByURL, drawVideoFrame } from '@utils/util';
import { utils, gif2frames } from 'video-core-sdk';
import AudioSVGWaveform from './audioWaveFormSvgPath';
import { util } from '@utils/index';
import parseAPNG from 'apng-js';
import { strFromU8, unzip } from 'fflate';
/** 将 Uint8Array 转为 base64 字符串（浏览器兼容） */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
import lottie from 'lottie-web';
import type { Unzipped } from 'fflate';
// import MediaInfoFactory from 'mediainfo.js';

/**
 * 判断文件是否为 APNG 动图
 * @param {File|Blob} file
 * @returns {Promise<boolean>}
 */
export async function isAPNG(file: File): Promise<boolean> {
  return new Promise(resolve => {
    // 只需要读取前 100 个字节就够了
    const slice = file.slice(0, 100);
    const reader = new FileReader();

    reader.onload = e => {
      const buffer = new Uint8Array(e.target.result as ArrayBuffer);

      // 1. 判断是不是 PNG
      const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;

      if (!isPNG) return resolve(false);

      // 2. 转字符串查找 acTL 标记（APNG 特有）
      const str = new TextDecoder().decode(buffer);
      const isAPNG = str.includes('acTL');

      resolve(isAPNG);
    };

    reader.readAsArrayBuffer(slice);
  });
}

export async function mediaInfo(file: File): Promise<any> {
  return new Promise(resolve => {
    (window as any).MediaInfo.mediaInfoFactory(
      {
        format: 'JSON',
        // locateFile: path => {
        //   if (path.endsWith('.wasm')) {
        //     return '/assets/MediaInfoModule.wasm'; // 自定义路径
        //   }
        //   return path; // 其他文件使用默认路径
        // },
      },
      async mediainfo => {
        const res = await mediainfo
          .analyzeData(file.size, async (chunkSize, offset) => {
            return new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer());
          })
          .then(result => {
            return result as any;
          })
          .catch(error => {
            console.error(`An error occured:\n${error.stack}`);
          });

        resolve(JSON.parse(res));
      },
    );
  });
}
/**
 * 上传之前预处理数据
 */
export async function getUploadBeforeData(params: {
  url: string;
  type?: 'audio' | 'image' | 'video' | 'image/svg' | 'image/gif' | 'image/apng' | 'lottie' | 'sticker' | null;
  stopDrawFrame?: boolean;
  uploadBase64?: (params: {
    content: string;
    name: string;
    file_type?: 'image' | 'video' | 'audio' | 'json' | 'txt' | 'font';
  }) => Promise<any>; // 上传base64的接口
  file?: File;
  reURL?: any; // 这里在编辑器中是必传的参数
  workerPath?: string;
}) {
  let { url, type, workerPath = '/assets/worker', uploadBase64, file, reURL } = params;
  if (!type) {
    type = getFileTypeByURL(url) as any;
  }
  if (!type) {
    throw new Error('文件类型未知，请传入type参数');
  }

  // 如果是.png结尾的文件，解析为apng格式
  let apng: any;
  if (url.endsWith('.png') || type === 'image/apng') {
    const response = await fetch(url as string);
    const source = await response.arrayBuffer();
    apng = parseAPNG(source);
    if (apng instanceof Error) {
      // throw new Error(`APNG解析失败：${apng.message}`);
      // 不是apng，不处理
      console.log('不是apng，不处理', apng);
    } else {
      type = 'image/apng';
    }
  }

  if (!reURL) {
    reURL = utils.reURL;
  }

  switch (type) {
    case 'audio': {
      // 获取音波数据
      // 获取duration
      const media = (await utils.mediaLazy(reURL(url), undefined, 'audio')) as HTMLVideoElement;
      // 获取文件大小
      const audio = new AudioSVGWaveform({ url: reURL(url), buffer: null, maxWidth: 10000 });
      await audio.loadFromUrl();

      const peacks = await audio.getPeaks();
      const waveBase64 = 'data:text/text;base64,' + btoa(JSON.stringify(peacks));

      if (uploadBase64) {
        const [res, err] = await uploadBase64({
          content: waveBase64,
          name: utils.createID() + '.json',
          // file_type: 'json',
        });
        if (err) {
          console.error('上传wave base64 到服务器出现异常:', err);
        }
        return { wave: res ? res.storage_path : '', duration: media.duration };
      } else {
        return { wave: waveBase64, duration: media.duration, _localURL: utils.base642URL(waveBase64) };
      }
    }
    case 'image/apng': {
      const info = (await imageThumb(url, 200)) as any;
      const delays = apng.frames.map(d => d.delay / 1000);
      const totalFrame = apng.frames.length;
      const delayFrame = apng.frames[0].delay / 1000;
      const aspectRatio = apng.width / apng.height;
      const frameBase64 = await apngArr2FrameImage({ apng, delayFrame, totalFrame }, aspectRatio, 50);

      if (uploadBase64) {
        const [thumb, frames] = await Promise.all([
          uploadBase64({
            content: info._base64,
            name: utils.createID() + '.png',
            file_type: 'image',
          }).then(res => {
            return res[0]?.storage_path;
          }),
          uploadBase64({
            content: frameBase64,
            name: utils.createID() + '.png',
            file_type: 'image',
          }).then(res => {
            return res[0]?.storage_path;
          }),
        ]);
        return { ...info, delays, delayFrame, totalFrame, thumb, frames };
      } else {
        return {
          ...info,
          frames: frameBase64,
          _localThumb: utils.base642URL(info.base64),
          _localFrames: utils.base642URL(frameBase64),
        };
      }
    }
    case 'image':
    case 'image/svg': {
      // 获取封面图
      // 获取文件大小，真实尺寸
      const info = (await imageThumb(url, 200)) as any;
      if (uploadBase64) {
        const [res] = await uploadBase64({
          content: info._base64,
          name: utils.createID() + '.png',
          file_type: 'image',
        });
        // console.log('?????', info);
        return { ...info, thumb: res.storage_path };
      } else {
        return { ...info, _localURL: utils.base642URL(info._base64) };
      }
    }
    case 'image/gif': {
      // 获取封面图
      // 获取gif帧图
      // 获取文件大小，真实尺寸
      const info = (await imageThumb(url, 200)) as any;
      const { gifArr, delayFrame, totalFrame } = await gif2frames(url, 'base64');
      const aspectRatio = info.naturalWidth / info.naturalHeight;
      const frameBase64 = await gifArr2FrameImage({ gifArr, delayFrame, totalFrame }, aspectRatio, 50);
      // console.log('frameBase64', frameBase64);
      if (uploadBase64) {
        const [thumb, frames] = await Promise.all([
          uploadBase64({
            content: info._base64,
            name: utils.createID() + '.png',
            file_type: 'image',
          }).then(res => {
            return res[0]?.storage_path;
          }),
          uploadBase64({
            content: frameBase64,
            name: utils.createID() + '.png',
            file_type: 'image',
          }).then(res => {
            return res[0]?.storage_path;
          }),
        ]);
        return { ...info, delayFrame, totalFrame, thumb, frames };
      } else {
        return {
          ...info,
          frames: frameBase64,
          _localThumb: utils.base642URL(info.base64),
          _localFrames: utils.base642URL(frameBase64),
        };
      }
    }
    case 'video': {
      let audioTrack = null;
      let videoTrack = null;
      if (file) {
        // 初始化 MediaInfo
        const mediaInfoRes = await mediaInfo(file);
        console.log('MediaInfo 输出信息 >>', mediaInfoRes);
        videoTrack = mediaInfoRes.media.track.find(d => d['@type'].toLocaleLowerCase() === 'video');
        audioTrack = mediaInfoRes.media.track.find(d => d['@type'].toLocaleLowerCase() === 'audio');
      }

      // 获取封面图
      const video = (await utils.mediaLazy(reURL(url), 1, 'video')) as HTMLVideoElement;
      const thumbBase64 = video.videoWidth ? await drawVideoFrame(video, 200, 3) : null;
      const aspectRatio = video.videoWidth / video.videoHeight || 1;
      const frameScale = 2; // 帧图的缩放比例

      console.log('aspectRatio', aspectRatio);
      console.dir(video);

      // 获取duration，真实尺寸，获取是否有音波
      let blobURL;
      let rotate = 0;
      if (!params.stopDrawFrame) {
        const _video = await util.mediaLazy(reURL(url));
        // 音频轨道异常
        if (audioTrack && parseInt(audioTrack.Duration, 10) === 0) {
          console.warn('音频轨道异常，时长为0');
          audioTrack = null;
        }
        const res = (await decoderVideoDrawFrameImage({
          url: reURL(url),
          aspectRatio,
          audioTrack,
          videoRotation: Number(videoTrack?.Rotation || 0),
          frameScale,
          duration: _video.duration,
          workerPath,
        })) as any;
        rotate = res.rotate;
        if (typeof res === 'object') {
          blobURL = res.url;
        }
      }

      const { duration, videoHeight, videoWidth } = video;

      let waveBase64 = null;
      if (audioTrack) {
        // 获取音波数据
        const audio = new AudioSVGWaveform({ url: url, buffer: null, maxWidth: 10000 });
        await audio.loadFromUrl();
        const peacks = await audio.getPeaks();
        waveBase64 = 'data:text/text;base64,' + btoa(JSON.stringify(peacks));
      }

      // 文件上传
      if (uploadBase64) {
        let thumb, frames, wave;
        if (thumbBase64) {
          thumb = await uploadBase64({
            content: thumbBase64,
            name: utils.createID() + '.png',
            file_type: 'image',
          }).then(res => {
            return res[0]?.storage_path;
          });
        }
        if (blobURL) {
          frames = await uploadBase64({
            content: (await utils.blobURL2Data(blobURL)) as string,
            name: utils.createID() + '.png',
            file_type: 'image',
          }).then(res => {
            return res[0]?.storage_path;
          });
        }
        if (waveBase64) {
          wave = await uploadBase64({
            content: waveBase64,
            name: utils.createID() + '.json',
          }).then(res => {
            return res[0]?.storage_path;
          });
        }
        console.log('Number(videoTrack.rotation || 0)**************************', audioTrack, videoTrack, Number(videoTrack?.Rotation || 0));

        return {
          rotate,
          noAudioTracks: audioTrack ? false : true,
          thumb,
          frames,
          frameScale: frameScale || 1,
          wave,
          rotation: Number(videoTrack?.Rotation || 0),
          duration,
          videoWidth,
          videoHeight,
        };
      } else {
        return {
          rotate,
          noAudioTracks: audioTrack ? false : true,
          thumb: thumbBase64,
          frames: await utils.blobURL2Data(blobURL),
          frameScale: frameScale || 1,
          wave: waveBase64,
          duration,
          videoWidth,
          videoHeight,
          _localThumb: utils.base642URL(thumbBase64),
          _localFrames: blobURL,
          _localWave: waveBase64 ? utils.base642URL(waveBase64) : '',
        };
      }
    }
    case 'sticker': {
      // 解析 .lottie 文件（ZIP 压缩包格式）
      let lottieJson: any;
      let thumb: string | null = null;

      if (file) {
        // 有 File 对象，直接从 buffer 解析
        const buffer = new Uint8Array(await file.arrayBuffer());
        lottieJson = await parseDotLottie(buffer);
      } else {
        // 通过 URL fetch
        const response = await fetch(url);
        const buffer = new Uint8Array(await response.arrayBuffer());
        lottieJson = await parseDotLottie(buffer);
      }

      const w = lottieJson.w || 512;
      const h = lottieJson.h || 512;
      const frameRate = lottieJson.fr || 25;
      const ip = lottieJson.ip || 0;
      const op = lottieJson.op || 60;
      const totalFrames = op - ip;
      const duration = totalFrames / frameRate;

      // 离屏渲染截图
      if (uploadBase64) {
        const thumbBase64 = await renderLottieFrame(lottieJson);
        if (thumbBase64) {
          const [res] = await uploadBase64({
            content: thumbBase64,
            name: utils.createID() + '.png',
            file_type: 'image',
          });
          thumb = res.storage_path;
        }
      }

      return {
        width: w,
        height: h,
        duration,
        frameRate,
        totalFrames,
        thumb: thumb || '',
      };
    }
    default:
      throw new Error('未知文件类型' + url);
  }
}

/**
 * 解析 .lottie 文件（ZIP 压缩包），提取动画 JSON
 */
async function parseDotLottie(buffer: Uint8Array): Promise<any> {
  const unzipped = await new Promise<Unzipped>((resolve, reject) => {
    unzip(buffer, (err, file) => {
      if (err) reject(err);
      resolve(file);
    });
  });

  const manifestFile = strFromU8(unzipped['manifest.json']);
  const manifest: any = JSON.parse(manifestFile);

  if (!('animations' in manifest)) {
    throw new Error('Manifest not found');
  }
  if (!manifest.animations.length) {
    throw new Error('No animations listed in manifest');
  }

  const { id } = manifest.animations[0];
  const lottieString = strFromU8(unzipped[`animations/${id}.json`]);
  const lottieJson = JSON.parse(lottieString);

  // 将内嵌图片转为 base64 data URL
  if (lottieJson.assets) {
    await Promise.all(
      lottieJson.assets.map((asset: any) => {
        const { p } = asset;
        if (!p || !unzipped[`images/${p}`]) return;
        return new Promise<void>(resolveAsset => {
          const ext = p.split('.').pop() || '';
          const assetB64 = uint8ArrayToBase64(unzipped[`images/${p}`]);

          let mimeType: string;
          switch (ext) {
            case 'svg':
            case 'svg+xml':
              mimeType = 'image/svg+xml';
              break;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'webp':
              mimeType = `image/${ext}`;
              break;
            default:
              mimeType = '';
          }
          asset.p = `data:${mimeType};base64,${assetB64}`;
          asset.e = 1;
          resolveAsset();
        });
      }),
    );
  }

  return lottieJson;
}

/**
 * 离屏渲染 lottie 动画，截取第一帧作为封面图
 */
async function renderLottieFrame(lottieJson: any): Promise<string | null> {
  return new Promise(resolve => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    const anim = lottie.loadAnimation({
      container,
      renderer: 'canvas',
      loop: false,
      autoplay: false,
      animationData: lottieJson,
    });

    const w = lottieJson.w || 512;
    const h = lottieJson.h || 512;
    anim.resize(w, h);

    anim.addEventListener('DOMLoaded', () => {
      // 默认取第5帧作为封面图
      anim.goToAndStop(5);

      // 等待一帧确保渲染完成
      requestAnimationFrame(() => {
        let dataURL: string | null = null;
        try {
          //@ts-ignore
          dataURL = (anim.container as HTMLCanvasElement).toDataURL('image/png');
        } catch (e) {
          console.error('Lottie screenshot failed:', e);
        }
        anim.destroy();
        document.body.removeChild(container);
        resolve(dataURL);
      });
    });
  });
}

/**
 * 获取帧图
 * @param url
 * @param aspectRatio
 * @returns
 */
export async function decoderVideoDrawFrameImage(params: {
  url: string;
  aspectRatio: number;
  audioTrack: any;
  videoRotation: number;
  frameScale?: number;
  stepFrameDraw?: number;
  drawRectangle?: boolean;
  frameHeight?: number;
  workerPath: string;
  duration: number; // 部分AI生成的视频获取不到movie_duration
}) {
  return new Promise(resolve => {
    const {
      url,
      aspectRatio,
      duration, // 部分AI生成的视频获取不到movie_duration
      audioTrack,
      videoRotation,
      frameScale,
      frameHeight,
      stepFrameDraw,
      drawRectangle,
      workerPath = '',
    } = params;
    decoderVideo(
      {
        url,
        workerPath: workerPath + '/decode.worker.js',
        aspectRatio,
        frameHeight: 50,
        duration,
        videoRotation,
        noAudioTracks: audioTrack ? false : true,
        frameScale,
        stepFrameDraw,
        drawRectangle,
      },
      'decodeFrameImage',
      data => {
        console.log('---->', data);
        switch (data.type) {
          case 'drawFrameImageSuccess':
            resolve(data.data);
            break;
          case 'drawFrameImageBefore':
            console.log('waiting...');
            break;
          case 'end':
            resolve('end');
            break;
          default:
            console.error(data);
            resolve('error');
        }
      },
    );
  });
}

/**
 * 解码视频，获取数据
 * @param options workerPath: 'decode.worker.js'
 * @param callback
 * // workerInstance.terminate(); 销毁
 */
export function decoderVideo(
  options: {
    url: string;
    workerPath: string;
    aspectRatio: number;
    frameHeight?: number;
    noAudioTracks: boolean;
    videoRotation?: number;
    frameScale?: number;
    stepFrameDraw?: number;
    duration: number;
    drawRectangle?: boolean;
  },
  workerType: 'initDecodeVideo' | 'decodeFrameByTime' | 'decodeFrameImage' | 'destroy',
  callback: (n: any) => void,
) {
  const canvas = document.createElement('canvas');
  const offscreen = (canvas as any).transferControlToOffscreen();
  const demuxDecodeWorker = new Worker(options.workerPath);
  demuxDecodeWorker.postMessage(
    {
      type: workerType,
      canvas: offscreen,
      options: { ...options },
    },
    [offscreen],
  );
  demuxDecodeWorker.onmessage = function (event: any) {
    callback({ data: event.data.data, type: event.data.type, workerInstance: demuxDecodeWorker });
    // canvas.remove();
  };
}

/**
 * 获取图片缩图
 * @param url
 */
export function imageThumb(
  url: string,
  limitWidth: number,
): Promise<{
  _base64: string;
  naturalWidth: number;
  naturalHeight: number;
}> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = async () => {
      const width = limitWidth;
      const height = (img.height / img.width) * limitWidth;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      // 在画布上绘制缩略图
      ctx.drawImage(img, 0, 0, width, height);
      resolve({
        _base64: canvas.toDataURL(),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      });
    };
  });
}

export async function apngArr2FrameImage(
  params: { apng: any; delayFrame: number; totalFrame: number },
  aspectRatio: number,
  frameHeight: number = 50,
) {
  const { apng, delayFrame, totalFrame } = params;
  const frameWidth = aspectRatio * frameHeight;
  // 创建新的纹理替代老的纹理
  const canvas1 = document.createElement('canvas');
  const context = canvas1.getContext('2d', {
    willReadFrequently: true,
  }) as CanvasRenderingContext2D;
  const patchCanvas = document.createElement('canvas');
  const patchContext = patchCanvas.getContext('2d') as CanvasRenderingContext2D;
  patchContext.clearRect(0, 0, apng.width, apng.height);
  canvas1.width = apng.width;
  canvas1.height = apng.height;

  const apngImageData: any[] = [];
  let prevF: any = null; // 完全按你参考代码的 prevF 命名

  // 清空画布（第一帧用）
  context.clearRect(0, 0, canvas1.width, canvas1.height);
  for (let i = 0; i < apng.frames.length; i++) {
    const frame = apng.frames[i];
    if (!frame) return;
    patchCanvas.width = frame.width;
    patchCanvas.height = frame.height;
    const frameImageData = await utils.blobToImageData(frame.imageData as Blob);
    patchContext.putImageData(frameImageData, 0, 0);
    frame.img = patchCanvas; // 对齐参考代码结构
    // 【参考逻辑 1】第一帧特殊处理
    if (i === 0) {
      context.clearRect(0, 0, canvas1.width, canvas1.height);
      prevF = null;
      // 参考代码：第一帧 dispose=2 强转 1
      if (frame.disposeOp === 2) frame.disposeOp = 1;
    }
    // 【参考逻辑 2】处理上一帧 disposeOp
    if (prevF && prevF.disposeOp === 1) {
      context.clearRect(prevF.left, prevF.top, prevF.width, prevF.height);
    } else if (prevF && prevF.disposeOp === 2) {
      if (prevF.iData) {
        context.putImageData(prevF.iData, prevF.left, prevF.top);
      }
    }
    // 【参考逻辑 3】保存当前帧数据（给 dispose=2 恢复用）
    prevF = frame;
    prevF.iData = null;
    if (prevF.disposeOp === 2) {
      prevF.iData = context.getImageData(frame.left, frame.top, frame.width, frame.height);
    }
    // 【参考逻辑 4】blendOp === 0 先清区域
    if (frame.blendOp === 0) {
      context.clearRect(frame.left, frame.top, frame.width, frame.height);
    }
    // 绘制当前帧（完全对齐参考）
    context.drawImage(frame.img, frame.left, frame.top);
    // 保存每一帧画面到序列（你要的结果）
    const imageData = context.getImageData(0, 0, canvas1.width, canvas1.height);
    apngImageData.push(imageData);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const totalTime = Math.ceil(totalFrame * delayFrame);
  canvas.height = frameHeight;
  canvas.width = frameWidth * totalTime;

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  for (let i = 0; i < totalTime; i++) {
    let index = Math.round(i / delayFrame);
    if (index > apng.frames.length - 1) {
      index = apng.frames.length - 1;
    }
    if (apngImageData[index]) {
      tempCanvas.width = apng.width;
      tempCanvas.height = apng.height;
      tempCtx.putImageData(apngImageData[index], 0, 0);
      ctx.drawImage(tempCanvas, i * frameWidth, 0, frameWidth, frameHeight);
    }
  }
  return canvas.toDataURL('image/jpeg', 0.7);
}

/**
 * base64 的gif分解图绘制成帧图
 * @param params { gifArr: string[]; delayFrame: number; totalFrame: number }
 * @param aspectRatio 宽高比
 * @param frameHeight
 * @returns
 */
export async function gifArr2FrameImage(
  params: { gifArr: string[]; delayFrame: number; totalFrame: number },
  aspectRatio: number,
  frameHeight: number = 50,
) {
  const { gifArr, delayFrame, totalFrame } = params;
  const canvas = document.createElement('canvas');
  const frameWidth = aspectRatio * frameHeight;
  const ctx = canvas.getContext('2d');
  const totalTime = Math.ceil(totalFrame * delayFrame);
  canvas.height = frameHeight;
  canvas.width = frameWidth * totalTime;
  // gif 一秒截取一帧
  for (let i = 0; i < totalTime; i++) {
    // 计算是第几帧
    let index = Math.round(i / delayFrame);
    if (index > gifArr.length - 1) {
      index = gifArr.length - 1;
    }
    const _img = (await lazyBase64(gifArr[index])) as HTMLImageElement;
    ctx.drawImage(_img, i * frameWidth, 0, frameWidth, frameHeight);
  }
  return canvas.toDataURL('image/jpeg', 0.7);
}

export function lazyBase64(base64: string) {
  return new Promise(resolve => {
    const _img = new Image();
    _img.crossOrigin = 'anonymous';
    _img.src = base64;
    _img.onload = () => {
      resolve(_img);
    };
  });
}
