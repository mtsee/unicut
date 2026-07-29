import styles from './styles.module.less';
import Item from '../item';
import { Select } from '@douyinfe/semi-ui';
import type { VideoElement } from 'video-core-sdk';
import { useReducer } from 'react';
import { observer } from 'mobx-react';
import * as PIXI from 'pixi.js';
import { language } from '@language/language';
import { stores } from '@stores/index';

// https://pixijs.download/release/docs/PIXI.html#BLEND_MODES
/**
NORMAL（正常）
对比比较（饱和度模式）

SOFT_LIGHT（柔光）
HARD_LIGHT（强光）
OVERLAY（叠加）
对比比较（差集模式）

DIFFERENCE（差值）
EXCLUSION（排除）
减淡效果（变亮模式）

LIGHTEN（变亮）
COLOR_DODGE（颜色减淡）
SCREEN（滤色）
ADD（线性减淡，添加）
加深效果（变暗模式）

DARKEN（变暗）
COLOR_BURN（颜色加深）
MULTIPLY（正片叠底）
色彩效果（颜色模式）

HUE（色相）
SATURATION（饱和度）
COLOR（颜色）
LUMINOSITY（明度）
 */
export interface IProps {}
function BlendMode(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as VideoElement;

  const arr = [
    { val: PIXI.BLEND_MODES.NORMAL, ename: 'NORMAL', name: '正常' }, //yes
    { val: PIXI.BLEND_MODES.ADD, ename: 'ADD', name: '线性减淡' }, //yes
    { val: PIXI.BLEND_MODES.MULTIPLY, ename: 'MULTIPLY', name: '正片叠底' }, //yes
    { val: PIXI.BLEND_MODES.SCREEN, ename: 'SCREEN', name: '滤色' }, //yes
    
    // { val: PIXI.BLEND_MODES.OVERLAY, ename: 'OVERLAY', name: '叠加' },
    // { val: PIXI.BLEND_MODES.DARKEN, ename: 'DARKEN', name: '变暗' },
    // { val: PIXI.BLEND_MODES.LIGHTEN, ename: 'LIGHTEN', name: '变亮' },
    // { val: PIXI.BLEND_MODES.COLOR_DODGE, ename: 'COLOR_DODGE', name: '颜色减淡' },
    // { val: PIXI.BLEND_MODES.COLOR_BURN, ename: 'COLOR_BURN', name: '颜色加深' },
    // { val: PIXI.BLEND_MODES.HARD_LIGHT, ename: 'HARD_LIGHT', name: '强光' },
    // { val: PIXI.BLEND_MODES.SOFT_LIGHT, ename: 'SOFT_LIGHT', name: '柔光' },
    // { val: PIXI.BLEND_MODES.DIFFERENCE, ename: 'DIFFERENCE', name: '差值' },
    // { val: PIXI.BLEND_MODES.EXCLUSION, ename: 'EXCLUSION', name: '排除' },
    // { val: PIXI.BLEND_MODES.HUE, ename: 'HUE', name: '色相' },
    // { val: PIXI.BLEND_MODES.SATURATION, ename: 'SATURATION', name: '饱和度' },
    // { val: PIXI.BLEND_MODES.COLOR, ename: 'COLOR', name: '颜色' },
    // { val: PIXI.BLEND_MODES.LUMINOSITY, ename: 'LUMINOSITY', name: '明度' },
    // { val: PIXI.BLEND_MODES.NORMAL_NPM, ename: 'NORMAL_NPM' },
    // { val: PIXI.BLEND_MODES.ADD_NPM, ename: 'ADD_NPM', name: '线性减淡NPM' },  //yes
    // { val: PIXI.BLEND_MODES.SCREEN_NPM, ename: 'SCREEN_NPM', name: '滤色NPM' }, //yes

    { val: PIXI.BLEND_MODES.NONE, ename: 'NONE', name: '移除背景' }, //yes 透明背景会变黑
    // { val: PIXI.BLEND_MODES.SRC_IN, ename: 'SRC_IN' },
    // { val: PIXI.BLEND_MODES.SRC_OUT, ename: 'SRC_OUT' },
    // { val: PIXI.BLEND_MODES.SRC_ATOP, ename: 'SRC_ATOP' },
    // { val: PIXI.BLEND_MODES.DST_OVER, ename: 'DST_OVER' },
    { val: PIXI.BLEND_MODES.DST_IN, ename: 'DST_IN', name: '反向蒙版' }, //yes
    { val: PIXI.BLEND_MODES.DST_OUT, ename: 'DST_OUT', name: '正向蒙版' }, //yes
    // { val: PIXI.BLEND_MODES.ERASE, ename: 'ERASE' },
    // { val: PIXI.BLEND_MODES.DST_ATOP, ename: 'DST_ATOP' },
    { val: PIXI.BLEND_MODES.SUBTRACT, ename: 'SUBTRACT', name: '底片' }, //yes
    // { val: PIXI.BLEND_MODES.XOR, ename: 'XOR' },
  ];

  const languageType = language.getLanguage();

  return (
    <Item title={language.val('option_blend_mode')}>
      <Select
        value={elementData.blendMode}
        style={{ width: '100%' }}
        onChange={e => {
          console.log(e);
          elementData.blendMode = e as number;
          editor.updateMovie();
          forceUpdate();
        }}
      >
        {arr.map(d => {
          return (
            <Select.Option key={d.val} value={d.val}>
              {languageType === 'zh-CN' ? d.name : d.ename}
            </Select.Option>
          );
        })}
      </Select>
    </Item>
  );
}
export default observer(BlendMode);
