import React, { useEffect, useState } from 'react';
import styles from './loading.module.less';
import { IconSpin } from '@douyinfe/semi-icons';
import { pubsub } from '@utils/pubsub';
export interface IProps {}

export default function Loading(props: IProps) {
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    pubsub.subscribe('windowLoading', (_msg, val) => {
      setShow(val.show);
      if (val.show) {
        setMsg(val.msg);
      } else {
        setMsg('');
      }
    });
    return () => {
      pubsub.unsubscribe('windowLoading');
    };
  }, []);

  return (
    <div className={styles.loading} style={{ display: show ? 'flex' : 'none' }}>
      <span>
        <IconSpin spin size="large" />
        &nbsp;&nbsp;{msg || 'Loading...'}
      </span>
    </div>
  );
}
