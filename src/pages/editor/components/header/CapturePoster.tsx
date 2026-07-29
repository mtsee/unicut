import React, { useEffect, useRef, useState } from 'react';
import styles from './poster.module.less';
import { Write } from '@icon-park/react';
import { Modal, Toast } from '@douyinfe/semi-ui';
import PosterCanvas from './PosterCanvas';
import { language } from '@language/language';
import { stores } from '@stores/index';
import { utils } from 'video-core-sdk';
import { resolveLocalUrl } from '@utils/util';

type Props = {};

const CapturePoster = (props: Props) => {
  const { editor } = stores;
  const posterRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');

  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (editor.data.poster) {
      resolveLocalUrl(editor.data.poster).then(setPosterUrl);
    }
  }, [editor.data.poster]);

  return (
    <div className={styles.capture}>
      <a onClick={() => setVisible(true)}>
        <Write theme="outline" size="18" fill="#000" strokeWidth={3} />
      </a>
      <img src={posterUrl} alt="" />
      <Modal
        title={language.val('header_project_poster')}
        fullScreen
        visible={visible}
        onOk={async () => {
          const ires = await posterRef.current.capture();
          console.warn('base64===============>', ires);
          editor.data.poster = ires;
          editor.saveApp();
          Toast.success(language.val('common_toast_poster_success'));
          setVisible(false);
        }}
        onCancel={onClose}
      >
        {visible && <PosterCanvas ref={posterRef} />}
      </Modal>
    </div>
  );
};

export default CapturePoster;
