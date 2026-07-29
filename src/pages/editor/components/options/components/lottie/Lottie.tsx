import styles from './lottie.module.less';
import Item from '../item';
import SliderInput from '../slider-input';
import { observer } from 'mobx-react';
import { useReducer } from 'react';
import { utils } from 'video-core-sdk';
import type { LottieElement, VideoElement } from 'video-core-sdk';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {}
function Speed(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as LottieElement;
  const { lottieSpeed, initStartFrame } = elementData;
  return (
    <>
      <Item title={language.val('option_lottie_speed')}>
        <SliderInput
          value={lottieSpeed}
          onChange={v => {
            elementData.lottieSpeed = v;
            editor.updateMovie();
            forceUpdate();
          }}
          suffix="x"
          step={0.1}
          min={0.1}
          max={16} // 16 + 9
          onAfterChange={() => {
            editor.record({
              type: 'elements_update',
              desc: '修改播放速度',
              data: [elementData],
            });
          }}
        />
      </Item>
      <Item title={language.val('option_lottie_startTime')}>
        <SliderInput
          value={initStartFrame / 60}
          onChange={v => {
            elementData.initStartFrame = ~~(v * 60);
            editor.updateMovie();
            forceUpdate();
          }}
          suffix="s"
          step={0.1}
          min={0}
          max={100}
          onAfterChange={() => {
            editor.record({
              type: 'elements_update',
              desc: '修改播放速度',
              data: [elementData],
            });
          }}
        />
      </Item>
      {/* <div>替换内容</div> */}
      {/* <div>颜色？</div> */}
    </>
  );
}

export default observer(Speed);
