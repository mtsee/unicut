import { Button, Modal, Image, Form, Steps, Space, Toast } from '@douyinfe/semi-ui';
import { useEffect, useReducer, useRef, useState } from 'react';
import styles from './bindMobile.module.less';
import server from './server';
import { user } from '@stores/user';
import { observer } from 'mobx-react';
import { language } from '@language/language';
import Intl from '@language/Intl';

export interface IProps {}

function BindMobile(props: IProps) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const [img, setImg] = useState('');
  const [code, setCode] = useState('');
  const [mobile, setMobile] = useState('');

  //图形验证码
  const getImgCode = async () => {
    let [res, err] = await server.getImgCode();
    if (res) {
      setImg(res.captcha_code);
      setCode(res.captcha_key);
    }
  };

  // 短信验证码倒计时
  const sendTime = useRef(0);
  const timer = useRef<any>();
  const time = ~~((+new Date() - sendTime.current) / 1000);
  const maxTime = 5;

  useEffect(() => {
    getImgCode();
  }, []);

  return (
    <>
      <Button
        onClick={() => {
          timer.current = setInterval(() => {
            forceUpdate();
          }, 1000);
          setVisible(true);
        }}
      >
        {language.val('user_bind')}
      </Button>
      <Modal
        maskClosable={false}
        width={400}
        footer={null}
        title={language.val('user_bind_mobile')}
        visible={visible}
        onCancel={() => {
          setVisible(false);
          sendTime.current = 0;
          clearInterval(timer.current);
          setStep(0);
        }}
      >
        <Steps type="basic" current={step} onChange={i => console.log(i)}>
          <Steps.Step
            onClick={() => {
              setStep(0);
            }}
            title={language.val('user_get_code')}
          />
          <Steps.Step title={language.val('user_input_code')} />
        </Steps>
        {step === 0 && (
          <Form
            className={styles.form}
            onSubmit={async vals => {
              console.log(vals);
              setMobile(vals.mobile);
              const [res, err] = await server.getMobileCode({
                ...vals,
                captchaKey: code,
              });
              if (err) {
                Toast.error(err);
                return;
              } else {
                Toast.success(language.val('user_code_tip'));
              }

              // 发送短信
              sendTime.current = +new Date();
              setStep(1);
            }}
          >
            <Form.Input
              field="mobile"
              label={language.val('user_mobile')}
              trigger="blur"
              rules={[
                { required: true, message: language.val('user_mobile_tip') },
                {
                  validator: (rule, value) => {
                    const regex = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;
                    return regex.test(value);
                  },
                  message: language.val('user_mobile_format_tip'),
                },
              ]}
            />
            <Form.Slot
              label={{
                text: language.val('user_captcha'),
              }}
            >
              <div className={styles.code}>
                <Form.Input field="captchaCode" noLabel placeholder={language.val('user_captcha_tip')} trigger="blur" />
                <Image style={{background: '#ccc'}} onClick={getImgCode} preview={false} width={100} height={30} src={img} />
              </div>
            </Form.Slot>
            <Button disabled={time < maxTime} className={styles.submit} block theme="solid" htmlType="submit">
              <Intl name="user_get_code_tip" /> {time < maxTime ? maxTime - time + 's' : null}
            </Button>
          </Form>
        )}
        {step === 1 && (
          <Form
            className={styles.form}
            onSubmit={async vals => {
              const [res, err] = await server.getBindMobile({
                mobile,
                code: vals.code,
              });
              if (err) {
                return Toast.error(err);
              }
              user.info.mobile = mobile;
              Toast.success(language.val('user_bind_success'));
            }}
          >
            <Form.Input field="code" label={language.val('user_code')} placeholder={language.val('user_code_tip')} />
            <Button className={styles.submit} block theme="solid" htmlType="submit">
              {language.val('user_submit')}
            </Button>
          </Form>
        )}
      </Modal>
    </>
  );
}

export default observer(BindMobile);
