import { observer } from 'mobx-react';
import styles from './styles.module.less';
import ContentUser from '@components/content-user';
import { user } from '@stores/user';
import { Tabs, TabPane } from '@douyinfe/semi-ui';
import List from './List';
import Detail from './Detail';
import { useEffect, useState } from 'react';
import { pubsub } from '@utils/pubsub';
import { language } from '@language/language';

export interface IProps {}

function Message(props: IProps) {
  const info = user.info;
  const [detailID, setDetailID] = useState('');

  useEffect(() => {
    pubsub.subscribe('setDetailID', (_msg, id: string) => {
      setDetailID(id);
    });
    return () => {
      pubsub.unsubscribe('setDetailID');
    };
  }, []);

  if (!info) {
    return null;
  }

  return (
    <ContentUser title={language.val('user_message')}>
      {!!detailID ? (
        <Detail id={detailID} />
      ) : (
        <Tabs type="line" keepDOM={false}>
          <TabPane tab={language.val('user_message_all')} itemKey="0">
            <List type="" />
          </TabPane>
          <TabPane tab={language.val('user_message_platform')} itemKey="32">
            <List type={32} />
          </TabPane>
          <TabPane tab={language.val('user_message_activity')} itemKey="33">
            <List type={33} />
          </TabPane>
          {/* <TabPane tab={language.val('user_message_private')} itemKey="31">
            <List />
          </TabPane> */}
        </Tabs>
      )}
    </ContentUser>
  );
}

export default observer(Message);
