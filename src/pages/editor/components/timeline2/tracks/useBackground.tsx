import React, { useCallback, useState, useEffect } from 'react';
import { config } from '../config';
import type { BaseElement, ImageElement, VideoElement } from 'video-core-sdk';
import { util } from '@utils/index';
import AudioSVGWaveform from '@pages/editor/tools/audioWaveFormSvgPath';
import { utils } from 'video-core-sdk';
import $ from 'jquery';
import { config as iconfig } from '@config/index';
import { getUploadBeforeData } from '@pages/editor/tools/uploadBeforeData';
import { stores } from '@stores/index';
import { updateMaterialAttrs, createLocalUploadBase64 } from '@services/localStorageService';

type Props = {
  element: BaseElement;
  scale: number;
  avgSpeed: number;
};

const cacheWavePeaks: Record<string, number[]> = {};

const useBackground = (
  props: Props,
): [
  Record<string, any>,
  Record<string, any>,
  {
    blobURL: string;
    width: number;
  }[],
] => {
  const { editor } = stores;
  const { element, scale, avgSpeed } = props;
  const clipTime = (element as any).clipTime || 0;
  const { separate } = element as VideoElement;

  const [backgroundFrames, setBackgroundFrames] = useState<{ blobURL: string; width: number }[]>([]);
  const [audioWaves, setAudioWaves] = useState<{ blobURL: string; width: number }[]>([]);

  // 通过音波数据生成音波图
  const setAudioWaveImages = useCallback(
    async (audioWaveURL: string, resourceDuration: number, reverse?: boolean) => {
      // json数据缓存一次，避免重复获取数据
      const { reURL, resourceManage } = editor.movie;
      if (!audioWaveURL) {
        const resource = resourceManage.getResouceById((element as VideoElement).resourceId);
        console.warn('该资源无音波数据', resource, element);
        if (resource.noAudioTracks) {
          console.warn('无音波数据，不做任何处理');
          return;
        }
        // 重新获取音波数据
        const localUploadBase64 = editor.useLocalStorage
          ? createLocalUploadBase64(`materials/${editor.appid}/${resource.type}`)
          : undefined;
        const uploadBase64 = editor.useLocalStorage ? localUploadBase64 : editor.apiServer.uploadBase64;
        // 通过resource.url 从缓存中获取blob url
        const cachedBlobURL = resourceManage.getCachedBlobUrl(resource.url);
        
        const res = await getUploadBeforeData({
          url: cachedBlobURL,
          type: 'audio',
          workerPath: iconfig.workerPath,
          uploadBase64,
          file: null,
          reURL: reURL,
        });
        resource.attrs.wave = res.wave;
        audioWaveURL = res.wave;
        // 缓存数据
        await resourceManage.fetchBlob(res.wave);

        // 同步更新 IndexedDB
        if (resource.originId && editor.useLocalStorage) {
          updateMaterialAttrs(resource.originId, {
            wavePath: res.wave,
          }).catch(e => console.warn('同步 IndexedDB 音波数据失败:', e));
        }
      } else {
        await resourceManage.fetchBlob(audioWaveURL);
      }

      if (!editor.movie) return;

      const blobURL = resourceManage.getCachedBlobUrl(audioWaveURL) || reURL(audioWaveURL);
      let peaks = cacheWavePeaks[audioWaveURL] ? cacheWavePeaks[audioWaveURL] : await $.get(reURL(blobURL));
      if (!cacheWavePeaks[audioWaveURL]) {
        cacheWavePeaks[audioWaveURL] = peaks;
      }

      if (reverse) {
        peaks = peaks.reverse();
      }
      const waveInstance = new AudioSVGWaveform({ maxWidth: 6000 });
      const images = await waveInstance.images(scale * resourceDuration, avgSpeed, peaks);
      setAudioWaves(
        images.map(d => {
          return { blobURL: d, width: 6000 };
        }),
      );
    },
    [scale, avgSpeed, editor],
  );

  // 通过1s帧图获取背景图
  const setVideoBackgroundFrames = useCallback(
    async (options: {
      framesURL: string;
      resourceDuration: number;
      aspectRatio: number;
      reverse?: boolean;
      frameScale?: number;
    }) => {
      const { reURL, resourceManage } = editor.movie;
      if (!options.framesURL) {
        const resource = resourceManage.getResouceById((element as VideoElement).resourceId);
        console.warn('该资源无帧图，会重新获取', element, resource);
        if (!resource) return;
        // 重新获取帧图数据
        const localUploadBase64 = editor.useLocalStorage
          ? createLocalUploadBase64(`materials/${editor.appid}/${resource.type}`)
          : undefined;
        const uploadBase64 = editor.useLocalStorage ? localUploadBase64 : editor.apiServer.uploadBase64;

        // 通过resource.url 从缓存中获取blob url
        await resourceManage.fetchBlob(resource.url);
        const cachedBlobURL = resourceManage.getCachedBlobUrl(resource.url) || reURL(resource.url);
        const res = await getUploadBeforeData({
          url: cachedBlobURL,
          type: resource.type,
          workerPath: iconfig.workerPath,
          uploadBase64,
          reURL: reURL,
        });
        resource.noAudioTracks = res.noAudioTracks;
        resource.attrs.frames = res.frames;
        resource.attrs.frameScale = res.frameScale;
        options.framesURL = res.frames;
        options.frameScale = res.frameScale;

        // 缓存数据
        await resourceManage.fetchBlob(res.frames);

        // 同步更新 IndexedDB
        if (resource.originId && editor.useLocalStorage) {
          updateMaterialAttrs(resource.originId, {
            framesPath: res.frames,
            frameScale: res.frameScale,
            noAudioTracks: res.noAudioTracks,
          }).catch(e => console.warn('同步 IndexedDB 帧图数据失败:', e));
        }
      } else {
        await resourceManage.fetchBlob(options.framesURL);
      }

      if (!editor.movie) return;

      const { framesURL, resourceDuration, aspectRatio, reverse } = options;

      const resFramesURL = editor.movie.resourceManage.getCachedBlobUrl(framesURL) || reURL(framesURL);

      const _img = (await utils.lazyImage(resFramesURL)) as HTMLImageElement;

      let frameScale = options.frameScale || 1;

      // 帧图frameScale是以50高度的倍数来计算的，显示的尺寸是40高度来计算的，所以缩放比例还要乘以5/4
      if (options.frameScale === 2) {
        frameScale *= 5 / 4;
      }

      // 帧图高度小于50的截图来源服务端截图，frameScale默认是1，这里对老数据进行纠错处理
      if (_img.naturalHeight < 50) {
        frameScale *= _img.height / 50;
      }

      const frameHeight = config[`${element.type}Track`];
      const frameWidth = frameHeight * aspectRatio;
      // 画布最大宽度是3000，如果超出3000，会分割成多个画布
      const canvasMaxWidth = 3000;
      // 视频的最大长度
      const frameImageTotalWidth = (resourceDuration / avgSpeed) * scale;
      // console.log('frameImageTotalWidth', frameImageTotalWidth);
      const canvas = document.createElement('canvas');
      canvas.height = frameHeight; // 默认是50
      canvas.width = Math.min(canvasMaxWidth, frameImageTotalWidth);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // 循环绘制，画几帧
      const drawFrameNum = Math.ceil(frameImageTotalWidth / frameWidth) + 1;
      // 需要让时间和图片对应起来
      const timeScale = (frameWidth / scale) * avgSpeed;
      const canvasNum = Math.ceil(frameImageTotalWidth / canvasMaxWidth);
      const images: string[] = [];
      let startDrawIndex = 0;
      const frameValues = [];
      for (let i = 0; i < canvasNum; i++) {
        for (let j = startDrawIndex; j < drawFrameNum; j++) {
          // frameIndex表示当前绘制第几帧图
          let frameIndex = Math.floor(timeScale * j) * frameWidth;
          if (frameIndex > _img.naturalWidth - frameWidth) {
            frameIndex = _img.naturalWidth - frameWidth;
          }
          const x = (j - startDrawIndex) * frameWidth;
          if (x <= canvasMaxWidth) {
            frameValues.push({ x, frameIndex });
          } else {
            startDrawIndex = j;
            break;
          }
        }
        // 如果是倒放视频，要逆转视频帧
        if (reverse) {
          const len = frameValues.length;
          frameValues.forEach((res, i) => {
            const frameIndex = frameValues[len - i - 1]?.frameIndex;
            if (frameIndex) {
              // [frameIndex, 0] 是 图片的截取坐标 x,y
              ctx.drawImage(
                _img,
                frameIndex * frameScale,
                0,
                frameWidth * frameScale,
                frameHeight * frameScale,
                res.x,
                0,
                frameWidth,
                frameHeight,
              );
            }
          });
        } else {
          frameValues.forEach(res => {
            // [frameIndex, 0] 是 图片的截取坐标 x,y
            ctx.drawImage(
              _img,
              res.frameIndex * frameScale,
              0,
              frameWidth * frameScale,
              frameHeight * frameScale,
              res.x,
              0,
              frameWidth,
              frameHeight,
            );
          });
        }

        const base64 = canvas.toDataURL('image/png');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        images.push(utils.base642URL(base64));
      }
      setBackgroundFrames(
        images.map(d => {
          return { blobURL: d, width: canvas.width };
        }),
      );
      canvas.remove();
    },
    [scale, avgSpeed, editor],
  );

  const ostyle: Record<string, any> = {
    backgroundColor: config[`${element.type}Color`],
  };
  const audioWaveStyle: Record<string, any> = {};

  if (['video', 'image'].includes(element.type)) {
    const resource = editor.movie.resourceManage.getResouceById((element as any).resourceId);
    if (resource) {
      const thumbURL = editor.movie.resourceManage.getCachedBlobUrl(resource.thumb) || editor.movie.reURL(resource.thumb);
      console.log('thumbURL>>>>>>>>>>', thumbURL);
      ostyle.backgroundImage = `url(${thumbURL})`;
      if (backgroundFrames.length) {
        delete ostyle.backgroundImage;
        // 帧图的偏移量
        const frameImageOffsetLeft = scale * clipTime;
        if (element.type === 'image') {
          ostyle.background = backgroundFrames.map((d, i) => {
            return `url(${d.blobURL}) ${i * d.width - frameImageOffsetLeft - 1}px -1px repeat-x`;
          });
        } else {
          ostyle.background = backgroundFrames.map((d, i) => {
            return `url(${d.blobURL}) ${i * d.width - frameImageOffsetLeft - 1}px -1px no-repeat`;
          });
        }
      }
    }
  }
  if (['video', 'audio'].includes(element.type)) {
    if (audioWaves.length) {
      // 帧图的偏移量
      const frameImageOffsetLeft = scale * clipTime;
      audioWaveStyle.background = audioWaves
        .map((d, i) => {
          return `url(${d.blobURL}) ${i * d.width - frameImageOffsetLeft}px 0px no-repeat`;
        })
        .join(',');
    }
  }

  useEffect(() => {
    if (!editor.movie) return;
    // 帧图的原始高度
    const frameImageHeight = 50;
    if (element.type === 'video') {
      const resource = editor.movie.resourceManage.getResouceById((element as any).resourceId);
      if (!resource) return;
      if (!resource.attrs) {
        resource.attrs = {};
      }
      setVideoBackgroundFrames({
        framesURL: resource.attrs.frames,
        resourceDuration: resource.duration,
        aspectRatio: resource.styleSize.width / resource.styleSize.height,
        reverse: resource.reverse,
        frameScale: resource.attrs?.frameScale ? resource.attrs?.frameScale : frameImageHeight / config.videoTrack,
      });

      // 音视频分离之后没有音波数据
      if (separate) {
        setAudioWaves([]);
      }
    }
    if (element.type === 'image') {
      // const resource = editor.movie.resourceManage.getResouceById((element as any).resourceId);
      // gif 图片
      // if (resource?.frames) {
      //   setVideoBackgroundFrames({
      //     framesURL: resource.frames, // gif 的 帧图
      //     resourceDuration: resource.duration,
      //     aspectRatio: resource.styleSize.width / resource.styleSize.height,
      //     reverse: resource.reverse,
      //     frameScale: resource.attrs?.frameScale ? resource.attrs?.frameScale : frameImageHeight / config.videoTrack,
      //   });
      // }
    }

    if (element.type === 'audio') {
      const resource = editor.movie.resourceManage.getResouceById((element as any).resourceId);
      setAudioWaveImages(resource.wave, resource.duration);
    }
  }, [scale, avgSpeed, separate, element._dirty]);

  return [ostyle, audioWaveStyle, backgroundFrames];
};

export default useBackground;
