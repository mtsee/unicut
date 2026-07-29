import styles from './login-register-box.module.less';
import React, { useState, useEffect, useRef } from 'react';
import { config } from '@config/index';
import { Divider, Toast } from '@douyinfe/semi-ui';
import LoginQrcode from '../loginQrcode';
import LoginMobile from '../loginMobile';
import LoginEmail from '../loginEmail';

import { userService } from '@server/index';
import { Wechat, Phone, Check, MailPackage } from '@icon-park/react';
import { language } from '@language/language';
import classNames from 'classnames';

function LoginRegisterBox() {
  const [show, setShow] = useState(language.getLanguage() === 'zh-CN' ? 'loginQrcode' : 'loginEmail');

  // const showOAuthWindow = () => {
  //   let url = `${config.apiHost}/account/login/provider/qq?type=login`;
  //   window.open(url, '', 'width=500,height=500,channelmode=yes');
  // };

  const handlePostMessage = async (evt: any) => {
    if (evt.data.msgType !== 'oauth-login') {
      return;
    }
    const { provider, code } = evt.data;
    if (provider) {
      const hide = Toast.info(language.val('login_loading'));
      await userService.oauthLogin(code);
      Toast.close(hide);
      (window as any).RouterHistory.push(location.pathname);
    }
  };

  useEffect(() => {
    window.addEventListener('message', handlePostMessage);
    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  });

  return (
    <div className={styles.loginRegisterBox}>
      <div className={styles.loginRegisterInfo}>
        <h1>{language.val('common_name')}</h1>
        <p>
          <Check theme="filled" size="16" fill="#98ff00" />
          {language.val('login_switch_lens')}
        </p>
        <p>
          <Check theme="filled" size="16" fill="#98ff00" />
          {language.val('login_ai_subtitle')}
        </p>
        <p>
          <Check theme="filled" size="16" fill="#98ff00" />
          {language.val('login_ai_animation')}
        </p>
        <p>
          <Check theme="filled" size="16" fill="#98ff00" />
          {language.val('login_export_4k')}
        </p>
        <p>
          <Check theme="filled" size="16" fill="#98ff00" />
          {language.val('login_lut_filter')}
        </p>
        {/* <p>
          <Check theme="filled" size="16" fill="#98ff00" />
          {language.val('login_free_material')}
        </p> */}
        <p>
          <Check theme="filled" size="16" fill="#98ff00" />
          {language.val('login_exclusive_plugin')}
        </p>
        <p>
          <Check theme="filled" size="16" fill="#98ff00" />
          {language.val('login_no_download')}
        </p>
        <p>
          <Check theme="filled" size="16" fill="#98ff00" />
          {language.val('login_cloud_storage')}
        </p>
      </div>
      <div className={styles.loginRegisterForm}>
        <div className={styles.loginRegisterTabs}>
          {show === 'loginQrcode' && <LoginQrcode />}
          {show === 'loginMobile' && <LoginMobile setShow={setShow} />}
          {show === 'loginEmail' && <LoginEmail setShow={setShow} />}
        </div>
        <Divider>{language.val('login_other_login')}</Divider>
        <div className={styles.loginRegisterActions}>
          <a
            className={classNames(styles.item, {
              [styles.active]: show === 'loginEmail',
            })}
            onClick={() => setShow('loginEmail')}
          >
            <MailPackage theme="filled" size="24" fill="#666" />
            <span>{language.val('login_email_login')}</span>
          </a>
          <a
            className={classNames(styles.item, {
              [styles.active]: show === 'loginMobile',
            })}
            onClick={() => setShow('loginMobile')}
          >
            <Phone theme="filled" size="24" fill="#666" />
            <span>{language.val('login_phone_login')}</span>
          </a>
          <a
            className={classNames(styles.item, {
              [styles.active]: show === 'loginQrcode',
            })}
            onClick={() => setShow('loginQrcode')}
          >
            <Wechat theme="filled" size="24" fill="#666" />
            <span>{language.val('login_wechat_login')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginRegisterBox;
