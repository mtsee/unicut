import styles from './styles.module.less';
import type { BaseElement } from 'video-core-sdk';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { language } from '@language/language';
import { Align, FrameData, Position, Rotation, Size, SizeWh } from '../components';
import { stores } from '@stores/index';

export interface IProps {
  element: BaseElement;
}

function CameraOptions(props: IProps) {
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
        <div className="scroll scrollBox">
          <Align />
          <Position />
          <SizeWh />
          <Rotation />
          <FrameData />
        </div>
      </TabPane>
    </Tabs>
  );
}

export default observer(CameraOptions);
