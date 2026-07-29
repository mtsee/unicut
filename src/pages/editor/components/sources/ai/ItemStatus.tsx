import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { LoadingFour, Success, Loading, Caution, Hourglass, More } from '@icon-park/react';
import styles from './item.module.less';
// import { theme } from '@theme';
// import { language } from '@language/language';
import { Dropdown } from '@douyinfe/semi-ui';
import { stores } from '@stores/index';

type Props = {
  deleteItem(data: any): void;
  data: any;
  status: number;
};

const ItemStatus = (props: Props) => {
  const { editor } = stores;
  const data = props.data;
  const taskId = data.task_id;
  const statusItem = editor.aiLoopStatus[taskId] || data;

  useEffect(() => {
    if ([1, 2].includes(statusItem.status)) {
      editor.aiLoopStatus[taskId] = statusItem;
    }
  }, [statusItem.status]);

  // 状态(0-待处理 1-处理中 2-处理成功 3-处理失败)
  return (
    <>
      <Dropdown
        position={'bottom'}
        render={
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => props.deleteItem(data)}>删除</Dropdown.Item>
            {/* <Dropdown.Item>重新合成</Dropdown.Item> */}
          </Dropdown.Menu>
        }
      >
        <div className={styles.more}>
          <More theme="outline" size="20" fill="var(--theme-icon)" />
        </div>
      </Dropdown>
      <span className={styles.tip}>
        {statusItem.status === 1 && (
          <>
            <Hourglass theme="outline" size="12" fill="#FB6262" strokeWidth={3} />
            <i style={{ color: 'green' }}>准备中...</i>
          </>
        )}
        {statusItem.status === 2 && (
          <>
            <LoadingFour className={styles.rotate} theme="filled" size="16" fill={'#fff'} strokeWidth={3} />
            <i style={{ color: '#fff' }}>生成中...</i>
          </>
        )}
        {statusItem.status === 3 && (
          <>
            <Success theme="filled" size="16" fill="#12C04C" strokeWidth={3} />
            <i style={{ color: '#12C04C' }}>成功</i>
          </>
        )}
        {statusItem.status === 4 && (
          <>
            <Caution theme="filled" size="16" fill="#ff6464ff" strokeWidth={3} />
            <i style={{ color: '#ff6464ff' }}>失败</i>
          </>
        )}
      </span>
    </>
  );
};

export default observer(ItemStatus);
