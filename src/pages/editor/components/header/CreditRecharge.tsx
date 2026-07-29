import styles from './creditRecharge.module.less';
import { Avatar, Button, Modal, Spin, Toast } from '@douyinfe/semi-ui';
import { CheckOne } from '@icon-park/react';
import { useEffect, useRef, useState } from 'react';
import { server } from '@pages/editor/server';
import { userService } from '@server/user.service';
import { stores } from '@stores/index';

interface IProps {
  visible: boolean;
  onCancel: () => void;
}

const statusMap: Record<number, string> = {
  0: '待支付',
  1: '已支付，正在发放',
  2: '充值成功',
  3: '已关闭',
  4: '发放失败，请联系管理员',
};

const CreditRecharge = (props: IProps) => {
  const { user } = stores;
  const [packages, setPackages] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState(1800);
  const timerRef = useRef<any>();
  const countdownRef = useRef<any>();
  const orderCacheRef = useRef<Record<string, any>>({});

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const clearAllTimers = () => {
    clearTimer();
    clearCountdown();
  };

  const getOrderRemainingSeconds = (data: any) => {
    if (!data) return 0;
    const expireAt = data.expire_at || data.details?.payment_order?.expireAt || data.details?.payment_order?.expire_at;
    if (expireAt) {
      return Math.max(Math.floor((new Date(expireAt).getTime() - Date.now()) / 1000), 0);
    }
    return Math.max(Number(data.remaining_seconds || 0), 0);
  };

  const isOrderAvailable = (data: any) => Number(data?.status || 0) === 0 && getOrderRemainingSeconds(data) > 0;

  const formatRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = Math.max(seconds % 60, 0)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  const handlePaymentSuccess = async () => {
    clearAllTimers();
    orderCacheRef.current = {};
    Toast.success('充值成功');
    await userService.getUserDetail();
    props.onCancel();
  };

  const loadPackages = async () => {
    const [res, err] = await server.getCreditPackages();
    if (err) {
      Toast.error(err);
      return;
    }
    setPackages(res || []);
    const first = res?.[0] || null;
    if (first) {
      selectPackage(first);
    }
  };

  const pollStatus = (orderId: string) => {
    clearTimer();
    timerRef.current = setInterval(async () => {
      const [res, err] = await server.getCreditOrderStatus(orderId);
      if (err) {
        return;
      }
      setStatus(Number(res.status));
      if (Number(res.status) === 2) {
        await handlePaymentSuccess();
      }
    }, 3000);
  };

  const startCountdown = (data: any) => {
    clearCountdown();
    setRemainingSeconds(getOrderRemainingSeconds(data));
    countdownRef.current = setInterval(() => {
      setRemainingSeconds(seconds => {
        if (seconds <= 1) {
          clearCountdown();
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
  };

  const refreshStatus = async () => {
    if (!order?.id) return;
    const [res, err] = await server.getCreditOrderStatus(order.id);
    if (err) {
      Toast.error(err);
      return;
    }
    setStatus(Number(res.status));
    if (Number(res.status) === 2) {
      await handlePaymentSuccess();
    }
  };

  const selectPackage = async (item: any) => {
    setSelected(item);
    setStatus(0);
    clearAllTimers();
    const cachedOrder = orderCacheRef.current[String(item.id)];
    if (isOrderAvailable(cachedOrder)) {
      setOrder(cachedOrder);
      setStatus(Number(cachedOrder.status || 0));
      startCountdown(cachedOrder);
      pollStatus(cachedOrder.id);
      return;
    }
    setOrder(null);
    setLoading(true);
    const [res, err] = await server.createCreditOrder(item.id);
    setLoading(false);
    if (err) {
      Toast.error(err);
      return;
    }
    setOrder(res);
    orderCacheRef.current[String(item.id)] = res;
    setStatus(Number(res.status || 0));
    startCountdown(res);
    pollStatus(res.id);
  };

  useEffect(() => {
    if (props.visible) {
      setSelected(null);
      setOrder(null);
      setStatus(0);
      setRemainingSeconds(1800);
      orderCacheRef.current = {};
      loadPackages();
    }
    return clearAllTimers;
  }, [props.visible]);

  return (
    <Modal
      title={null}
      zIndex={1100}
      visible={props.visible}
      onCancel={() => {
        clearAllTimers();
        props.onCancel();
      }}
      closeOnClickModal={false}
      footer={null}
      width={800}
      className={styles.rechargeModal}
    >
      <div className={styles.recharge}>
        <h2 className={styles.header}>
          积分充值
          <span className={styles.subtitle}>当前积分：{user?.info?.credits || 0}，积分可用于视频生成、智能工具、素材处理等场景</span>
        </h2>

        <div className={styles.packages}>
          {packages.map((item: any) => (
            <button
              key={item.id}
              className={selected?.id === item.id ? styles.active : ''}
              onClick={() => selectPackage(item)}
            >
              <strong>{item.name}</strong>
              <em>
                <i>¥</i>
                {Number(item.price || 0)}
              </em>
              <span>{item.credits} 积分</span>
              {item.description && <small>{item.description}</small>}
              <b>
                <CheckOne theme="outline" size="22" fill="#fff" />
              </b>
            </button>
          ))}
        </div>

        <div className={styles.pay}>
          <div className={styles.qrcodeBox}>
            <div className={styles.qrcode}>
              {loading || !order?.pay_url_base64 ? <Spin /> : <img src={order.pay_url_base64} />}
            </div>
            <p className={styles.qrCountdown}>
              {remainingSeconds > 0 ? `过期倒计时：${formatRemaining(remainingSeconds)}` : '二维码已过期'}
            </p>
          </div>
          <div className={styles.payInfo}>
            <p>
              应付金额：<strong>¥{Number(selected?.price || 0)}</strong>
            </p>
            <div className={styles.channels}>
              <span className={styles.wechat}>微</span>
              <span className={styles.alipay}>支</span>
              <em>使用微信、支付宝扫码支付</em>
            </div>
            <p className={styles.status}>{statusMap[status] || '等待支付'}</p>
            <Button onClick={refreshStatus} disabled={!order?.id}>
              刷新状态
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreditRecharge;
