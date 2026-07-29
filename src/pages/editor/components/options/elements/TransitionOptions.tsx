import type { TransitionItem } from 'video-core-sdk';
import styles from './styles.module.less';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { Transition } from '../components';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {
  element: TransitionItem;
}

function TransitionOptions(props: IProps) {
  // const { element } = props;
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
        <Transition />
      </TabPane>
    </Tabs>
  );
}

export default observer(TransitionOptions);
