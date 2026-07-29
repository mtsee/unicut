import React, { useEffect, useState } from 'react';
import { Modal, Toast, Tooltip } from '@douyinfe/semi-ui';
import AiSuperResolution from './Main';
import { pubsub, util } from '@utils/index';
import type { ImageElement } from 'video-core-sdk';
import classNames from 'classnames';
import styles from '../tools.module.less';
import { ZoomIn } from '@icon-park/react';
import { stores } from '@stores/index';

type Props = {};

const Modals = (props: Props) => {
  const { editor } = stores;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    pubsub.subscribe('showSuperResolution', () => {
      setVisible(true);
    });
    return () => {
      pubsub.unsubscribe('showSuperResolution');
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

  return (
    <>
      {/* <Tooltip content={'变清晰'}>
        <a
          className={classNames({
            [styles.enable]: enable,
          })}
          onClick={() => {
            if (enable) {
              setVisible(true);
            }
          }}
        >
          <ZoomIn theme="filled" size="20" fill="var(--theme-icon)" />
        </a>
      </Tooltip> */}
      <Modal
        width={1050}
        maskClosable={false}
        footer={null}
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
      >
        {visible && (
          <AiSuperResolution
            onOk={async base64 => {
              const elementData = editor.getElementData() as ImageElement;
              const resource = editor.movie.resourceManage.getResouceById(elementData.resourceId);
              if (resource.url === base64) {
                Toast.warning('请先点击开始转换');
                return;
              }
              // 上传base64
              const [res] = await editor.apiServer.uploadBase64({
                content: base64,
                name: util.randomID() + '.png',
              });
              elementData._dirty = util.randomID();
              resource.url = res.storage_path;
              editor.updateMovie();
              setVisible(false);
            }}
            onCancel={() => {
              setVisible(false);
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default Modals;
