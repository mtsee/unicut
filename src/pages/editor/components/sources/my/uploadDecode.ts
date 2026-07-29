/**
 * 前端视频转码工具（基于 ffmpeg.wasm）
 *
 * 校验是否需要转码的条件：
 * 1. 非 mp4 格式
 * 2. 编码格式非 h264
 * 3. 色彩编码非 yuv420p
 * 4. 色彩原色为 bt2020（HDR→SDR）
 *
 * 用法：
 *   const result = await checkAndConvert(videoUrl, {
 *     onProgress: (p) => console.log(p.percent + '%'),
 *   });
 *   // result.url 为转码后的 blob URL
 */

import { toBlobURL } from '@ffmpeg/util';

const win = window as any;

export interface ConvertOptions {
  file: File;
  type: string;
  ext: string;
  baseURL?: string; // ffmpeg.wasm 资源路径，默认 '/assets/ffmpeg'
  onProgress?: (info: { percent: number }) => void;
  onLog?: (msg: string) => void;
}

export interface ConvertResult {
  url: string; // 转码后的 blob URL
  converted: boolean; // 是否执行了转码
  metadata: VideoMetadata;
}

export interface VideoMetadata {
  codecName: string;
  pixFmt: string;
  colorPrimaries: string;
  width: number;
  height: number;
  ext: string;
}

/**
 * 通过 fetch 下载文件并转为 Uint8Array
 */
