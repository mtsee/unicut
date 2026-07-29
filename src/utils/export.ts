import { helper, MovieEncoding } from 'video-core-sdk';
import { config } from '../config';
import { plugins } from '@plugins/index';
import type { IWatermark, MovieData } from 'video-core-sdk';

export const exportMovie = async (params: {
  format: 'mp4' | 'gif' | 'mp3';
  fps: number;
  resolution: '480P' | '720P' | '1080P' | '2K' | '4K';
  data: MovieData;
  resourcesHost?: string;
  EModuleEffectSourcePath?: string;
  workerPath?: string;
  watermark?: IWatermark;
  onBefore: (obj: any) => Promise<any>;
  onFinish: (obj: any) => Promise<any>;
  onProgress: (obj: any) => void;
  onError: (obj: any) => void;
  name?: string;
  gifTimes?: number[];
  gifWidth?: number;
  gifFps?: number;
  gifSpeed?: number;
}) => {
  const { onFinish, onBefore, onProgress, data, resourcesHost, EModuleEffectSourcePath, workerPath, ...other } = params;
  const values: any = {
    ...other,
  };
  const totalTime = helper.getTotalTime(data);
  if (values.gifTimes) {
    values.gifTimes[1] = totalTime;
  }
  let progress = { sourceLoad: 0, encoderAudio: 0, encoderVideo: 0, eachSourceLoad: 0, eachSourceName: '' };
  await onBefore({ totalTime });
  onProgress({ ...progress });

  console.log('xxxxxxxxxxxxxxxx', values);
  if (resourcesHost) {
    config.resourcesHost = resourcesHost;
  }
  if (EModuleEffectSourcePath) {
    config.EModuleEffectSourcePath = EModuleEffectSourcePath;
  }
  if (workerPath) {
    config.workerPath = workerPath;
  }

  const me = new MovieEncoding({
    // id: 'Stats-output',
    ...values,
    gifWorkerPath: config.workerPath + '/gif.worker.js',
    workerPath: config.workerPath + '/decode.worker.js',
    resourceHost: config.resourcesHost,
    EModuleEffectSourcePath: config.EModuleEffectSourcePath,
    plugins: plugins,
    movieData: data,
    watermark: params.watermark,
    // renderEnv: 'web',
    times: values.format === 'gif' ? values.gifTimes : undefined,
    initSuccess: () => {
      console.log('初始化成功');
    },
    onReady: async () => {
      // 判断是否有缓存数据
      // if (await me.current.getCacheIndexDBData()) {
      //   Toast.warning('浏览器发生过意外关闭，将从上次任务继续导出');
      // }
      console.log('onReady=---->', values);

      if (values.format === 'mp4') {
        await me.run();
      }

      if (values.format === 'mp3') {
        const audioURL = await me.encoderAudio();
        // console.log('audioURL', audioURL);
        me.downURL(audioURL, `${values.name || +new Date()}.mp3`);
      }
      // console.timeEnd('run');
    },
    onEachSourceProgress: n => {
      progress.eachSourceLoad = n.p;
      progress.eachSourceName = n.src.split('/').pop();
      onProgress({ ...progress });
    },
    onProgress: v => {
      if (values.format === 'mp3' && v.type === 'encoderAudio' && v.progress === 1) {
        // 音频合成over
        setTimeout(() => {
          onFinish({ url: me.remixAudioURL });
          // me.destroy();
        }, 1000);
      }
      progress[v.type] = v.progress;
      onProgress({ ...progress });
    },
    onFinish: url => {
      onFinish({ url });
      // me.destroy();
    },
  });

  return me;
};
