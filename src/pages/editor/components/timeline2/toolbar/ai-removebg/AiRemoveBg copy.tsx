import React, { useCallback, useEffect, useState } from 'react';
import styles from './styles.module.less';
// import Item from '../item';
// import { Button } from '@douyinfe/semi-ui';
import { RemoveBgVideo } from './tools';
import type { VideoElement } from 'video-core-sdk';
import { config } from '@config/index';
import { server } from '@pages/editor/server';
import { pubsub, util } from '@utils/index';
import { decoderVideoDrawFrameImage } from '@pages/editor/tools/uploadBeforeData';
import { utils } from 'video-core-sdk';
import { Toast, Tooltip } from '@douyinfe/semi-ui';
import classNames from 'classnames';
import { fireIcon } from '../icon';
import { BoyTwo } from '@icon-park/react';
import toolStyles from '../tools.module.less';
import { observer } from 'mobx-react';
import { language } from '@language/language';
import { stores } from '@stores/index';

type Props = {};

const AiRemoveBg = (props: Props) => {
  const { editor } = stores;
  const [p, setP] = useState(null);

  const start = useCallback(async () => {
    setP(0.1);
    const elem = editor.getElementData() as VideoElement;

    if (!elem || elem?.type !== 'video') {
      return Toast.error(language.val('timeline_top_ai_removebg_please_select_video'));
    }

    const resource = editor.movie.resourceManage.getResouceById(elem.resourceId);
    const rbv = new RemoveBgVideo(editor.movie.reURL(resource.url), {
      onReady: d => {
        console.log('ready', d);
        pubsub.publish('windowLoading', true);
      },
      onProgress: d => {
        console.log('progress', d);
        setP(d);
      },
      onSuccess: async mp4Data => {
        pubsub.publish('windowLoading', false);
        console.log('success', mp4Data);
        console.log('解码over', URL.createObjectURL(mp4Data));

        // pubsub.publish('timelineLoading', true);

        rbv.destroy();
        // 将 Blob 转换为 File
        const file = new File([mp4Data], 'example.mp4', { type: 'video/mp4' });
        // 创建 FormData 对象并添加文件
        const formData = new FormData();
        formData.append('file', file, `${resource.name}_screen.mp4`);
        // 使用 fetch 上传文件到服务器，这里假设服务器的上传接口为 '/upload'
        const [res, err] = await server.formUpdate(formData);

        const newResource = util.toJS(resource);
        newResource.id = util.randomID();
        newResource.url = res.storage_path;
        newResource.originId = newResource.originId + '_screen';
        // 重新获取帧图
        const aspectRatio = resource.attrs.videoWidth / resource.attrs.videoHeight;
        const url = URL.createObjectURL(mp4Data);
        const _video = await util.mediaLazy(url);
        const frameRes = (await decoderVideoDrawFrameImage({
          url,
          aspectRatio,
          audioTrack: null,
          videoRotation: resource.attrs.rotation,
          frameScale: 2,
          duration: _video.duration,
          workerPath: config.workerPath + '/decode.worker.js',
        })) as any;
        // console.log('frameRes', frameRes);
        const [frameUplpoadRes] = await editor.apiServer.uploadBase64({
          content: (await utils.blobURL2Data(frameRes.url)) as string,
          name: utils.createID() + '.png',
          file_type: 'image',
        });
        newResource.frames = frameUplpoadRes.storage_path;
        editor.data.resouces.push(newResource);
        const elementData = editor.getElementData() as VideoElement;
        if (!elementData) {
          return;
        }
        elementData.matting = {
          enabled: true, // 是否启用
          color: '#00FF00', // 扣掉的颜色
          // filterType: 8, // 滤镜类型（0,8）默认是0
          // lightLevel: 0.5, // 修改明暗 默认：0.2 可选 0.1 - 0.7;
          // gridSize: 0.8, // 修改噪点数,默认是0.8  可选 0.2 - 1.5;
          emergence: 0.0,
        };
        elementData.resourceId = newResource.id;
        elementData._dirty = util.randomID();
        // 缓存资源
        await editor.movie.resourceManage.cacheMedia(newResource.url, 'video');
        editor.updateTimeline();
        editor.updateMovie();
        editor.updateOption();
        // 保存历史记录
        editor.record({
          type: 'elements_update',
          desc: '替换元素资源' + elementData.id,
          data: [elementData],
        });
        // pubsub.publish('timelineLoading', false);
        setP(null);
      },
    });
    await rbv.createWorder(config.workerPath + '/decode.worker.js', editor.movie.reURL);
    await rbv.createImageSegmenter();
    await rbv.createMuxer();

    let i = 0;
    let delay = 1 / rbv.fps;
    let endMark = false;
    while (!endMark) {
      endMark = await rbv.decodeTime(i * delay);
      i++;
    }
  }, []);

  let enable = false;

  if (editor.selectedElementIds.length > 1) {
    enable = false;
  }
  if (editor.selectedElementIds.length === 1) {
    const elementData = editor.getElementData();
    if (elementData && (elementData as any).type === 'image') {
      enable = true;
    }
  }

  return (
    <Tooltip content={language.val('timeline_top_ai_segmentation')}>
      <a
        className={classNames({
          [toolStyles.enable]: enable,
        })}
        href={`https://video.h5ds.com/tools/removebg`}
        target="_blank"
        // onClick={() => {
        //   if (enable) {
        //     start();
        //   }
        // }}
      >
        <BoyTwo theme="filled" size="20" fill="var(--theme-icon)" />
        {fireIcon}
        <span style={{ color: '#fff', fontSize: 12, position: 'relative', top: -2, marginLeft: 5 }}>
          {p !== null ? p + '%' : null}
        </span>
      </a>
    </Tooltip>
  );
};

export default observer(AiRemoveBg);
