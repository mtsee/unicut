import styles from './size.module.less';
import Item from '../item';
// import { InputNumber, Slider, Space, Tooltip } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import type { ImageElement, TextElement } from 'video-core-sdk';
import { useReducer, useState, useRef } from 'react';
// import { utils } from 'video-core-sdk';
import { pubsub } from '@utils/pubsub';
// import { Undo, ScanSetting } from '@icon-park/react';
import SliderInput from '../slider-input';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {}

function FontScale(props: IProps) {
  const { editor } = stores;
  const elementData = editor.getElementData() as TextElement;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  editor.updateKey;
  editor.currentTime;

  // 如果有帧
  const frameStatus = editor.movie.getFrameStatusByCurrentTime(elementData);
  const frame = editor.movie.getFrameItem(elementData);
  if (elementData.textScale === undefined) {
    elementData.textScale = 1;
  }
  const scale = elementData.textScale;

  return (
    <Item title={language.val('option_text_scale')}>
      <SliderInput
        min={0.1}
        max={5}
        step={0.01}
        value={scale}
        onChange={(v: number) => {
          if (frameStatus?.textScale !== undefined) {
            if (frame) {
              frame.textScale = v;
            } else {
              const anime = editor.movie.updateKeyFrame(elementData as any, ['textScale']);
              editor.frameSelectedId = anime.id;
              anime.textScale = v;
            }
            pubsub.publish('keyboardUpdateFrame');
          } else {
            if (elementData.type === 'caption') {
              editor.data.captions.forEach(elem => {
                elem.textScale = v;
              });
            } else {
              elementData.textScale = v;
            }
          }
          editor.updateMovie();
          forceUpdate();
        }}
      />
    </Item>
  );
}

export default observer(FontScale);
