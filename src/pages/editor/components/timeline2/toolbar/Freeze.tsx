import { Toast, Tooltip } from '@douyinfe/semi-ui';
import { Stopwatch } from '@icon-park/react';
import { language } from '@language/language';
import classNames from 'classnames';
import React, { useState } from 'react';
import styles from './tools.module.less';
import { observer } from 'mobx-react';
import type { ImageElement, VideoElement } from 'video-core-sdk';
import { util } from '@utils/index';
import { utils } from 'video-core-sdk';
import { stores } from '@stores/index';

type Props = {};

const Freeze = (props: Props) => {
  const { editor } = stores;
  editor.timelineToolsUpdateKey;

  let enable = false;

  if (editor.selectedElementIds.length > 1) {
    enable = false;
  }
  if (editor.selectedElementIds.length === 1) {
    const elementData = editor.getElementData();
    if (elementData && elementData.type === 'video') {
      if (!(elementData as VideoElement).separate) {
        enable = true;
      }
    }
  }

  // 快速插入图片元素
  const fastInsertImageElement = async (params: {
    name: string;
    width: number;
    height: number;
    url: string;
    thumb: string;
    duration?: number;
    trackIndex?: number;
  }): Promise<ImageElement> => {
    const { name, width, height, url, thumb, duration = 3, trackIndex = 0.5 } = params;
    // 新增图片元素
    const resource = {
      id: util.randomID(),
      name: name,
      type: 'image' as any,
      url: url,
      thumb: thumb,
      styleSize: {
        width: width,
        height: height,
      },
      fileType: 'image',
      from: 'user' as any,
      mustFetch: true,
      attrs: {
        width: width,
        height: height,
      },
    };
    editor.data.resouces.push(resource);
    // 缓存资源
    await editor.movie.resourceManage.fetchBlob(resource.url);
    const elementData = editor.getElementData();
    const newElementData = {
      id: utils.createID(),
      name: name,
      _dirty: '1',
      type: 'image',
      trackIndex,
      resourceId: resource.id,
      startTime: editor.currentTime,
      duration: duration || 5,
      blendMode: 0,
      style: {
        ...(elementData as VideoElement).style,
      },
      flipx: false,
    } as ImageElement;
    editor.data.elements.push(newElementData);
    // 更新时间轴，会自动重新计算trackIndex
    editor.updateTimeline();
    // 更新画布
    editor.updateMovie();
    // 设置控制器选中新增的元素
    editor.setContorlAndSelectedElemenent([newElementData.id]);
    return elementData as ImageElement;
  };

  const freezeFun = async () => {
    if (enable) {
      console.log('freezeFun');
      // 截取图
      editor.globalLoading = true;
      const elementData = editor.getElementData();
      if (elementData && elementData.type === 'video') {
        //@ts-ignore
        const pixiElem = editor.movie.getPixiContainerById(elementData.id);
        try {
          //@ts-ignore
          const video = pixiElem[0].children[0].texture.baseTexture.resource.source;
          const base64 = await util.drawVideoFrame(video, video.videoWidth, video.currentTime);
          const thumbBase64 = await util.drawVideoFrame(video, 120, video.currentTime);
          //   console.log(video, video.currentTime, thumbs);
          const name = `${util.randomID()}-freeze.png`;
          const [res] = await editor.apiServer.uploadBase64({
            content: base64,
            name: name,
          });
          const [thumbRes] = await editor.apiServer.uploadBase64({
            content: thumbBase64,
            name: `${util.randomID()}-freeze-min.png`,
          });
          if (res) {
            await fastInsertImageElement({
              name: name,
              width: video.videoWidth,
              height: video.videoHeight,
              url: res.storage_path,
              thumb: thumbRes.storage_path,
            });
          }
        } catch (err) {
          Toast.error(err);
          console.warn(err);
        }
        editor.globalLoading = false;
      }
    }
  };

  return (
    <Tooltip content={language.val('timeline_top_freeze')}>
      <a
        onClick={freezeFun}
        className={classNames(styles.btn, {
          [styles.enable]: enable,
        })}
      >
        <Stopwatch theme="outline" size="18" fill="var(--theme-icon)" />
      </a>
    </Tooltip>
  );
};

export default observer(Freeze);
