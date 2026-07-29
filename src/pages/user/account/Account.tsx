import { observer } from 'mobx-react';
import styles from './styles.module.less';
import ContentUser from '@components/content-user';
import Item from './Item';
import { Button, Modal, Input, Toast } from '@douyinfe/semi-ui';
import { user } from '@stores/user';
import NickName from './NickName';
import { useReducer, useState, useEffect } from 'react';
import { Info, CheckOne } from '@icon-park/react';
import BindMobile from './BindMobile';
import BindEmail from './BindEmail';
import BindWechat from './BindWechat';
import server from './server';
import Password from './Password';
import { language } from '@language/language';

export interface IProps {}

function Account(props: IProps) {
  const info = user.info;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [hasBind, setHasBind] = useState([]);

  if (!info) {
    return null;
  }

  const nobind = (
    <span className={styles.bindInfo}>
      <Info theme="outline" size="16" fill="var(--semi-color-danger)" />
      {language.val('common_not_set')}
    </span>
  );

  const isbind = (t: string = language.val('common_bound')) => (
    <span className={styles.bindInfo}>
      <CheckOne theme="outline" size="16" fill="var(--semi-color-success)" />
      {t}
    </span>
  );

  const getBindState = () => {
    server.getUserBind().then(([res]) => {
      console.log('res', res);
      setHasBind(res);
    });
  };

  useEffect(() => {
    getBindState();
  }, []);

  return (
    <ContentUser title={language.val('common_account_settings')}>
      <>
        <NickName />
        <Item
          title={language.val('common_phone')}
          extra={
            info.mobile ? (
              <Button
                onClick={() => {
                  Modal.confirm({
                    title: language.val('user_unbind'),
                    content: language.val('user_unbind_content'),
                    onOk: async () => {
                      const [res, err] = await server.getUnBind({ type: 'mobile' });
                      if (err) {
                        return Toast.error(err);
                      }
                      user.info.mobile = '';
                      Toast.success(language.val('user_unbind_success'));
                    },
                  });
                }}
              >
                {language.val('user_unbind')}
              </Button>
            ) : (
              <BindMobile />
            )
          }
        >
          {info.mobile || nobind}
        </Item>
        <Item
          title={language.val('common_email')}
          extra={
            info.email ? (
              <Button
                onClick={() => {
                  Modal.confirm({
                    title: language.val('user_unbind'),
                    content: language.val('user_email_unbind_content'),
                    onOk: async () => {
                      const [res, err] = await server.getUnBind({ type: 'email' });
                      if (err) {
                        return Toast.error(err);
                      }
                      user.info.email = '';
                      Toast.success(language.val('user_unbind_success'));
                    },
                  });
                }}
              >
                {language.val('user_unbind')}
              </Button>
            ) : (
              <BindEmail />
            )
          }
        >
          {info.email || nobind}
        </Item>
        <Item
          title={language.val('user_weixin')}
          extra={
            hasBind.includes('wechat') ? (
              <Button
                onClick={() => {
                  Modal.confirm({
                    title: language.val('user_unbind'),
                    content: language.val('user_weixin_unbind_content'),
                    onOk: async () => {
                      const [res, err] = await server.getUnBind({ type: 'wechat' });
                      if (err) {
                        return Toast.error(err);
                      }
                      getBindState();
                      Toast.success(language.val('user_unbind_success'));
                    },
                  });
                }}
              >
                {language.val('user_unbind')}
              </Button>
            ) : (
              <BindWechat
                bindSuccess={() => {
                  console.log(language.val('user_bind_success'));
                  getBindState();
                }}
              />
            )
          }
        >
          {hasBind.includes('wechat') ? isbind() : nobind}
        </Item>
        <Item title={language.val('user_password')} extra={<Password hasBind={hasBind.includes('password')} />}>
          {hasBind.includes('password') ? isbind(language.val('user_password_set')) : nobind}
        </Item>
      </>
    </ContentUser>
  );
}

export default observer(Account);
