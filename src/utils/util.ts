import { config } from '@config/index';
import type { MovieData } from 'video-core-sdk';
import { utils } from 'video-core-sdk';
import dayjs from 'dayjs';
import simpleQueryString from 'simple-query-string';
// import MediaInfoFactory from 'mediainfo.js';
import { getMaterialFileUrl } from '@services/localStorageService';
import pLimit from 'p-limit';

const dateFormatPreset: Record<string, string> = {
  datetime: 'YYYY/MM/DD HH:mm:ss',
  date: 'YYYY/MM/DD',
  time: 'HH:mm:ss',
};

/**
 * 数据清洗，兼容新版本
 */
export function clearData(data: MovieData) {
  if (!Array.isArray(data.captions)) {
    data.captions = [];
  }
  [...data.cameras, ...data.captions, ...data.elements].forEach((item: any) => {
    if (item.clipTime) {
      item.clipTime = timeToNum(item.clipTime || 0);
    }
    item.duration = timeToNum(item.duration || 0);
    item.startTime = timeToNum(item.startTime || 0);
  });
}

/**
 * 取整数
 */
export function toNum(n: number, m?: number) {
  return utils.toNum(n, m);
}

/**
 * 时间精度统一保留两位小数（0.01精度）
 * 用于 duration、startTime、clipTime 等时间相关字段
 */
export function timeToNum(n: number) {
  return utils.timeToNum(n);
}

export function isIOSWechatBrowser() {
  // 获取用户代理字符串
  const ua = window.navigator.userAgent.toLowerCase();

  // 判断是否为微信内置浏览器且是iOS系统
  const isWechat = /micromessenger/.test(ua);
  const isIOS = /iphone|ipad|ipod|ios/.test(ua);

  return isWechat && isIOS;
}

export function isIOS() {
  // 获取用户代理字符串
  const ua = window.navigator.userAgent.toLowerCase();
  // 判断是否为微信内置浏览器且是iOS系统
  const isIOS = /iphone|ipad|ipod|ios/.test(ua);

  return isIOS;
}

/**
 * 将base64图片按新高度等比缩放
 * @param {string} base64 - 原始base64图片
 * @param {number} newHeight - 新的高度
 * @param {string} type - 输出图片类型，默认为'image/png'
 * @param {number} quality - 输出图片质量，默认为0.92
 * @returns {Promise<string>} 缩放后的base64图片
 */
export function resizeBase64Image(base64, newHeight, type = 'image/png', quality = 0.92): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // 处理跨域问题
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // 计算等比缩放的新宽度
      const ratio = img.width / img.height;
      const newWidth = Math.round(newHeight * ratio);

      // 创建Canvas元素
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;

      // 获取2D上下文
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法获取Canvas上下文'));
        return;
      }

      // 设置图片平滑缩放
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 绘制缩放后的图片
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // 转换为新的base64图片
      const resizedBase64 = canvas.toDataURL(type, quality);
      resolve(resizedBase64);
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };

    // 设置图片源
    img.src = base64;
  });
}

/**
 * 异步加载媒体资源
 * @param src
 * @param type
 * @returns
 */
export function mediaLazy(
  src: string,
  time?: number,
  type?: 'video' | 'audio',
): Promise<HTMLVideoElement | HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const media = document.createElement(type || 'video');
    media.preload = 'auto';
    media.crossOrigin = 'Anonymous';
    media.autoplay = false;
    media.src = src;
    media.setAttribute('playsinline', '');
    media.setAttribute('webkit-playsinline', '');
    media.setAttribute('x5-video-player-type', 'h5'); // 针对微信的额外属性
    media.setAttribute('x5-video-player-fullscreen', 'false');
    try {
      media.load();
    } catch (e) {
      console.warn('iOS微信中load()可能受限:', e);
    }

    if (time !== undefined) {
      media.currentTime = time;
    }

    // 如果在微信IOS浏览器中，直接延迟3秒返回对象，因为无法自动触发调用 loadedmetadata 和 canplay
    if (isIOSWechatBrowser()) {
      setTimeout(() => {
        resolve(media);
      }, 3000);
    } else {
      // 监听多个事件以确保兼容性
      const handleLoad = () => {
        console.log('媒体加载成功');
        cleanup();
        resolve(media);
      };

      const handleError = (err: Event | string) => {
        console.error('媒体加载失败', src, err);
        cleanup();
        reject(err);
      };

      const cleanup = () => {
        media.removeEventListener('loadedmetadata', handleLoad);
        media.removeEventListener('canplay', handleLoad);
        media.removeEventListener('error', handleError);
      };
      media.addEventListener('loadedmetadata', handleLoad);
      media.addEventListener('canplay', handleLoad);
      media.addEventListener('error', handleError);
    }
  });
}

