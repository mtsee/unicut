import { Button, Modal, Image, Form, Steps, Space, Toast } from '@douyinfe/semi-ui';
import { useState, useRef, useEffect } from 'react';
import styles from './bindWechat.module.less';
import server from './server';
import { user } from '@stores/user';
import { observer } from 'mobx-react';
import { language } from '@language/language';

export interface IProps {
  bindSuccess: () => void;
}

function BindWechat(props: IProps) {
  const [visible, setVisible] = useState(false);
  const [code, setCode] = useState('');
  const [sn, setSn] = useState('');
  const timer = useRef<any>();

  //轮询监测
  const seekBind = async sn => {
    timer.current = setTimeout(async () => {
      const [res, err] = await server.getHandleCode(sn);
      if (!res) {
        seekBind(sn);
      } else {
        clearTimeout(timer.current);
        Toast.success(language.val('user_bind_success'));
        props.bindSuccess();
        setVisible(false);
      }
    }, 3000);
  };

  // 获取二维码
  const getWeChatQrCode = async () => {
    const [res, err] = await server.getWeChatQrCode();
    console.log(res.sn);
    if (err) {
      return Toast.error(err);
    }
    setCode(res.url);
    setSn(res.sn);
    seekBind(res.sn);
  };

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return (
    <>
      <Button
        onClick={() => {
          getWeChatQrCode();
          setVisible(true);
        }}
      >
        {language.val('user_bind_wechat')}
      </Button>
      <Modal
        title={language.val('user_bind_wechat')}
        footer={null}
        width={300}
        visible={visible}
        onCancel={() => {
          setVisible(false);
          if (timer.current) {
            clearTimeout(timer.current);
          }
        }}
      >
        <div className={styles.bindWeChat}>
          <div className={styles.qrCode}>
            <img src={code} alt="" width={190} height={190} />
          </div>
          <span> {language.val('user_bind_wechat_tip')}</span>
        </div>
      </Modal>
    </>
  );
}

export default observer(BindWechat);
