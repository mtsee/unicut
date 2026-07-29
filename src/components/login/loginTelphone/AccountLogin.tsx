import styles from './styles.module.less';
import { Form, Toast, Button } from '@douyinfe/semi-ui';
import { userService } from '@server/user.service';
import { useState, useEffect } from 'react';
import { pubsub, storage, crypto } from '@utils/index';
import { language } from '@language/language';

export interface IProps {}

export default function AccountLogin(props: IProps) {
  const [captcha, setCaptcha] = useState({
    key: '',
    code: '',
  });

  const handleSubmit = async values => {
    console.log(values);
    const [res, err] = await userService.login({
      account: values.account,
      password: values.password,
      captchaCode: values.code,
      captchaKey: captcha.key,
    });

    if (values.rememberPassword) {
      storage.local.set('account', crypto.encrypt(values.account));
      storage.local.set('password', crypto.encrypt(values.password));
    } else {
      storage.local.remove('account');
      storage.local.remove('password');
    }

    if (res) {
      Toast.success(language.val('login_success'));
    } else {
      Toast.error(err);
    }
    if (err) {
      // 切换验证码
      getImageKey();
      return;
    }
    // 2、获取用户详情，设置x-user-info
    const [userRes, userError] = await userService.getUserDetail();
    if (userRes) {
      (window as any).RouterHistory.push('/workspace/draft');
      pubsub.publish('showLoginModal', false);
    }
  };

  useEffect(() => {
    getImageKey();
  }, []);

  const getImageKey = async () => {
    const [res, err] = await userService.getCaptcha();
    if (res) {
      setCaptcha({
        code: res.captcha_code,
        key: res.captcha_key,
      });
    }
  };

  return (
    <div className={styles.forms}>
      <Form
        initValues={{
          account: crypto.decrypt(storage.local.get('account')),
          password: crypto.decrypt(storage.local.get('password')),
        }}
        onSubmit={values => handleSubmit(values)}
        style={{ width: '100%' }}
      >
        {({ formState, values, formApi }) => (
          <>
            <Form.Input
              field="account"
              label={language.val('login_account')}
              style={{ width: '100%' }}
              placeholder={language.val('login_account_tip')}
            ></Form.Input>
            <Form.Input
              mode="password"
              field="password"
              label={language.val('login_password')}
              style={{ width: '100%' }}
              placeholder={language.val('login_password_tip')}
            ></Form.Input>
            <div className={styles.formSpaceItem}>
              <Form.Input
                field="code"
                label={language.val('login_code')}
                style={{ width: 230 }}
                placeholder={language.val('login_code_tip')}
              ></Form.Input>
              <img className={styles.captcha} onClick={getImageKey} src={captcha.code} alt="" />
            </div>
            <div className={styles.formSpaceItem}>
              <Form.Checkbox field="rememberPassword" noLabel>
                {language.val('login_remember_password')}
              </Form.Checkbox>
            </div>
            <Button
              block
              disabled={!values.account || !values.password || !values.code}
              htmlType="submit"
              type="primary"
            >
              {language.val('login_login')}
            </Button>
          </>
        )}
      </Form>
    </div>
  );
}
