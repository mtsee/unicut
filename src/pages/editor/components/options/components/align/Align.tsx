import styles from './align.module.less';
import Item from '../item';
import { InputNumber, Tooltip } from '@douyinfe/semi-ui';
import { AlignLeft, AlignHorizontally, AlignRight, AlignTop, AlignVertically, AlignBottom } from '@icon-park/react';
import { observer } from 'mobx-react';
import type { ImageElement } from 'video-core-sdk';
import { pubsub } from '@utils/pubsub';
import { language } from '@language/language';
import { stores } from '@stores/index';
import Flip from './Flip';
import { useReducer } from 'react';

export interface IProps {}

function Align(props: IProps) {
  const { editor } = stores;
  const elementData = editor.getElementData() as ImageElement;
  const { width, height } = editor.data;
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // 如果有帧
  const frameStatus = editor.movie.getFrameStatusByCurrentTime(elementData);
  const frame = editor.movie.getFrameItem(elementData);

  return (
    <>
      <Item title={language.val('option_align')}>
        <div className={styles.align}>
          <Tooltip content={language.val('option_align_left')}>
            <a
              onClick={() => {
                if (frameStatus?.x !== undefined) {
                  if (frame) {
                    frame.x = 0 + elementData.style.width / 2;
                  } else {
                    const anime = editor.movie.updateKeyFrame(elementData, ['x_y']);
                    anime.x = 0 + elementData.style.width / 2;
                    editor.frameSelectedId = anime.id;
                  }
                  pubsub.publish('keyboardUpdateFrame');
                } else {
                  elementData.style.x = 0 + elementData.style.width / 2;
                }
                editor.updateOption();
                editor.updateMovie();
                editor.record({
                  type: 'elements_update',
                  desc: language.val('option_align_left'),
                  data: [elementData],
                });
              }}
            >
              <AlignLeft theme="filled" size="20" fill="var(--theme-icon)" />
            </a>
          </Tooltip>
          <Tooltip content={language.val('option_align_center')}>
            <a
              onClick={() => {
                if (frameStatus?.x !== undefined) {
                  if (frame && frame.x !== undefined) {
                    frame.x = width / 2;
                    pubsub.publish('keyboardUpdateFrame');
                  }
                } else {
                  elementData.style.x = width / 2;
                }
                editor.updateMovie();
                editor.updateOption();
                editor.record({
                  type: 'elements_update',
                  desc: language.val('option_align_center'),
                  data: [elementData],
                });
              }}
            >
              <AlignHorizontally theme="filled" size="20" fill="var(--theme-icon)" />
            </a>
          </Tooltip>
          <Tooltip content={language.val('option_align_right')}>
            <a
              onClick={() => {
                if (frameStatus?.x !== undefined) {
                  if (frame && frame.x !== undefined) {
                    frame.x = width - elementData.style.width / 2;
                    pubsub.publish('keyboardUpdateFrame');
                  }
                } else {
                  elementData.style.x = width - elementData.style.width / 2;
                }
                editor.updateMovie();
                editor.updateOption();
                editor.record({
                  type: 'elements_update',
                  desc: language.val('option_align_right'),
                  data: [elementData],
                });
              }}
            >
              <AlignRight theme="filled" size="20" fill="var(--theme-icon)" />
            </a>
          </Tooltip>
          <Tooltip content={language.val('option_align_top')}>
            <a
              onClick={() => {
                if (frameStatus?.y !== undefined) {
                  if (frame && frame.y !== undefined) {
                    frame.y = elementData.style.height / 2;
                    pubsub.publish('keyboardUpdateFrame');
                  }
                } else {
                  elementData.style.y = elementData.style.height / 2;
                }
                editor.updateOption();
                editor.updateMovie();
                editor.record({
                  type: 'elements_update',
                  desc: language.val('option_align_top'),
                  data: [elementData],
                });
              }}
            >
              <AlignTop theme="filled" size="20" fill="var(--theme-icon)" />
            </a>
          </Tooltip>
          <Tooltip content={language.val('option_align_vertical')}>
            <a
              onClick={() => {
                if (frameStatus?.y !== undefined) {
                  if (frame && frame.y !== undefined) {
                    frame.y = height / 2;
                    pubsub.publish('keyboardUpdateFrame');
                  }
                } else {
                  elementData.style.y = height / 2;
                }
                editor.updateOption();
                editor.updateMovie();
                editor.record({
                  type: 'elements_update',
                  desc: language.val('option_align_vertical'),
                  data: [elementData],
                });
              }}
            >
              <AlignVertically theme="filled" size="20" fill="var(--theme-icon)" />
            </a>
          </Tooltip>
          <Tooltip content={language.val('option_align_bottom')}>
            <a
              onClick={() => {
                if (frameStatus?.y !== undefined) {
                  if (frame && frame.y !== undefined) {
                    frame.y = height - elementData.style.height / 2;
                    pubsub.publish('keyboardUpdateFrame');
                  }
                } else {
                  elementData.style.y = height - elementData.style.height / 2;
                }
                editor.updateOption();
                editor.updateMovie();
                editor.record({
                  type: 'elements_update',
                  desc: language.val('option_align_bottom'),
                  data: [elementData],
                });
              }}
            >
              <AlignBottom theme="filled" size="20" fill="var(--theme-icon)" />
            </a>
          </Tooltip>
        </div>
      </Item>
      <Item title="镜像翻转" extra={<Flip onChange={() => {
        forceUpdate();
      }} />}>
        {elementData?.flipx && (
          <div className={styles.flipOffset}>
            <span className={styles.flipOffsetTitle}>偏移量</span>
            <div className={styles.flipOffsetRow}>
              <span className={styles.flipOffsetLabel}>X</span>
              <InputNumber
                size="small"
                value={elementData.flipOffsetX || 0}
                step={1}
                onChange={v => {
                  (elementData as any).flipOffsetX = v;
                  editor.updateMovie();
                  forceUpdate();
                  editor.record({
                    type: 'elements_update',
                    desc: '修改镜像偏移量X',
                    data: [elementData],
                  });
                }}
              />
            </div>
            <div className={styles.flipOffsetRow}>
              <span className={styles.flipOffsetLabel}>Y</span>
              <InputNumber
                size="small"
                value={elementData.flipOffsetY || 0}
                step={1}
                onChange={v => {
                  (elementData as any).flipOffsetY = v;
                  editor.updateMovie();
                  forceUpdate();
                  editor.record({
                    type: 'elements_update',
                    desc: '修改镜像偏移量Y',
                    data: [elementData],
                  });
                }}
              />
            </div>
          </div>
        )}
      </Item>
    </>
  );
}

export default observer(Align);
