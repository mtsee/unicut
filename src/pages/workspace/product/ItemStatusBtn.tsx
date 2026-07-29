import React, { useEffect, useReducer } from 'react';
import styles from './item.module.less';
import { Button, Modal } from '@douyinfe/semi-ui';
import { useHistory } from 'react-router';
import { user } from '@stores/user';
import { observer } from 'mobx-react';
import { userService } from '@server/user.service';
import { config } from '@config/index';
import { language } from '@language/language';
import { Download, Loading } from '@icon-park/react';

type Props = {
  data: any;
};

const ItemStatusBtn = (props: Props) => {
  const data = props.data;
  const history = useHistory();
  const taskId = data.id;
  user.lunXunStatusRes[taskId];

  // 状态(0-待处理 1-处理中 2-处理成功 3-处理失败)

  return (
    <div className={styles.btns}>
      {/* <Button style={{ color: '#000' }} color="primary">
        去编辑
      </Button> */}
      {data.status === 0 && (
        <a className={styles.btn} color="primary">
          <Loading theme="outline" size="14" fill="var(--theme-main)" strokeWidth={3} />
          &nbsp;{language.val('product_preparing')}
        </a>
      )}
      {/* {data.status === 3 && (
        <a onClick={() => {}} className={styles.btn} color="primary">
          失败/重试
        </a>
      )} */}
      {data.status === 2 && (
        <>
          <a
            className={styles.btn}
            download={'video.mp4'}
            target="_blank"
            href={config.resourcesHost + (data.video ? data.video : data.result.storageUrl)}
          >
            <Download theme="outline" size="14" fill="var(--theme-main)" strokeWidth={3} />
            &nbsp;{language.val('product_download')}
          </a>
        </>
      )}
      {data.status === 1 && (
        <a className={styles.btn} style={{ opacity: 0.5, cursor: 'not-allowed', color: 'var(--theme-text)' }}>
          {/* <Loading theme="outline" size="14" fill="var(--theme-text)" strokeWidth={3} /> */}
          Encoding...
        </a>
      )}
    </div>
  );
};

export default observer(ItemStatusBtn);