export function checkNdata(ndata) {
  const keys = Object.keys(ndata);
  let right = 0;
  const arr = ['title', 'poster', 'width', 'height', 'background', 'transitions', 'captions', 'elements', 'resouces'];
  arr.forEach(key => {
    if (keys.includes(key)) {
      right++;
    }
  });

  return right === arr.length;
}

/**
 * 将File对象转换为JSON数据
 * @param {File} file - 要转换的File对象（应该是JSON文件）
 * @returns {Promise<Object>} 返回解析后的JSON对象
 */
export function fileToJson(file) {
  return new Promise((resolve, reject) => {
    // 检查文件是否存在
    if (!file) {
      reject(new Error('没有提供文件'));
      return;
    }

    // 检查文件类型（可选）
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      reject(new Error('文件不是JSON类型'));
      return;
    }

    // 创建FileReader对象
    const reader = new FileReader();

    // 读取文件完成时的处理
    reader.onload = event => {
      try {
        // 解析JSON字符串为JavaScript对象
        //@ts-ignore
        const jsonData = JSON.parse(event.target.result);
        resolve(jsonData);
      } catch (error) {
        reject(new Error('JSON解析失败: ' + error.message));
      }
    };

    // 读取文件错误时的处理
    reader.onerror = () => {
      reject(new Error('文件读取失败: ' + reader.error.message));
    };

    // 以文本形式读取文件
    reader.readAsText(file);
  });
}

/**
 * 将JSON数据保存为文件并触发下载
 * @param {Object} jsonData - 要保存的JSON数据
 * @param {string} fileName - 保存的文件名（不带扩展名）
 */
export function downloadJson(jsonData, fileName) {
  try {
    // 将JSON对象转换为字符串，缩进2个空格以提高可读性
    const jsonString = JSON.stringify(jsonData, null, 2);

    // 创建一个Blob对象，类型为application/json
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 创建一个下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // 设置文件名，确保带有.json扩展名
    a.download = `${fileName}.json`;

    // 将链接添加到页面并模拟点击
    document.body.appendChild(a);
    a.click();

    // 清理资源
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`JSON数据已成功保存为${fileName}.json`);
  } catch (error) {
    console.error('保存JSON文件时出错:', error);
    alert('保存文件失败，请重试');
  }
}

export async function checkVideoUrlHasAudio(url: string, type?: string) {
  // 检查格式
  const ext = type || utils.getFileTypeFromFileName(url);
  if (['aac', 'mp3', 'wav'].includes(ext)) {
    return true;
  }
  if (ext !== 'video') return false;
  const file = await getVideoFile(url);
  return new Promise(resolve => {
    (window as any).MediaInfo.mediaInfoFactory(
      {
        format: 'object',
        // locateFile: path => {
        //   if (path.endsWith('.wasm')) {
        //     return '/assets/MediaInfoModule.wasm'; // 自定义路径
        //   }
        //   return path; // 其他文件使用默认路径
        // },
      },
      mediainfo => {
        mediainfo
          .analyzeData(
            file.size,
            async (chunkSize, offset) => new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer()),
          )
          .then(result => {
            const audioTrack = result.media.track.find(d => d['@type'] === 'Audio');
            resolve(audioTrack ? true : false);
          })
          .catch(error => {
            console.error(`An error occured:\n${error.stack}`);
            resolve(false);
          });
      },
    );
  });
}

export async function getVideoFile(url: string, fileName = 'video.mp4') {
  try {
    // 使用 fetch 下载视频数据
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`无法获取视频: ${response.statusText}`);
    }
    // 将响应转换为 Blob
    const blob = await response.blob();
    // 使用 Blob 创建一个 File 对象
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  } catch (error) {
    console.error('获取视频文件失败:', error);
    throw error;
  }
}

/**
 * 碰撞检测，box1 和 box2 是否碰撞
 */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}
export function crashRects(box1: Box, box2: Box): boolean {
  const { x: x1, y: y1, width: width1, height: height1 } = box1;
  let { x: x2, y: y2, width: width2, height: height2 } = box2;
  let isCrash = true;
  if (x1 + width1 < x2 || x2 + width2 < x1 || y1 + height1 < y2 || y2 + height2 < y1) {
    isCrash = false;
  }
  return isCrash;
}

