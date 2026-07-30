import React from 'react';
import styles from './styles.module.less';
import { Tabs, TabPane, Empty } from '@douyinfe/semi-ui';
import AiVideo from './AiVideo';
import AiImage from './AiImage';
import Tasks from './Tasks';
import { IllustrationNoAccess, IllustrationNoAccessDark } from '@douyinfe/semi-illustrations';
import Login from '@components/login';
import { language, Intl } from '@language/index';
import { stores } from '@stores/index';

export default function AiMain() {
  const { editor } = stores;

  if (!editor.token) {
    return (
      <div className={styles.main}>
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
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <Tabs keepDOM={false} lazyRender={true} className={styles.tabs} type="line">
        <TabPane tab={'Ai视频生成'} itemKey="1">
          <AiVideo />
        </TabPane>
        <TabPane tab={'Ai图片生成'} itemKey="2">
          <AiImage />
        </TabPane>
        <TabPane tab={'生成结果'} itemKey="3">
          <Tasks />
        </TabPane>
      </Tabs>
    </div>
  );
}
