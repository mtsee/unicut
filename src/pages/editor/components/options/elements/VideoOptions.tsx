import { observer } from 'mobx-react';
import {
  Align,
  Opacity,
  Rotation,
  Size,
  Position,
  Animation,
  Audio,
  Speed,
  Colour,
  GreenScreen,
  BlendMode,
  TemplateMode,
  Mask,
  TemplateInfo,
  Effects,
  ElemTrack,
  SizeWh,
  FrameData
} from '../components';
import type { BaseElement } from 'video-core-sdk';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import { useState } from 'react';
import { language } from '@language/language';
import { stores } from '@stores/index';
import VideoRemoveBg from '../components/ai-btns/VideoRemoveBg';

export interface IProps {
  element: BaseElement;
}

function VideoOptions(props: IProps) {
  const { editor } = stores;
  return (
    <Tabs
      // more={4}
      className="optionTabs"
      arrowPosition={'end'}
      activeKey={editor.elementOptionType}
      collapsible={true}
      onChange={e => {
        editor.elementOptionType = e as any;
      }}
    >
      <TabPane tab={language.val('option_tab_base')} itemKey="basic">
        <div className="scroll scrollBox">
          <VideoRemoveBg />
          <Align />
          <Position />
          <SizeWh />
          <Opacity />
          <Rotation />
          <Speed />
          <GreenScreen />
          {/* <BlendMode /> */}
          {/* <TemplateMode /> */}
          <FrameData />
          <ElemTrack />
          {/* <TemplateInfo /> */}
        </div>
      </TabPane>
      <TabPane tab={language.val('option_tab_audio')} itemKey="audio">
        <Audio />
      </TabPane>
      <TabPane tab={language.val('option_tab_animation')} itemKey="animation">
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

export default observer(VideoOptions);