// 普通时间格式转成秒
export const timeToSec = (time: string): number => {
  const timeArr = time.split(':');
  const hour = Number(timeArr[0]);
  const minute = Number(timeArr[1]);
  const sec = timeArr[2];
  return Number(3600 * hour) + Number(60 * minute) + Number(sec);
};

export function reJSON(data: any) {
  if (typeof data === 'string') {
    return JSON.parse(data);
  } else {
    return data;
  }
}

/**
 * 获取文件名称
 */
export function getFileNameFromUrl(url) {
  try {
    // 解析URL
    const parsedUrl = new URL(url);
    let path = parsedUrl.pathname;

    // 移除路径末尾的斜杠
    if (path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    // 获取路径最后一段（可能包含文件名）
    let fileName = path.split('/').pop() || '';

    // 如果没有获取到文件名，检查查询参数
    if (!fileName) {
      // 尝试从查询参数中寻找类似文件名的参数
      const params = parsedUrl.searchParams;
      const fileParams = ['file', 'filename', 'name', 'download'];

      for (const param of fileParams) {
        if (params.has(param)) {
          fileName = params.get(param);
          break;
        }
      }
    }

    // 处理可能包含的URL编码（如中文）
    fileName = decodeURIComponent(fileName);

    // 移除可能的查询参数或锚点残留
    const queryIndex = fileName.indexOf('?');
    if (queryIndex !== -1) {
      fileName = fileName.substring(0, queryIndex);
    }

    const hashIndex = fileName.indexOf('#');
    if (hashIndex !== -1) {
      fileName = fileName.substring(0, hashIndex);
    }

    return fileName || null; // 如果最终没有找到文件名，返回null
  } catch (e) {
    console.error('解析URL失败:', e);
    return null;
  }
}

/**
 * 获取文件后缀
 */
export function getFileExtension(url: string) {
  url = url.split('?')[0];
  const pathArray = url.split('.');
  if (pathArray.length > 1) {
    return pathArray.pop().toLowerCase();
  } else {
    return null; // 没有后缀名
  }
}

/**
 * 获取文件的类型 audio video image
 */
export function getFileTypeByURL(url: string, ext?: string) {
  if (!ext) {
    ext = getFileExtension(url);
  }
  if (ext) {
    switch (ext.toLocaleLowerCase()) {
      case 'png':
      case 'jpeg':
      case 'jpg':
      case 'gif':
      case 'svg':
        return 'image';
      case 'aac':
      case 'wav':
      case 'mp3':
        return 'audio';
      case 'mp4':
      case 'webm':
      case 'mov':
      case 'avi':
      case 'mkv':
        return 'video';
      case 'lottie':
        return 'sticker';
      default:
        return null;
    }
  } else {
    return null;
  }
}

/**
 * 绘制视频帧图，返回base64
 * @param video
 * @param limitWidth
 */
export async function drawVideoFrame(video: HTMLVideoElement, limitWidth: number, time?: number) {
  video = video.cloneNode() as any;
  video.muted = true;
  video.currentTime = time || 1;
  await video.play();
  video.pause();
  const canvas = document.createElement('canvas'),
    width = video.videoWidth, //canvas的尺寸和图片一样
    height = video.videoHeight;
  const scale = limitWidth / width;
  canvas.width = limitWidth;
  canvas.height = Math.floor(height * scale);
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height); //绘制canvas
  const thumb = canvas.toDataURL('image/jpeg');
  return thumb;
}

/**
 * 数组每chunkSize个元素进行分组 [1,2,3,4,5] = 3 => [[1,2,3], [4,5]]
 * @param arr
 * @param chunkSize
 * @returns
 */
