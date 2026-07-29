import styles from './styles.module.less';
import { Pagination, Badge, Empty, Spin } from '@douyinfe/semi-ui';
import { IllustrationConstruction, IllustrationConstructionDark } from '@douyinfe/semi-illustrations';
import { util } from '@utils/index';
import { pubsub } from '@utils/pubsub';
import server from './server';
import { useEffect, useState, useRef } from 'react';
import { language } from '@language/language';

export interface IProps {
  type: number | string;
}

export default function List(props: IProps) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const page = useRef({
    page: 1,
    page_size: 20,
    total: 0,
  });

  //列表
  const getMessage = async () => {
    setLoading(true);
    const [res, err] = await server.getMessage({ page: page.current.page, page_size: page.current.page_size, type_id: props.type });
    page.current.total = res.total;
    setList(res.data);
    setLoading(false);
  };

  useEffect(() => {
    getMessage();
  }, []);

  if(loading) {
    return <div className={styles.loading}><Spin size='middle'/></div>
  }

  if(!list.length){
    return (
      <Empty
      image={<IllustrationConstruction style={{ width: 150, height: 150, marginTop: 40 }} />}
      darkModeImage={<IllustrationConstructionDark style={{ width: 150, height: 150, marginTop: 40 }} />}
      description="No news"
      />
    )
  }
 
  return (
    <div className={styles.list}>
      <div className={styles.items}>
        {list.map((item, i) => {
          return (
            <section
              onClick={() => {
                pubsub.publish('setDetailID', item.id);
              }}
              key={item.id}
              className={styles.item}
            >
              <span className={styles.date}>
                <em>{util.formatDate(item.message.send_date, 'MM-DD')}</em>
                <i>{util.formatDate(item.message.send_date, 'YYYY')}</i>
              </span>
              <span className={styles.info}>
                <h2>
                  {item.status ? (
                    <Badge count={language.val('user_message_read')} type="tertiary" theme="inverted" />
                  ) : (
                    <Badge count={language.val('user_message_new')} theme="solid" type="danger" />
                  )}
                  &nbsp;
                  {item.message.title}
                </h2>
                <p dangerouslySetInnerHTML={{ __html: item.message.contents }}></p>
              </span>
            </section>
          );
        })}
      </div>
      <Pagination
        onPageChange={v => {
          page.current.page = v;
          getMessage();
        }}
        total={page.current.total}
        style={{ marginBottom: 12 }}
      ></Pagination>
    </div>
  );
}
