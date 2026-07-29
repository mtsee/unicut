import Item from '../item';
import SliderInput from '../slider-input';
import type { ImageElement } from 'video-core-sdk';
import { language } from '@language/language';
import { Undo } from '@icon-park/react';
import { Tooltip } from '@douyinfe/semi-ui';

export interface BasicFilterProps {
  elementData: ImageElement;
  getValue: (name: string) => number;
  changeValue: (v: number, name: string, defaultValue?: number) => void;
}

export default function BasicFilter({ elementData, getValue, changeValue }: BasicFilterProps) {
  const Reset = (params: { onClick: () => void }) => {
    const { onClick } = params;
    return (
      <Tooltip content={language.val('option_size_reset')}>
        <a onClick={onClick}>
          <Undo theme="outline" size="14" fill="var(--theme-icon)" />
        </a>
      </Tooltip>
    );
  };

  return (
    <div style={{ padding: '0 8px' }}>
      <Item title={language.val('option_filter_hue')} extra={<Reset onClick={() => changeValue(0, 'Tint')} />}>
        <SliderInput value={getValue('Tint')} onChange={v => changeValue(v, 'Tint')} min={-1} max={1} step={0.01} />
      </Item>
      <Item title={language.val('option_filter_exposure')} extra={<Reset onClick={() => changeValue(0, 'Exposure')} />}>
        <SliderInput value={getValue('Exposure')} onChange={v => changeValue(v, 'Exposure')} min={-1} max={1} step={0.01} />
      </Item>
      <Item title={language.val('option_filter_highlight')} extra={<Reset onClick={() => changeValue(0, 'Highlights')} />}>
        <SliderInput value={getValue('Highlights')} onChange={v => changeValue(v, 'Highlights')} min={-1} max={1} step={0.01} />
      </Item>
      <Item title={language.val('option_filter_sharpen')} extra={<Reset onClick={() => changeValue(0, 'Sharpen')} />}>
        <SliderInput value={getValue('Sharpen')} onChange={v => changeValue(v, 'Sharpen')} min={0} max={1} step={0.01} />
      </Item>
      <Item title={language.val('option_filter_clearness')} extra={<Reset onClick={() => changeValue(0, 'Clarity')} />}>
        <SliderInput value={getValue('Clarity')} onChange={v => changeValue(v, 'Clarity')} min={-1} max={1} step={0.01} />
      </Item>
      <Item title={language.val('option_filter_smooth')} extra={<Reset onClick={() => changeValue(0, 'Smooth')} />}>
        <SliderInput min={0} max={1} value={getValue('Smooth')} onChange={v => changeValue(v, 'Smooth')} step={0.01} />
      </Item>
      <Item title={language.val('option_filter_noise')} extra={<Reset onClick={() => changeValue(0, 'Grain')} />}>
        <SliderInput min={0} max={1} value={getValue('Grain')} onChange={v => changeValue(v, 'Grain')} step={0.01} />
      </Item>
    </div>
  );
}
