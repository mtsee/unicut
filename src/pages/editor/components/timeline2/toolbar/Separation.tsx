import styles from './tools.module.less';
import { Record } from '@icon-park/react';
import { Tooltip, Toast } from '@douyinfe/semi-ui';
import classNames from 'classnames';
import { useMemo } from 'react';
import type { VideoElement } from 'video-core-sdk';
import { observer } from 'mobx-react';
import { utils, helper } from 'video-core-sdk';
import { util } from '@utils/index';
import { checkVideoUrlHasAudio } from '@utils/util';
import { language } from '@language/language';
import { stores } from '@stores/index';
import AudioSVGWaveform from '@pages/editor/tools/audioWaveFormSvgPath';

export interface IProps {}

/**
 * 音视频分离
 * @param props
 * @returns
 */
function Separation(props: IProps) {
  const { editor } = stores;
  editor.timelineToolsUpdateKey;

  const enable = useMemo(() => {
    if (editor.selectedElementIds.length !== 1) return false;
    const elementData = editor.getElementData();
    if (!elementData || elementData.type !== 'video') return false;
    return !(elementData as VideoElement).separate;
  }, [editor.selectedElementIds, editor.timelineToolsUpdateKey]);

  // 音视频分离
  const separationFun = async () => {
    if (!enable) return;

    const elementData = editor.getElementData() as VideoElement;
    const resource = editor.movie.resourceManage.getResouceById(elementData.resourceId);
    if (!resource) return;

    try {
      editor.globalLoading = true;

      // 1. 判断 resource.url 是否存在音频
      const videoURL = editor.movie.resourceManage.reURL(resource.url);
      const hasAudio = await checkVideoUrlHasAudio(videoURL, resource.type);
      if (!hasAudio) {
        Toast.warning('该视频没有音频轨道');
        return;
      }

      // 2. 将视频url转码成mp3
      const ffmpeg = (window as any)._ffmpegWASMInstance;
      while (!ffmpeg.loaded) {
        await utils.sleep(1000);
      }
      const inputName = 'input' + resource.id;
      const outputName = 'output.mp3';
      const fileExt = resource.url.split('.').pop() || 'mp4';
      const inputFile = inputName + '.' + fileExt;
      const videoData = await helper.fetchFile(videoURL);
      await ffmpeg.writeFile(inputFile, videoData);
      await ffmpeg.exec(['-i', inputFile, '-vn', '-c:a', 'libmp3lame', '-q:a', '2', outputName]);
      const data = await ffmpeg.readFile(outputName);
      const mp3Blob = new Blob([data.buffer], { type: 'audio/mp3' });
      ffmpeg.deleteFile(inputFile);
      ffmpeg.deleteFile(outputName);

      // 3. 标记视频元素已分离
      elementData.separate = 1;

      // 4. 上传 mp3 到服务器
      const formdata = new FormData();
      const mp3Name = `${util.formatDate(new Date(), 'YYYYMMDDHHmmss')}.mp3`;
      formdata.append('file', mp3Blob, mp3Name);
      const [uploadRes, uploadErr] = await editor.apiServer.formUpdate(formdata);
      if (uploadErr || !uploadRes?.storage_path) {
        Toast.error(language.val('timeline_separate_upload_fail'));
        return;
      }
      const mp3URL = uploadRes.storage_path;

      // 5. 获取音波数据并上传
      const audioWave = new AudioSVGWaveform({ url: editor.movie.reURL(mp3URL), buffer: null, maxWidth: 10000 });
      await audioWave.loadFromUrl();
      const peaks = await audioWave.getPeaks();
      const waveBase64 = 'data:text/text;base64,' + btoa(JSON.stringify(peaks));
      const [waveRes] = await editor.apiServer.uploadBase64({
        content: waveBase64,
        name: utils.createID() + '.json',
      });

      console.log('waveRes--->', waveRes, mp3URL);

      // 6. 创建新的音频元素
      await editor.movie.addElementByResource(
        {
          id: utils.createID(),
          name: resource.name.replace(/\.[^.]+$/, ''),
          type: 'audio',
          url: mp3URL,
          wave: waveRes?.storage_path || '',
          fileType: 'audio',
          from: 'user',
          mustFetch: false,
          duration: util.timeToNum(resource.duration),
          attrs: { duration: util.timeToNum(resource.duration), wave: waveRes?.storage_path || '' },
        },
        {
          elementType: 'audio',
          time: elementData.startTime,
          duration: util.timeToNum(elementData.duration),
          trackIndex: elementData.trackIndex - 0.5,
        },
      );

      editor.updateMovie();
      editor.updateTimeline();
      editor.updateTimelineTools();
    } catch (err) {
      console.error('音视频分离失败', err);
      Toast.error(language.val('timeline_separate_error'));
    } finally {
      editor.globalLoading = false;
    }
  };

  return (
    <Tooltip content={language.val('timeline_top_separate')}>
      <a
        className={classNames({
          [styles.enable]: enable,
        })}
        onClick={separationFun}
      >
        <Record theme="outline" size="18" fill="var(--theme-icon)" />
      </a>
    </Tooltip>
  );
}

export default observer(Separation);
