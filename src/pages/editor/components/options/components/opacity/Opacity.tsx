import styles from './opacity.module.less';
import Item from '../item';
import SliderInput from '../slider-input';
import { useMemo, useReducer } from 'react';
import { observer } from 'mobx-react';
import type { ImageElement } from 'video-core-sdk';
import { utils } from 'video-core-sdk';
import { pubsub } from '@utils/pubsub';
import { language } from '@language/language';
import { stores } from '@stores/index';
import KeyFrameDot from '../keyframe-dot/KeyFrameDot';

export interface IProps {}

function Opacity(props: IProps) {
  const { editor } = stores;
  editor.currentTime;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as ImageElement;
  let alpha = elementData.style.alpha;
  // 如果没有设置alpha参数，默认是1
  if (alpha === undefined) {
    alpha = 1;
  }

  const frameStatus = editor.movie.getFrameStatusByCurrentTime(elementData);
  const frame = editor.movie.getFrameItem(elementData);

  return (
    <Item title={language.val('option_opacity')} extra={<KeyFrameDot keyFrameName="alpha" />}>
      <div className={styles.opacity}>
        <SliderInput
          step={1}
          value={frameStatus?.alpha !== undefined ? utils.toNum(frameStatus.alpha * 100) : utils.toNum(alpha * 100)}
          onChange={v => {
            if (elementData.type === 'caption') {
              editor.data.captions.forEach(t => {
                t.style.alpha = utils.toNum(v / 100, 2);
              });
            } else {
              if (frameStatus?.alpha !== undefined) {
                if (frame) {
                  frame.alpha = utils.toNum(v / 100, 2);
                } else {
                  const anime = editor.movie.updateKeyFrame(elementData, ['alpha']);
                  editor.frameSelectedId = anime.id;
                  anime.alpha = utils.toNum(v / 100, 2);
                }
                pubsub.publish('keyboardUpdateFrame');
              } else {
                elementData.style.alpha = utils.toNum(v / 100, 2);
              }
            }
            forceUpdate();
            editor.updateMovie();
          }}
          onAfterChange={() => {
            editor.record({
              type: 'elements_update',
              desc: '设置透明度',
              data: [elementData],
            });
          }}
        />
      </div>
    </Item>
  );
}

export default observer(Opacity);
