import { observer } from 'mobx-react';
import {
  Align,
  Opacity,
  Rotation,
  SizeWh,
  Mask,
  Position,
  Animation,
  Colour,
  GreenScreen,
  BlendMode,
  TemplateMode,
  AiBtns,
  StartFrameNumber,
  Effects,
  Speed,
  ApngSpeed,
  Item,
  FrameData,
  ElemTrack,
} from '../components';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import type { BaseElement } from 'video-core-sdk';
import { useState } from 'react';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {
  element: BaseElement;
}

function ImageOptions(props: IProps) {
  const { editor } = stores;
  return (
    <Tabs
      className="optionTabs"
      collapsible={true}
      arrowPosition={'end'}
      activeKey={editor.elementOptionType}
      onChange={e => {
        editor.elementOptionType = e as any;
      }}
    >
      <TabPane tab={language.val('option_tab_base')} itemKey="basic">
        <div className={'scroll scrollBox'}>
          <AiBtns />
          <Align />
          <Position />
          <SizeWh />
          <Opacity />
          <Rotation />
          <GreenScreen />
          <BlendMode />
          <ApngSpeed />
          <StartFrameNumber />
          <TemplateMode />
          <FrameData />
          <ElemTrack />
        </div>
      </TabPane>
      <TabPane tab={language.val('option_animation')} itemKey="animation">
        <Animation />
      </TabPane>
      <TabPane tab={language.val('option_tab_filter')} itemKey="colour">
        <Colour />
      </TabPane>
      <TabPane tab={language.val('option_tab_effects')} itemKey="effects">
        <div className="scroll scrollBox">
          <Effects />
        </div>
      </TabPane>
      <TabPane tab={language.val('option_tab_mask')} itemKey="mask">
        {editor.elementOptionType === 'mask' && <Mask />}
      </TabPane>
    </Tabs>
  );
}

export default observer(ImageOptions);
