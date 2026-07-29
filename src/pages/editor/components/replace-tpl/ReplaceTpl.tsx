import styles from './style.module.less';
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import type { BaseElement, TextElement } from 'video-core-sdk';
import classNames from 'classnames';
import { Scissors } from '@icon-park/react';
import { pubsub } from '@utils/index';
import { Spin, Modal } from '@douyinfe/semi-ui';
import TextModal from './TextModal';
import { stores } from '@stores/index';

export interface IProps {}

function ReplaceTpl(props: IProps) {
  const { editor } = stores;
  const tpls: BaseElement[] = editor.data.elements
    .filter(d => d.templateEnable)
    .sort((a, b) => a.startTime - b.startTime);
  const [spinning, setSpinning] = useState(false);
  const [elementId, setElementId] = useState(null);
  editor.movieDataUpdateKey;

  useEffect(() => {
    setSpinning(editor.globalLoading);
  }, [editor.globalLoading]);

  return (
    <>
      {spinning && (
        <div className={styles.spinning}>
          <Spin tip="loading..." />
        </div>
      )}
      <div className={styles.replaceTpl + ' scroll'}>
        {tpls.length === 0 && <div className={styles.noReplace}>暂无可替换元素</div>}
        {tpls.map(elementData => {
          const { type, name, duration } = elementData;
          if (type === 'image' || type === 'video') {
            const resource = editor.data.resouces.find(d => d.id === (elementData as any).resourceId);
            // console.log('resource', resource);
            return (
              <div
                className={classNames(styles.item, styles.media, 'replaceTemplateItem')}
                data-id={elementData.id}
                key={elementData.id}
              >
                <span className={styles.tip}>拖入元素替换</span>
                <a className={styles.btn}>
                  <Scissors theme="outline" size="14" fill="var(--theme-icon)" />
                  裁剪
                </a>
                <div className={styles.inner} style={{ backgroundImage: `url(${resource?.thumb})` }}></div>
                <h5 className={styles.name} title={name}>
                  {name}
                </h5>
                <span className={styles.time}>{duration.toFixed(1)}s</span>
              </div>
            );
          } else if (type === 'text') {
            return (
              <div
                onClick={() => setElementId(elementData.id)}
                className={classNames(styles.item, styles.text)}
                key={elementData.id}
              >
                <span className={styles.tip}>点击修改文案</span>
                <div className={styles.inner}>
                  <p>{(elementData as TextElement).text}</p>
                </div>
                <h5 className={styles.name} title={name}>
                  {name}
                </h5>
                <span className={styles.time}>{duration}s</span>
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
      <Modal
        visible={!!elementId}
        onCancel={() => setElementId(null)}
        title="修改文本"
        onOk={() => {
          editor.updateMovie();
          setElementId(null);
        }}
      >
        {elementId && <TextModal elementId={elementId} />}
      </Modal>
    </>
  );
}

export default observer(ReplaceTpl);
