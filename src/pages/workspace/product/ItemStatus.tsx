import { observer } from 'mobx-react';
import React from 'react';
import { LoadingFour, Success, Loading, Caution } from '@icon-park/react';
import styles from './item.module.less';
import { theme } from '@theme';
import { user } from '@stores/user';
import { language } from '@language/language';

type Props = {
  data: any;
  status: number;
};

const ItemStatus = (props: Props) => {
  const data = props.data;
  const taskId = data.id;
  const statusItem = user.lunXunStatusRes[taskId];

  let status = data.status;
  if (statusItem) {
    status = statusItem.status;
  }

  // 状态(0-待处理 1-处理中 2-处理成功 3-处理失败)
  return (
    <>
      <span className={styles.tip}>
        {status === 0 && (
          <>
            {/* <Hourglass theme="outline" size="12" fill="#FB6262" strokeWidth={3} /> */}
            <i style={{ color: 'green' }}>{language.val('product_preparing')}</i>
          </>
        )}
        {status === 1 && (
          <>
            <LoadingFour className={styles.rotate} theme="filled" size="16" fill={'#fff'} strokeWidth={3} />
            <i style={{ color: '#fff' }}>
              {language.val('product_composing', { progress: statusItem ? statusItem.result.progress || 0 : 0 })}
            </i>
          </>
        )}
        {status === 2 && (
          <>
            <Success theme="filled" size="16" fill="#12C04C" strokeWidth={3} />
            <i style={{ color: '#12C04C' }}>{language.val('product_completed')}</i>
          </>
        )}
        {status === 3 && (
          <>
            <Caution theme="filled" size="16" fill="#ff6464ff" strokeWidth={3} />
            <i style={{ color: '#ff6464ff' }}>{language.val('product_failed')}</i>
          </>
        )}
      </span>
    </>
  );
};

export default observer(ItemStatus);
