import styles from './login-register.module.less';
import React, { useState, useEffect } from 'react';
import { Modal } from '@douyinfe/semi-ui';
import LoginRegisterBox from './loginRegisterBox/LoginRegisterBox';
import { pubsub } from '@utils/index';
import { Close } from '@icon-park/react';
import { language } from '@language/language';
import { stores } from '@stores/index';

function LoginRegister({ children }: any) {
  const [visible, setVisible] = useState(false);

  const showVisible = () => {
    if (!stores.user.info) {
      setVisible(true);
    } else {
      console.log(stores.user.info);
      console.warn('已经登录过了');
      // history.push(location.pathname);
    }
  };

  useEffect(() => {
    pubsub.subscribe('showLoginModal', (_eventName: string, mark: boolean) => {
      if (mark !== undefined) {
        setVisible(mark);
      } else {
        setVisible(true);
      }
    });
    return () => {
      pubsub.unsubscribe('showLoginModal');
    };
  }, []);

  return (
    <div className={styles.loginRegister}>
      {children ? (
        <span onClick={showVisible}>{children}</span>
      ) : (
        <a onClick={showVisible} className={styles.loginRegisterBtn}>
          {language.val('login_login0')}
        </a>
      )}
      <Modal
        className="loginRegisterModal"
        style={{ padding: 0 }}
        bodyStyle={{ padding: 0, margin: 0, border: 'none' }}
        title={null}
        width={836}
        visible={visible}
        zIndex={1000}
        footer={null}
        closeIcon={<Close />}
        onCancel={() => setVisible(false)}
      >
        {visible && <LoginRegisterBox />}
      </Modal>
    </div>
  );
}

export default LoginRegister;
