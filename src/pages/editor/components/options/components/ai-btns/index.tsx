import React, { useState } from 'react';
import styles from './styles.module.less';
import Item from '../item';
import { Erase, GirlOne, Magic, PlasticSurgery, Quote, ZoomIn } from '@icon-park/react';
import { run } from '@pages/editor/components/timeline2/toolbar/ai-portrait/utils';
import type { ImageElement } from 'video-core-sdk';
import { Modal, Toast } from '@douyinfe/semi-ui';
import { pubsub, util } from '@utils/index';
import { utils } from 'video-core-sdk';
import { language } from '@language/language';
import { stores } from '@stores/index';
import { reURL } from '@utils/util';
import { config } from '@config/index';
import MagicComp from './Magic';
// import * as aiIco from './icon';

type Props = {};

const AiBtns = (props: Props) => {
  const { editor } = stores;

  const [isShow, setIsShow] = useState(false);

  const elementData = editor.getElementData() as ImageElement;
  if (elementData.isApng) {
    return null;
  }
  return (
    <Item title={language.val('ai_title')}>
      <div className={styles.btns}>
        <a
          onClick={() => {
            pubsub.publish('showAiMatting');
          }}
        >
          <Magic theme="outline" size="18" fill="var(--theme-icon)" />
          AI抠图
        </a>
        <a
          onClick={() => {
            pubsub.publish('showAiRubber');
          }}
        >
          <Erase theme="outline" size="18" fill="var(--theme-icon)" />
          AI擦除
        </a>
      </div>
      <div className={styles.btns}>
        <a
          onClick={() => {
            pubsub.publish('showSuperResolution');
          }}
        >
          <ZoomIn theme="outline" size="18" fill="var(--theme-icon)" />
          AI变清晰
        </a>
        <a
          onClick={() => {
            pubsub.publish('showAiRemoveBg');
          }}
        >
          <PlasticSurgery theme="outline" size="18" fill="var(--theme-icon)" />
          AI人像分离
        </a>
      </div>
      <div className={styles.btns}>
        <a
          style={{ backgroundColor: 'var(--theme-bg)' }}
          onClick={() => {
            setIsShow(true);
          }}
        >
          <Magic theme="outline" size="18" fill="var(--theme-icon)" />
          魔棒工具
        </a>
        <a
          style={{ backgroundColor: 'var(--theme-bg)' }}
          onClick={async () => {
            console.log(editor.movie.resourceManage);
            try {
              const imgUrl = editor.movie.resourceManage.getBlobURLBySourceId(elementData.resourceId);
              const img = await util.imgLazy(imgUrl);
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext('2d');
              ctx!.drawImage(img, 0, 0);
              const base64 = canvas.toDataURL('image/png');
              console.log(base64);
              pubsub.publish('addRefImage', { base64 });
            } catch (error) {
              console.error(error);
              Toast.error('添加失败');
            }
          }}
        >
          <Quote theme="outline" size="18" fill="var(--theme-icon)" />
          加入对话
        </a>
        <Modal
          title="魔棒工具"
          width={1200}
          visible={isShow}
          maskClosable={false}
          footer={null}
          onCancel={() => {
            setIsShow(false);
          }}
        >
          {isShow && (
            <MagicComp
              onCancel={() => {
                setIsShow(false);
              }}
            />
          )}
        </Modal>
      </div>
    </Item>
  );
};

export default AiBtns;
