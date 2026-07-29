import { Button, Modal, Image, Form, Steps, Space, Toast } from '@douyinfe/semi-ui';
import { useState } from 'react';
import styles from './bindMobile.module.less';
import server from './server';
import { user } from '@stores/user';
import { observer } from 'mobx-react';
import { language } from '@language/language';
export interface IProps {}

function BindEmail(props: IProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');

  return (
    <>
      <Button
        onClick={() => {
          setVisible(true);
        }}
      >
        {language.val('user_bind')}
      </Button>
      <Modal
        maskClosable={false}
        width={400}
        footer={null}
        title={language.val('user_bind_email')}
        visible={visible}
        onCancel={() => {
          setVisible(false);
          setStep(0);
        }}
      >
        <Steps type="basic" current={step} onChange={i => console.log(i)}>
          <Steps.Step title={language.val('user_get_code_tip')} />
          <Steps.Step title={language.val('user_code')} />
        </Steps>
        {step === 0 && (
          <Form
            className={styles.form}
            onSubmit={async vals => {
              console.log(vals);
              const [res, err] = await server.getEmailCode({
                email: vals.email,
              });
              if (err) {
                return Toast.error(err);
              }
              setEmail(vals.email);
              Toast.success(language.val('user_email_code_tip'));
              setStep(1);
            }}
          >
            <Form.Input
              field="email"
              label={language.val('user_email')}
              placeholder={language.val('user_email_tip')}
              trigger="blur"
              rules={[
                { required: true, message: language.val('user_email_empty_tip') },
                { type: 'email', message: language.val('user_email_format_tip') },
              ]}
            />
            <Button className={styles.submit} block theme="solid" htmlType="submit">
              {language.val('user_email_send_code_tip')}
            </Button>
          </Form>
        )}
        {step === 1 && (
          <Form
            className={styles.form}
            onSubmit={async vals => {
              console.log(vals);
              const [res, err] = await server.getBindEmail({
                email,
                code: vals.code,
              });
              if (err) {
                return Toast.error(err);
              }
              user.info.email = email;
              Toast.success(language.val('user_bind_success'));
            }}
          >
            <Form.Input
              rules={[{ required: true, message: language.val('user_email_empty_tip') }]}
              trigger="blur"
              field="code"
              label={language.val('user_email_code')}
              placeholder={language.val('user_email_code_tip2')}
            />
            <Button className={styles.submit} block theme="solid" htmlType="submit">
              {language.val('user_submit')}
            </Button>
          </Form>
        )}
        {step === 2 && <></>}
      </Modal>
    </>
  );
}

export default observer(BindEmail);
