import React, { useCallback, useEffect, useState } from 'react';
import styles from './styles.module.less';
// import Item from '../item';
// import { Button } from '@douyinfe/semi-ui';
// import { RemoveBgVideo } from './tools';
import type { ImageElement, VideoElement } from 'video-core-sdk';
// import { config } from '@config/index';
// import { server } from '@pages/editor/server';
import { pubsub, util } from '@utils/index';
import * as uploadBeforeData from '@pages/editor/tools/uploadBeforeData';
import { ResourceItem, utils } from 'video-core-sdk';
import { Toast, Tooltip } from '@douyinfe/semi-ui';
import classNames from 'classnames';
import { fireIcon } from '../icon';
import { Magic } from '@icon-park/react';
import toolStyles from '../tools.module.less';
import { observer } from 'mobx-react';
import { language } from '@language/language';
import { stores } from '@stores/index';
import * as aiUtils from '../ai-portrait/utils';

type Props = {};

const AiRemoveBg = (props: Props) => {
  const { editor } = stores;
  // const [p, setP] = useState(null);

  const start = useCallback(async () => {
    const elem = editor.getElementData() as ImageElement;
    if (!elem || elem?.type !== 'image') {
      return Toast.error(language.val('timeline_top_ai_removebg_error'));
    }
    editor.globalLoading = true;
    const resource = editor.movie.resourceManage.getResouceById(elem.resourceId);
    const _img = await util.imgLazy(editor.movie.reURL(resource.url));
    await aiUtils.loadModel();
    const [alphamask, imageTensor, resizeImageTensor] = await aiUtils.sessionRun(_img);
    // 生成临时掩码图（512x512）
    const maskCanvas = aiUtils.alphaDataToImage(alphamask.data, aiUtils.config.resolution, aiUtils.config.resolution);
    // 缩放掩码图到 1000x500
    const resizedMaskCanvas = await aiUtils.resizeImage(maskCanvas, _img.naturalWidth, _img.naturalHeight);
    // 抠图
    const finalUrl = await aiUtils.applyMask(imageTensor, resizedMaskCanvas);
    // 文件上传
    const name = util.randomID() + '.png';
    const base64 = (await aiUtils.blobUrlToBase64(finalUrl)) as string;
    const [res] = await editor.apiServer.uploadBase64({
      content: base64,
      name,
    });
    const attrs = await uploadBeforeData.imageThumb(base64, 200);
    const [thumbRes] = await editor.apiServer.uploadBase64({
      content: attrs._base64,
      name: 'thumb_' + name,
    });
    // 保存到素材库
    const [item, err] = await editor.apiServer.createUserMaterial({
      name,
      app_id: editor.appid,
      urls: { url: res.storage_path, thumb: thumbRes.storage_path },
      attrs: {
        naturalWidth: _img.naturalWidth,
        naturalHeight: _img.naturalHeight,
      },
    });
    pubsub.publish('addItemToCloudList', item);
    // 3、添加素材到resource
    const newResource = new ResourceItem({
      id: utils.createID(),
      originId: item.id,
      url: item.urls.url,
      name: item.name,
      fileType: item.type,
      type: item.type as any,
      mustFetch: item.type === 'image' ? true : false,
      thumb: item.urls.thumb,
      styleSize: {
        width: item.attrs.videoWidth || item.attrs.naturalWidth || Number(item.attrs.width),
        height: item.attrs.videoHeight || item.attrs.naturalHeight || Number(item.attrs.height),
      },
      duration: item.attrs.duration,
      from: 'user',
      attrs: { ...item.attrs },
    });
    editor.data.resouces.push(newResource);
    const elementData = editor.getElementData() as ImageElement;
    if (elementData) {
      elementData.resourceId = newResource.id;
      const scale = elementData.style.width / newResource.styleSize.width;
      elementData.style.height = newResource.styleSize.height * scale;
      elementData._dirty = util.randomID();

      // 加载素材
      await editor.movie.resourceManage.fetchBlob(newResource.url);
      await editor.movie.resourceManage.fetchBlob(newResource.thumb);

      editor.updateMovie();
      editor.updateTimeline();
    } else {
      console.warn('AiRemoveBg: elementData is not ImageElement');
    }
    editor.globalLoading = false;
  }, []);

  useEffect(() => {
    pubsub.subscribe('showAiRemoveBg', () => {
      start();
    });
    return () => {
      pubsub.unsubscribe('showAiRemoveBg');
    };
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

  return null;
  // return (
  //   <Tooltip content={language.val('timeline_top_ai_separation')}>
  //     <a
  //       className={classNames({
  //         [toolStyles.enable]: enable,
  //       })}
  //       onClick={() => {
  //         if (enable) {
  //           try {
  //             start();
  //           } catch (error) {
  //             editor.globalLoading = false;
  //           }
  //         }
  //       }}
  //     >
  //       <Magic theme="filled" size="20" fill="var(--theme-icon)" />
  //       {fireIcon}
  //       {/* <span style={{ color: '#fff', fontSize: 12, position: 'relative', top: -2, marginLeft: 5 }}>
  //         {p !== null ? p + '%' : null}
  //       </span> */}
  //     </a>
  //   </Tooltip>
  // );
};

export default observer(AiRemoveBg);
