import styles from './styles.module.less';
import { observer } from 'mobx-react';
import { Strength } from '../components';
import type { BaseElement } from 'video-core-sdk';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {
  element: BaseElement;
}

function FilterOptions(props: IProps) {
  const { editor } = stores;
  return (
    <Tabs
      className="optionTabs"
      collapsible={true}
      activeKey={editor.elementOptionType}
      arrowPosition={'end'}
      onChange={e => {
        editor.elementOptionType = e as any;
      }}
    >
      <TabPane tab={language.val('option_tab_base')} itemKey="basic">
        <div className={'scroll scrollBox'}>
          <div className={styles.content}>
            <span className={styles.name}>{language.val('option_name')}</span>
            <span>{props.element.name}</span>
          </div>
          <Strength />
        </div>
      </TabPane>
    </Tabs>
  );
}

export default observer(FilterOptions);
