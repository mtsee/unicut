import styles from './speed.module.less';
import Item from '../item';
import SliderInput from '../slider-input';
import { observer } from 'mobx-react';
import { useReducer } from 'react';
import type { VideoElement } from 'video-core-sdk';
import CurveSpeed from './CurveSpeed';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {
  max?: number;
  min?: number;
  step?: number;
}
function Speed(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as VideoElement;
  const { speed } = elementData;
  return (
    <>
      <Item title={language.val('option_speed')}>
        <SliderInput
          value={speed}
          onChange={v => {
            elementData.speed = v;
            editor.updateTimeline();
            forceUpdate();
          }}
          suffix="x"
          step={props.step || 0.1}
          min={props.min || 0.1}
          max={props.max || 16} // 16 + 9
          onAfterChange={() => {
            // 如果元素重叠了，需要重新换个轨道
            const elem = editor.checkTrackElementOverlap(elementData.trackIndex);
            // console.log('判断是否重叠了----------->', elem);
            if (elem) {
              elem.trackIndex += 0.5;
            }
            editor.updateTimeline();
            editor.updateMovie();
            editor.record({
              type: 'elements_update',
              desc: '修改播放速度',
              data: [elementData],
            });
          }}
        />
      </Item>
      {/* <Item title="曲线变速">
        <CurveSpeed />
      </Item> */}
    </>
  );
}

export default observer(Speed);
