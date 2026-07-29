import { stores } from '@stores/index';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import styles from './previewSource.module.less';
import $ from 'jquery';
// import { Image } from '@douyinfe/semi-ui';

export interface IProps {}

function PreviewSource(props: IProps) {
  const { editor } = stores;

  useEffect(() => {
    const hidePreviewSource = e => {
      if (!$(e.target).closest('.h5dsSourcePreview')[0] || !e.target.closest('.semi-image-preview')[0]) {
        editor.previewSource = null;
      }
    };
    document.addEventListener('click', hidePreviewSource);
    return () => {
      document.removeEventListener('click', hidePreviewSource);
    };
  }, []);

  if (!editor.previewSource) {
    return null;
  }
  const { type, name, url } = editor.previewSource;
  return (
    <div className={styles.preview + ' h5dsSourcePreview'}>
      {type === 'image' && <img src={editor.movie.reURL(url)} />}
      {type === 'text' && <img src={editor.movie.reURL(url)} />}
      {type === 'video' && <video style={{ maxHeight: 500 }} src={editor.movie.reURL(url)} controls />}
      {type === 'audio' && <audio src={editor.movie.reURL(url)} controls />}
      {type === 'template' && <video style={{ maxHeight: 500 }} src={editor.movie.reURL(url)} controls />}
    </div>
  );
}

export default observer(PreviewSource);
