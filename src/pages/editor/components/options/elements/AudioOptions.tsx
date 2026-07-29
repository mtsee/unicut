import styles from './styles.module.less';
import type { BaseElement } from 'video-core-sdk';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import { Audio, Speed, TemplateMode } from '../components';
import { observer } from 'mobx-react';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {
  element: BaseElement;
}
function AudioOptions(props: IProps) {
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
          <Audio />
          <TemplateMode />
        </div>
      </TabPane>
      <TabPane tab={language.val('option_speed')} itemKey="speed">
        <div className="scroll scrollBox">
          <Speed max={4} min={0.5} step={0.1} />
        </div>
      </TabPane>
    </Tabs>
  );
}

export default observer(AudioOptions);
