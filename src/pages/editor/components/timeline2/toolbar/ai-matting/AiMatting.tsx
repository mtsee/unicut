import styles from '../tools.module.less';
import { Magic } from '@icon-park/react';
import { Tooltip, Modal } from '@douyinfe/semi-ui';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import type { VideoElement } from 'video-core-sdk';
import { observer } from 'mobx-react';
import { fireIcon } from '../icon';
import MattingImage from './MattingImage';
import { language } from '@language/language';
import { pubsub } from '@utils/pubsub';
import { stores } from '@stores/index';

export interface IProps {}

/**
 * AI 人像分割
 * @param props
 * @returns
 */
function AiMatting(props: IProps) {
  const { editor } = stores;
  editor.timelineToolsUpdateKey;
  const [imgURL, setImgURL] = useState('');

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

  // AI抠图
  const mattingImage = useCallback(() => {
    const elementData = editor.getElementData() as VideoElement;
    const resource = editor.movie.resourceManage.getResouceById(elementData.resourceId);
    console.log('resource', resource);
    setImgURL(editor.movie.reURL(resource.url));
  }, []);

  useEffect(() => {
    pubsub.subscribe('showAiMatting', () => {
      mattingImage();
    });
    return () => {
      pubsub.unsubscribe('showAiMatting');
    };
  }, []);

  return (
    <>
      {/* <Tooltip content={language.val('timeline_top_ai_separation')}>
        <a
          className={classNames({
            [styles.enable]: enable,
          })}
          onClick={() => {
            if (enable) {
              mattingImage();
            }
          }}
        >
          <Magic theme="filled" size="20" fill="var(--theme-icon)" />
          {fireIcon}
        </a>
      </Tooltip> */}
      <Modal
        title={language.val('timeline_top_ai_separation')}
        visible={!!imgURL}
        width={1000}
        footer={null}
        onCancel={() => {
          setImgURL('');
        }}
        maskClosable={false}
      >
        <MattingImage
          url={imgURL}
          callback={() => {
            setImgURL('');
          }}
        />
      </Modal>
    </>
  );
}

export default observer(AiMatting);
