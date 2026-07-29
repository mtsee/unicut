import { observer } from 'mobx-react';
import { Align, Opacity, Rotation, Size, Position, Animation, Colour } from '../components';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import type { BaseElement } from 'video-core-sdk';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {
  element: BaseElement;
}

function EchartOptions(props: IProps) {
  return (
    <Tabs className="optionTabs" defaultActiveKey={'option'} collapsible={true} arrowPosition={'end'}>
      {/* <TabPane tab={language.val('option_chart_config')} itemKey="option">
        <EChart />
      </TabPane> */}
      <TabPane tab={language.val('option_tab_basic')} itemKey="basic">
        <div className={'scroll scrollBox'}>
          <Align />
          <Position />
          <Size />
          <Opacity />
          <Rotation />
        </div>
      </TabPane>
      <TabPane tab={language.val('option_animation')} itemKey="animation">
        <Animation />
      </TabPane>
    </Tabs>
  );
}

export default observer(EchartOptions);