export function splitArray(arr: any[], chunkSize: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

// 秒转为普通时间
export const secToTime = (s: number, str?: string, toFixed?: number): string => {
  if (str === undefined) {
    str = 'hhmmss';
  }
  const hour: number = parseInt(s / 3600 + '');
  const minute: number = parseInt((s - hour * 3600) / 60 + '');
  const sec: number = s - hour * 3600 - minute * 60;
  const H: number | string = hour > 9 ? hour : '0' + hour;
  const M: number | string = minute > 9 ? minute : '0' + minute;
  let S: number | string = sec > 9 ? sec : '0' + sec;
  S = parseFloat(S + '').toFixed(toFixed === undefined ? 2 : toFixed);
  if (str === 'mmss') {
    return M + ':' + S;
  } else {
    return H + ':' + M + ':' + S;
  }
};

export function randomNum(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export const toTime = (s: number): string => {
  const hour: number = parseInt(s / 3600 + '');
  const minute: number = parseInt((s - hour * 3600) / 60 + '');
  const sec: number = s - hour * 3600 - minute * 60;
  const H: number | string = hour > 9 ? hour : '0' + hour;
  const M: number | string = minute > 9 ? minute : '0' + minute;
  const S: number | string = sec > 9 ? parseInt(sec + '') : '0' + parseInt(sec + '');
  let MS: number | string;
  if ((s + '').indexOf('.') > -1) {
    MS = Number((s + '').substring((s + '').indexOf('.'))) * 1000;
  } else {
    MS = 0;
  }
  MS = parseInt(MS + '', 10);
  MS = MS > 10 ? MS : '0' + MS;
  if (s < 3600) {
    return M + ':' + S + ':' + MS;
  } else {
    return H + ':' + M + ':' + S + ':' + MS;
  }
};

export const getPlatform = (): string => {
  const isWin: boolean = navigator.platform == 'Win32' || navigator.platform == 'Windows';
  if (isWin) return 'Win';
  const isMac: boolean =
    navigator.platform == 'Mac68K' ||
    navigator.platform == 'MacPPC' ||
    navigator.platform == 'Macintosh' ||
    navigator.platform == 'MacIntel';
  if (isMac) return 'Mac';
  return '';
};

/**
 * 秒转换成 mm:ss 时间
 */
export const secondToTime = (t: number): string => {
  let m: number | string = Math.floor(t / 60);
  if (m < 10) {
    m = '0' + m;
  }
  return m + ':' + ((t % 60) / 100).toFixed(2).slice(-2);
};

export const formatTime = (time: number): string => {
  time = parseInt(time + '', 10);
  let mm: number | string = parseInt(time / 60 + '', 10);
  let ss: number | string = time - mm * 60;
  if (mm < 10) {
    mm = '0' + mm;
  }
  if (ss < 10) {
    ss = '0' + ss;
  }
  return `${mm}:${ss}`;
};

/**
 * 拼接URL资源路径
 */
function joinURL(base: string, url: string) {
  const joinedPath = url;
  return base.replace(/\/+$/, '') + '/' + joinedPath.replace(/^\/+/, '');
}

/**
 * 处理资源URL，如果是base64或blob URL则直接返回，否则拼接resourceHost
 */
export function reURL(url: string = '', resourceHost: string = '') {
  if (!url) return '';
  if (url.startsWith('data:image')) {
    return url;
  }
  if (url.startsWith('blob:http')) {
    return url;
  }
  if (!/https?:\/\/.+/i.test(url)) {
    return joinURL(resourceHost, url);
  } else {
    return url;
  }
}

/**
 * 将Blob URL转换为Base64数据
 */
export function blobURL2Data(url: string) {
  return new Promise(resolve => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onload = function () {
      var blob = xhr.response;
      var reader = new FileReader();
      reader.onloadend = function () {
        var base64data = reader.result;
        resolve(base64data);
      };
      reader.readAsDataURL(blob);
    };
    xhr.send();
  });
}

/**
 * 将Blob URL转换为Base64
 */
export async function blobUrlToBase64(blobUrl: string): Promise<string> {
  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态: ${response.status}`);
    }
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('转换Blob URL到Base64时出错:', error);
    throw error;
  }
}

/**
 * 从URL中获取文件数据
 */
export async function fetchFile(url: string) {
  return await fetch(url as any, {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
  }).then(async response => {
    let buffer = await response.arrayBuffer();
    let u8array = new Uint8Array(buffer);
    return u8array;
  });
}

/**
 * 图层排序。从[0,1,2,3,4,5] 从3拖到0
 */
export const sortArray = (elements: any[], from: number, to: number): void => {
  // 把from插入到to的位置
  const fromData = elements[from];
  elements.splice(from, 1); // 删除
  elements.splice(to, 0, fromData);
};

/**
 * 将对象转换为querystring，如 {a: 1, b: 2} 转换为 a=1&b=2
 * @param {object} data Query对象
 * @returns 字符串querystring
 */
export const data2QueryString = (data: any[]): string => {
  const str: any[] = [];
  if (data) {
    for (const key in data) {
      str.push(`${key}=${data[key]}`);
    }
  }
  return str.join('&');
};

/**
 * 获取QueryString的值，如果不传name，则返回整个query对象
 * @param {string} name 要查询的 querystring 名称
 */
export const getUrlQuery = (name?: string): string | { [key: string]: any } => {
  const params: { [key: string]: any } = simpleQueryString.parse(location.href);
  return name ? params[name] : params;
};

/**
 * 删除URL参数
 * @param {*} paramKey
 */
export const delUrlParam = (paramKey: string): string => {
  let url = window.location.href; //页面url
  const urlParam: string = window.location.search.substr(1); //页面参数
  let nextUrl = '';
  const arr = [];
  if (urlParam != '') {
    const urlParamArr = urlParam.split('&'); //将参数按照&符分成数组
    for (let i = 0; i < urlParamArr.length; i++) {
      const paramArr = urlParamArr[i].split('='); //将参数键，值拆开
      //如果键雨要删除的不一致，则加入到参数中
      if (paramArr[0] != paramKey) {
        arr.push(urlParamArr[i]);
      }
    }
  }
  if (arr.length > 0) {
    nextUrl = '?' + arr.join('&');
  }
  url = nextUrl;
  return url;
};

/**
 *
 * @desc   判断是否为URL地址
 * @param  {String} str
 * @return {Boolean}
 */
export const isUrl = (str: string): boolean => {
  return /https?:\/\/.+/i.test(str);
};

/**
 *
 * @desc   判断是否为手机号
 * @param  {String|Number} str
 * @return {Boolean}
 */
export const isPhoneNum = (str: string): boolean => {
  return /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test(str);
};

/**
 * @desc 数组去重
 */
export const uniq = (arr: any[], param: any): any[] => {
  return uniq(arr, param);
};

/**
 * 深拷贝对象
 * @param {*} value 要拷贝的对象
 */
export const cloneDeep = (value: any): any => {
  return cloneDeep(value);
};

export const clearSleep = (): void => {
  const _window = window as any;
  if (!_window['CORE_UTILS_SLEEPS']) {
    return;
  }
  _window['CORE_UTILS_SLEEPS'].forEach((d: any) => {
    clearTimeout(d);
  });
  _window['CORE_UTILS_SLEEPS'] = [];
};

export const sleep = (time: number) => {
  const _window = window as any;
  if (!_window['CORE_UTILS_SLEEPS']) {
    _window['CORE_UTILS_SLEEPS'] = [];
  }
  return new Promise<void>(resolve => {
    const timer = setTimeout(() => {
      resolve();
    }, time);
    _window['CORE_UTILS_SLEEPS'].push(timer);
  });
};

export const toJS = (obj: { [key: string]: any } | []) => {
  return JSON.parse(JSON.stringify(obj));
};

export const onlyNumber = (value: string): string => {
  const reg = /[0-9]/g;
  if (reg.test(value)) {
    return value;
  } else {
    return '';
  }
};

export const loadSource = (type: 'video' | 'audio', url: string): Promise<HTMLElement> => {
  return new Promise((resolve, reject) => {
    const source = document.createElement(type);
    source.src = url;
    source.addEventListener('loadedmetadata', function () {
      resolve(source);
    });
    source.onerror = () => {
      reject(source);
    };
  });
};

export const imgLazy = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = function () {
      resolve(img);
    };
    img.onerror = function () {
      console.error('图片加载失败', src, img);
      reject(img);
    };
  });
};

/**
 * 随机
 * @param randomLength
 * @returns
 */
export function randomID(randomLength = 8): string {
  return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36);
}

export const formatDate = (date: string | number | Date = new Date(), format = 'datetime') => {
  return dayjs(date).format(dateFormatPreset[format] || format);
};

export async function download(url: string, name: string) {
  // let response = await fetch(url); // 内容转变成blob地址
  // let blob = await response.blob();  // 创建隐藏的可下载链接
  // let objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  a.remove();
}

/**
 * 将本地资源路径（materials/ 开头）转为 blob URL
 * 非 materials/ 开头的路径直接原样返回
 * @param url 资源路径或 URL
 * @returns blob URL（本地资源）或原始 URL（远程资源）
 */
export async function resolveLocalUrl(url: string): Promise<string> {
  if (!url || !url.startsWith('materials/')) return url;
  const blobUrl = await getMaterialFileUrl(url);
  return blobUrl || url;
}

// /**
//  * 判断元素是否重叠
//  */
// interface CheckElementCrashParams {
//   startTime: number;
//   duration: number;
//   speed: number;
// }
// export function checkElementCrash(elem1: CheckElementCrashParams, elem2: CheckElementCrashParams) {
//   if(elem2.startTime > elem1.startTime && elem2.startTime < elem1.startTime + elem1.duration) {}
// }
