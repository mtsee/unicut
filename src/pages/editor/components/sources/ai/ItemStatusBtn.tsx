import React, { useEffect, useReducer } from 'react';
import styles from './item.module.less';
import { observer } from 'mobx-react';
// import { config } from '@config/index';
import { language } from '@language/language';
import { Download, Loading } from '@icon-park/react';
import { stores } from '@stores/index';

type Props = {
  data: any;
};

const ItemStatusBtn = (props: Props) => {
  const { editor } = stores;
  const data = props.data;
  const taskId = data.id;
  editor.aiLoopStatus[taskId];
  // 状态(0-待处理 1-处理中 2-处理成功 3-处理失败)

  return (
    <div className={styles.btns}>
      {data.status === 1 && (
        <a className={styles.btn} color="primary">
          <Loading theme="outline" size="14" fill="var(--theme-main)" strokeWidth={3} />
          &nbsp;{language.val('product_preparing')}
        </a>
      )}
      {/* {data.status === 4 && (
        <a onClick={() => {}} className={styles.btn} color="primary">
          失败/重试
        </a>
      )} */}
      {data.status === 2 && (
        <a className={styles.btn} style={{ opacity: 0.5, cursor: 'not-allowed', color: 'var(--theme-text)' }}>
          {/* <Loading theme="outline" size="14" fill="var(--theme-text)" strokeWidth={3} /> */}
          Encoding...
        </a>
      )}
      {data.status === 3 && (
        <>
          <a
            className={styles.btn}
            download={'video.mp4'}
            target="_blank"
            href={editor.resourcesHost + (data.video ? data.video : data.result.storageUrl)}
          >
            <Download theme="outline" size="14" fill="var(--theme-main)" strokeWidth={3} />
            &nbsp;{language.val('product_download')}
          </a>
        </>
      )}
    </div>
  );
};

export default observer(ItemStatusBtn);