async function fetchFileToBuffer(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const buffer = await res.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * 创建新的 ffmpeg.wasm 实例
 */
async function createFFmpeg(baseURL = '/assets/ffmpeg'): Promise<any> {
  const ffmpeg = new win.FFmpegWASM.FFmpeg();
  ffmpeg.on('log', (info: any) => {
    console.log(info.message);
  });
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  return ffmpeg;
}

/**
 * 确保全局 ffmpeg.wasm 实例已加载（给 MovieEncoding 等其他模块共用）
 */
async function ensureFFmpeg(baseURL = '/assets/ffmpeg'): Promise<any> {
  if (win._ffmpegWASMInstance?.loaded) {
    return win._ffmpegWASMInstance;
  }
  const ffmpeg = await createFFmpeg(baseURL);
  ffmpeg.on('log', (info: any) => {
    // console.log('[ffmpeg]', info.message);
  });
  win._ffmpegWASMInstance = ffmpeg;
  return ffmpeg;
}

/**
 * 销毁 ffmpeg 实例并清理全局引用
 */
function destroyFFmpeg(): void {
  try {
    win._ffmpegWASMInstance?.terminate?.();
  } catch {
    // ignore
  }
  win._ffmpegWASMInstance = null;
}

/**
 * 校验是否需要转码
 */
function needConvert(
  meta: any,
  type: 'video' | 'audio',
): {
  convert: boolean;
  cv: string;
  ca: string;
  vf: string;
} {
  let cv = 'copy';
  let ca = 'copy';
  let vf = '';
  let convert = false;

  const videoTrack = meta.track.find(track => track['@type'].toLowerCase() === 'video');

  if (!videoTrack) {
    return { convert, cv, ca, vf };
  }
  const isMP4 = 'mp4';
  const isH264 = videoTrack.Encoded_Library_Name === 'h264';
  const isYUV420 = videoTrack.ColorSpace.toUpperCase() === 'YUV';
  const isBT709 = videoTrack.colour_primaries.toUpperCase() === 'BT.709';
  const isBT2020 = videoTrack.colour_primaries.toUpperCase() === 'BT.2020';

  if (!isMP4 || !isYUV420 || !isBT709) {
    convert = true;
  }
  // HDR bt2020 → SDR bt709
  if (isBT2020) {
    vf = 'zscale=t=linear:npl=120,tonemap=hable:desat=0,zscale=m=bt709:p=bt709:t=bt709:r=tv,format=yuv420p';
    cv = 'libx264';
  }

  // 非 h264 编码需转码
  if (!isH264) {
    cv = 'libx264';
    convert = true;
  }
  return { convert, cv, ca, vf };
}

/**
 * 生成 ffmpeg 输出参数
 */
function buildOutputArgs(vf: string, cv: string, ca: string): string[] {
  const args: string[] = [];

  if (vf) {
    args.push('-vf', vf);
  } else {
    args.push('-pix_fmt', 'yuv420p');
  }

  args.push('-c:v', cv);
  args.push('-c:a', ca);
  args.push('-movflags', '+faststart');
  args.push('-y');

  return args;
}

/**
 * 调用 ffmpeg 执行转码（带进度回调，用完后清理监听器）
 */
async function execFFmpeg(
  ffmpeg: any,
  inputName: string,
  outputName: string,
  args: string[],
  onProgress?: (info: { percent: number }) => void,
): Promise<void> {
  let progressHandler: ((info: any) => void) | null = null;

  if (onProgress) {
    progressHandler = ({ progress }: any) => {
      onProgress({ percent: Math.round(progress * 100) });
    };
    ffmpeg.on('progress', progressHandler);
  }

  try {
    console.log('ffmpeg exec', ['-i', inputName, ...args, outputName]);
    await ffmpeg.exec(['-i', inputName, ...args, outputName]);
  } finally {
    if (progressHandler) {
      ffmpeg.off('progress', progressHandler);
    }
  }
}

function mediaInfo(file: File): Promise<any> {
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
 * 检测视频并转码（如果需要）
 *
 * @param url       视频 URL 或 blob URL
 * @param options   可选配置
 * @returns         转码结果（含 blob URL 与元数据）
 */
export async function checkAndConvert(url: string, options: ConvertOptions): Promise<ConvertResult> {
  const { baseURL = '/assets/ffmpeg', onProgress, onLog } = options;

  // 解析文件扩展名
  const urlPath = url.split('?')[0];
  const ext = options.ext || urlPath.split('.').pop()?.toLowerCase() || 'mp4';
  const type = options.type || ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext) ? 'video' : 'audio';

  // 如果非mp4，直接强制转换为mp4
  if (!['mp4'].includes(ext)) {
    return forceConvert(url, options);
  }

  // 探测元数据（用独立实例，用完即销毁）
  onLog?.('正在分析视频信息...');
  const metadata = await mediaInfo(options.file);

  // 判断是否需要转码
  const check = needConvert(metadata, type);

  if (!check.convert) {
    onLog?.('视频无需转码，直接使用原文件');
    return { url, converted: false, metadata };
  }

  // 执行转码：用独立实例，确保干净的 FS
  onLog?.('开始转码...');
  onProgress?.({ percent: 0 });

  const suffix = Date.now();
  const inputName = `source_${suffix}.${ext}`;
  const outputName = `output_${suffix}.mp4`;
  const inputData = await fetchFileToBuffer(url);

  // 销毁旧的全局实例（如果 probe 污染了它），用全新实例做转码
  destroyFFmpeg();

  const ffmpeg = await createFFmpeg(baseURL);

  await ffmpeg.writeFile(inputName, inputData);

  const outputArgs = buildOutputArgs(check.vf, check.cv, check.ca);
  await execFFmpeg(ffmpeg, inputName, outputName, outputArgs, onProgress);

  // 读取转码结果
  const outputData = await ffmpeg.readFile(outputName);
  const blob = new Blob([outputData.buffer], { type: 'video/mp4' });
  const blobUrl = URL.createObjectURL(blob);

  // 清理
  try {
    await ffmpeg.deleteFile(inputName);
  } catch {
    /* ignore */
  }
  try {
    await ffmpeg.deleteFile(outputName);
  } catch {
    /* ignore */
  }
  try {
    ffmpeg.terminate();
  } catch {
    /* ignore */
  }
  win._ffmpegWASMInstance = null;

  onProgress?.({ percent: 100 });
  onLog?.('转码完成');

  return { url: blobUrl, converted: true, metadata };
}

/**
 * 仅转码（跳过检测），直接强制转为 mp4/h264/yuv420p
 */
export async function forceConvert(url: string, options: ConvertOptions): Promise<ConvertResult> {
  const { baseURL = '/assets/ffmpeg', onProgress, onLog } = options;

  const urlPath = url.split('?')[0];
  const ext = options.ext || urlPath.split('.').pop()?.toLowerCase() || 'mp4';

  onLog?.('开始强制转码...');
  onProgress?.({ percent: 0 });

  const suffix = Date.now();
  const inputName = `source_${suffix}.${ext}`;
  const outputName = `output_${suffix}.mp4`;
  const inputData = await fetchFileToBuffer(url);

  // 使用独立实例
  destroyFFmpeg();
  const ffmpeg = await createFFmpeg(baseURL);

  await ffmpeg.writeFile(inputName, inputData);

  const outputArgs = ['-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-c:a', 'aac', '-movflags', '+faststart', '-y'];

  await execFFmpeg(ffmpeg, inputName, outputName, outputArgs, onProgress);

  const outputData = await ffmpeg.readFile(outputName);
  const blob = new Blob([outputData.buffer], { type: 'video/mp4' });
  const blobUrl = URL.createObjectURL(blob);

  try {
    await ffmpeg.deleteFile(inputName);
  } catch {
    /* ignore */
  }
  try {
    await ffmpeg.deleteFile(outputName);
  } catch {
    /* ignore */
  }
  try {
    ffmpeg.terminate();
  } catch {
    /* ignore */
  }
  win._ffmpegWASMInstance = null;

  onProgress?.({ percent: 100 });
  onLog?.('强制转码完成');

  return {
    url: blobUrl,
    converted: true,
    metadata: { codecName: '', pixFmt: '', colorPrimaries: '', width: 0, height: 0, ext },
  };
}
