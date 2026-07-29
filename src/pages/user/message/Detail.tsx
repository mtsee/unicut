import styles from './styles.module.less';
import {useEffect, useState} from 'react';
import { Left } from '@icon-park/react';
import { pubsub } from '@utils/pubsub';
import { util } from '@utils/index';
import server from './server';
import { language } from '@language/language';

export interface IProps {
  id: string;
}

export default function Detail(props: IProps) {
  const [messageDetail, setMessageDetail] = useState<any>();
  //获取消息详情
  const getMessageDetail = async () => {
    const [res, err] = await server.getMessageDetail(props.id);
    setMessageDetail(res);
  }

  useEffect(()=> {
    getMessageDetail();
  }, [])

  return (
    <div className={styles.detail}>
      <div className={styles.header}>
        <a
          onClick={() => {
            pubsub.publish('setDetailID', '');
          }}
        >
          <Left theme="outline" size="20" fill="var(--theme-icon)" />
          {language.val('user_message_back')}
        </a>
      </div>
      <h1>{messageDetail?.message?.title}</h1>
      <div className={styles.date}>{util.formatDate(messageDetail?.createdAt)}</div>
      <div className={styles.context} dangerouslySetInnerHTML={{__html: messageDetail?.message?.contents}}>
      </div>
    </div>
  );
}
