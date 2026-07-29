import styles from './styles.module.less';
import type { BaseElement, EffectCanvasElement } from 'video-core-sdk';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { language } from '@language/language';
import { stores } from '@stores/index';
import { BlendMode } from '../components';

export interface IProps {
  element: BaseElement | any;
}

function EffectOptions(props: IProps) {
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
        <div className={styles.content}>
          <span className={styles.name}>{language.val('option_name')}</span>
          <span>{props.element.name}</span>
          <span>【{props.element.effectType || 'script'}】</span>
        </div>
        {props.element.effectType === 'gif' && <BlendMode />}
      </TabPane>
    </Tabs>
  );
}

export default observer(EffectOptions);
