import styles from './speed.module.less';
import Item from '../item';
import SliderInput from '../slider-input';
import { observer } from 'mobx-react';
import { useReducer } from 'react';
import type { ImageElement, VideoElement } from 'video-core-sdk';
import { language } from '@language/language';
import { stores } from '@stores/index';
import { Switch } from '@douyinfe/semi-ui';

export interface IProps {}
function Speed(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as ImageElement;
  if (!elementData.isApng && !elementData.isGif) {
    return null;
  }
  const { imageSpeed = 1 } = elementData;
  return (
    <>
      <Item
        title={language.val('option_speed')}
        extra={
          <span>
            <span style={{ fontSize: 12, marginRight: 5, fontWeight: 'normal' }}>禁用动画</span>
            <span>
              <Switch
                size="small"
                checked={!!elementData.disableImageAnimate}
                onChange={v => {
                  elementData.disableImageAnimate = v;
                  editor.updateTimeline();
                  editor.updateMovie();
                  forceUpdate();
                }}
              />
            </span>
          </span>
        }
      >
        <SliderInput
          value={imageSpeed}
          onChange={v => {
            elementData.imageSpeed = v;
            editor.updateTimeline();
            forceUpdate();
          }}
          suffix="x"
          step={0.1}
          min={0.1}
          max={10} // 16 + 9
          onAfterChange={() => {
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
