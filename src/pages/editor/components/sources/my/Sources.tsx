import styles from './sources.module.less';
import { Tabs, TabPane, Empty } from '@douyinfe/semi-ui';
import List from './List';
import { observer } from 'mobx-react';
import Login from '@components/login';
import { IllustrationNoAccess, IllustrationNoAccessDark } from '@douyinfe/semi-illustrations';
import { language, Intl } from '@language/index';
import { stores } from '@stores/index';
import { useState } from 'react';

function Sources() {
  const { editor } = stores;
  const [activeKey, setActiveKey] = useState('1');
  return (
    <>
      {editor.userInfo ? (
        <Tabs lazyRender={true} className={styles.tabs} type="line" activeKey={activeKey} onChange={setActiveKey}>
          <TabPane tab={language.val('my_tab_material')} itemKey="1">
            {activeKey === '1' && <List type="local" />}
          </TabPane>
          <TabPane tab={language.val('my_tab_all_material')} itemKey="2">
            {activeKey === '2' && <List type="cloud" />}
          </TabPane>
        </Tabs>
      ) : (
        <div className={styles.unlogin}>
          <span>
            <Empty
              image={<IllustrationNoAccess style={{ width: 150, height: 150 }} />}
              darkModeImage={<IllustrationNoAccessDark style={{ width: 150, height: 150 }} />}
              description={
                <div className={styles.loginTip}>
                  <Intl name="my_nologin_tip" />
                  <Login>
                    <a>
                      <Intl name="my_login" />
                    </a>
                  </Login>
                </div>
              }
              style={{ padding: 30 }}
            />
          </span>
        </div>
      )}
    </>
  );
}

export default observer(Sources);
