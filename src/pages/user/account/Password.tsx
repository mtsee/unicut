import { observer } from 'mobx-react';
import styles from './password.module.less';
import { Button, Modal, Form, Toast } from '@douyinfe/semi-ui';
import { useEffect, useRef, useState } from 'react';
import server from './server';
import { language } from '@language/language';

export interface IProps {
  hasBind: boolean;
}

function Password(props: IProps) {
  const [visible, setVisible] = useState(false);
  const formRef = useRef<Form>();

  return (
    <>
      <Button
        onClick={() => {
          setVisible(true);
        }}
      >
        {language.val('user_password_set_tip')}
      </Button>
      <Modal visible={visible} footer={null} title={language.val('user_password_set_tip')} onCancel={() => setVisible(false)}>
        <Form
          ref={formRef}
          onSubmit={async vals => {
            const [res, err] = await server.gerBindPassword({
              old_password: vals.old_password || '',
              password: vals.password,
            });
            if (err) {
              return Toast.error(err);
            }
            Toast.success(language.val('user_password_set_success'));
            setVisible(false);
          }}
        >
          {props.hasBind && (
            <Form.Input
              trigger="blur"
              field="old_password"
              label={language.val('user_old_password')}
              autoComplete="off"
              rules={[{ required: true, message: language.val('user_old_password_tip') }]}
            />
          )}
          <Form.Input
            field="password"
            trigger="blur"
            autoComplete="off"
            label={language.val('user_new_password')}
            rules={[
              { required: true, message: language.val('user_password_set_tip') },
              {
                validator: (rule, value) => {
                  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
                  return passwordRegex.test(value);
                },
                message: language.val('user_password_set_format_tip'),
              },
            ]}
          />
          <Form.Input
            type="password"
            field="repassword"
            autoComplete="off"
            trigger="blur"
            rules={[
              { required: true, message: language.val('user_empty_tip') },
              {
                validator: (rule, value) => {
                  return value === formRef.current.formApi.getValue('password');
                },
                message: language.val('user_password_set_diff_tip'),
              },
            ]}
            label={language.val('user_password_set_repassword_tip')}
          />
          <Button className={styles.submit} block theme="solid" htmlType="submit">
            {language.val('user_submit')}
          </Button>
        </Form>
      </Modal>
    </>
  );
}

export default observer(Password);
