import { observer } from 'mobx-react';
import { Align, Opacity, Rotation, Size, Position, Animation, Colour, Lottie, BlendMode, Effects, FrameData } from '../components';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import type { BaseElement } from 'video-core-sdk';
import { language } from '@language/language';

export interface IProps {
  element: BaseElement;
}

function EffectOptions(props: IProps) {
  return (
    <Tabs className="optionTabs" defaultActiveKey={'lottie'} collapsible={true} arrowPosition={'end'}>
      <TabPane tab={language.val('option_tab_sticker')} itemKey="lottie">
        <Lottie />
      </TabPane>
      <TabPane tab={language.val('option_tab_base')} itemKey="basic">
        <div className={'scroll scrollBox'}>
          <Align />
          <Position />
          <Size />
          <Opacity />
          <Rotation />
          <FrameData />
          {/* <BlendMode /> */}
        </div>
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
    </Tabs>
  );
}

export default observer(EffectOptions);
