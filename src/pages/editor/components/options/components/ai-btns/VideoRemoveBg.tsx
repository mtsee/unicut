import React, { useRef } from 'react';
import Item from '../item';
import styles from './styles.module.less';
import { PlasticSurgery, Download } from '@icon-park/react';
import { stores } from '@stores/index';
import { resolveLocalUrl } from '@utils/util';
import { config } from '@config/index';

type Props = {};

const VideoRemoveBg = (props: Props) => {
  const { editor } = stores;
  const rvmWin = useRef<any>(null);

  const getResourceUrl = async () => {
    const elem = editor.getElementData();
    const resource = editor.movie.resourceManage.getResouceById(elem.resourceId);
    return await resolveLocalUrl(resource?.url || '');
  };

  const handleDownload = async () => {
    const url = await getResourceUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.click();
  };

  const handleRemoveBg = async () => {
    const url = await getResourceUrl();
    if (!url) return;

    const host = config.env === 'dev' ? 'https://192.168.31.28:5173' : 'https://water.i.h5ds.com'; //
    // const host = 'https://water.i.h5ds.com/'; //
    rvmWin.current = window.open(`${host}/removebg`, '_blank');
    if (!rvmWin.current) return;

    // 将 blob url 转为 File 传给目标窗口
    const response = await fetch(url);
    const blob = await response.blob();
    const filename = 'video.mp4';
    const file = new File([blob], filename, { type: blob.type || 'video/mp4' });

    setTimeout(() => {
      rvmWin.current.postMessage({ videoFile: file }, '*');
    }, 1000);
  };

  return (
    <Item title={'AI人像分离'}>
      <div className={styles.btns}>
        <a onClick={handleDownload}>
          <Download theme="outline" size="18" fill="#fff" />
          下载
        </a>
        <a onClick={handleRemoveBg}>
          <PlasticSurgery theme="outline" size="18" fill="#fff" />
          AI人像分离
        </a>
      </div>
    </Item>
  );
};

export default VideoRemoveBg;
