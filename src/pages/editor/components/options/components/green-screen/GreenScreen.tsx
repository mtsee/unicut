import styles from './greenScreen.module.less';
import Item from '../item';
import SliderInput from '../slider-input';
import { observer } from 'mobx-react';
import { useReducer } from 'react';
import { utils } from 'video-core-sdk';
import type { VideoElement } from 'video-core-sdk';
import { Switch, Select } from '@douyinfe/semi-ui';
import Color from '../color';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {}

// {
//   // 抠像
//   enabled: true, // 是否启用
//   color: 0x008000, // 扣掉的颜色
//   lightLevel: 0.2, // 修改明暗 默认：0.2 可选 0.1 - 0.7;
//   gridSize: 0.8, // 修改网点数,默认是0.8  可选 0.2 - 1.5;
// }

function GreenScreen(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as VideoElement;
  const { matting } = elementData;

  editor.updateKey;

  return (
    <>
      <Item
        title={language.val('option_green_screen')}
        extra={
          <Switch
            checked={matting && matting.enabled}
            onChange={e => {
              if (matting) {
                matting.enabled = e;
                if(matting.similarityThreshold === undefined) {
                  matting.similarityThreshold = 0.5;
                }
              } else {
                elementData.matting = {
                  enabled: e, // 是否启用
                  color: '#00FF00', // 扣掉的颜色
                  similarityThreshold: 0.5, // 抠图颜色范围 0.0-2.0 值越大：相似颜色的扣除范围越大，更多相似颜色会被透明化
                  emergence: 0.0, // 羽化强度
                };
              }
              editor.updateMovie();
              editor.updateTimelineElement();
              forceUpdate();
            }}
          />
        }
      ></Item>
      {matting && matting.enabled && (
        <>
          <Item title={language.val('option_green_screen_color')}>
            <Color
              value={matting.color}
              style={{ width: '100%' }}
              onChange={e => {
                matting.color = e.hex;
                editor.updateMovie();
                editor.updateTimelineElement();
                forceUpdate();
              }}
              onAfterChange={() => {
                editor.record({
                  type: 'elements_update',
                  desc: '修改绿幕抠像颜色',
                  data: [elementData],
                });
              }}
            />
          </Item>
          <Item title={'抠图强度'}>
            <SliderInput
              value={matting.similarityThreshold}
              onChange={v => {
                elementData.matting.similarityThreshold = v;
                editor.updateMovie();
                editor.updateTimelineElement();
                forceUpdate();
              }}
              step={0.01}
              min={0}
              max={1}
              onAfterChange={() => {
                editor.record({
                  type: 'elements_update',
                  desc: '修改绿幕参数',
                  data: [elementData],
                });
              }}
            />
          </Item>
          <Item title={language.val('option_green_screen_feathering_radius')}>
            <SliderInput
              value={matting.emergence}
              onChange={v => {
                elementData.matting.emergence = v;
                editor.updateMovie();
                editor.updateTimelineElement();
                forceUpdate();
              }}
              step={0.01}
              min={0}
              max={1} // 16 + 9
              onAfterChange={() => {
                editor.record({
                  type: 'elements_update',
                  desc: '修改绿幕参数',
                  data: [elementData],
                });
              }}
            />
          </Item>
        </>
      )}
    </>
  );
}

export default observer(GreenScreen);
