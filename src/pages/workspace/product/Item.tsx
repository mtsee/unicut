import React, { useState, useEffect, useRef, useReducer } from 'react';
import styles from './item.module.less';
import { Calendar, More, Edit } from '@icon-park/react';
import { theme } from '@theme';
import dayjs from 'dayjs';
import { user } from '@stores/user';
import ItemStatus from './ItemStatus';
import ItemStatusBtn from './ItemStatusBtn';
import { useHistory } from 'react-router';
import { config } from '@config/index';
import { language } from '@language/language';
import { observer } from 'mobx-react';
import { Dropdown, Popover, Space } from '@douyinfe/semi-ui';
import { server } from './server';

type Props = {
  data: any;
  update?: any;
  deleteItem: (data: any) => void;
};

function Item(props: Props) {
  const { data, deleteItem } = props;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const history = useHistory();

  useEffect(() => {
    // 轮训当前的合成进度
    // console.log('user.lunXunStatus',data.status);
    if ([1, 0].includes(data.status)) {
      user.lunXunStatus.push(data.id);
      user.lunXunStatus = user.lunXunStatus.filter(d => d);
      user.lunXunStatus = Array.from(new Set(user.lunXunStatus));
      user.lunXunStatusCahceItem[data.id] = data;
    }
  }, [data.status]);

  user.lunXunStatusRes[data.id];

  console.log('user.lunXunStatusRes>>>', data, user.lunXunStatusRes[data.id]);

  let status = data.status;
  if (user.lunXunStatusRes[data.id]) {
    status = user.lunXunStatusRes[data.id]?.status;
  }

  return (
    <>
      <div className={styles.item}>
        <Dropdown
          position={'bottom'}
          render={
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() =>props.deleteItem(data)}
              >
                删除
              </Dropdown.Item>
              {/* <Dropdown.Item>重新合成</Dropdown.Item> */}
            </Dropdown.Menu>
          }
        >
          <div className={styles.more}>
            <More theme="outline" size="20" fill="var(--theme-icon)" />
          </div>
        </Dropdown>
        <ItemStatus data={data} status={status} />
        <div className={styles.context}>
          <div className={styles.video} style={{ backgroundImage: `url(${data.user_app.thumb})` }}>
            {/* {data.result ? <video src={config.resourcesHost + data.video}></video> : null} */}
          </div>
        </div>
        <h1>
          {data.user_app.name || 'Untitled'}-{data.status}
        </h1>
        <div className={styles.info}>
          <Space>
            <span>
              <em>{language.val('product_fps')}：</em>
              {data.params.fps}s
            </span>
            <span>
              <em>{language.val('product_resolution')}：</em>
              {data.params.resolution}
            </span>
            <span>
              <em>{language.val('product_duration')}：</em>
              {data.user_app.duration}s
            </span>
          </Space>
        </div>
        <div className={styles.footer}>
          <div className={styles.date}>
            <Calendar theme="outline" size="16" fill={'var(--theme-icon)'} strokeWidth={3} />
            <span>&nbsp;{dayjs(data.updatedAt).format('YYYY-MM-DD hh:mm:ss')}</span>
          </div>
          <ItemStatusBtn data={data} />
        </div>
      </div>
    </>
  );
}

export default observer(Item);
