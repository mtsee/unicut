import styles from '../tools.module.less';
import { Erase } from '@icon-park/react';
import { Tooltip, Modal } from '@douyinfe/semi-ui';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import type { VideoElement } from 'video-core-sdk';
import { observer } from 'mobx-react';
import { fireIcon } from '../icon';
import RubberImage from './RubberImage';
import { language } from '@language/language';
import { pubsub } from '@utils/pubsub';
import { stores } from '@stores/index';

export interface IProps {}

/**
 * AI 橡皮擦，只对图片有效
 * @param props
 * @returns
 */
function AiRubber(props: IProps) {
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

  useEffect(() => {
    pubsub.subscribe('showAiRubber', () => {
      run();
    });
    return () => {
      pubsub.unsubscribe('showAiRubber');
    };
  }, []);

  const run = useCallback(() => {
    const elementData = editor.getElementData() as VideoElement;
    const resource = editor.movie.resourceManage.getResouceById(elementData.resourceId);
    console.log('resource', resource);
    setImgURL(editor.movie.reURL(resource.url));
    // editor.updateMovie();
    // editor.updateTimeline();
  }, []);

  return (
    <>
      {/* <Tooltip content={language.val('timeline_top_ai_smear')}>
        <a
          className={classNames({
            [styles.enable]: enable,
          })}
          onClick={run}
        >
          <Erase theme="filled" size="20" fill="var(--theme-icon)" />
          {fireIcon}
        </a>
      </Tooltip> */}
      <Modal
        title={language.val('timeline_top_ai_smear')}
        visible={!!imgURL}
        width={1000}
        footer={null}
        onCancel={() => {
          setImgURL('');
        }}
        maskClosable={false}
      >
        {imgURL && (
          <RubberImage
            url={imgURL}
            callback={() => {
              setImgURL('');
            }}
          />
        )}
      </Modal>
    </>
  );
}

export default observer(AiRubber);
