import styles from './collect.module.less';
import { Left } from '@icon-park/react';
import type { SourceType } from '@config/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getItems } from '@pages/editor/server';
import SourceList from './SourceList';
import type { SourceItem } from '../../types';
import Intl from '@language/Intl';
import { stores } from '@stores/index';

export interface IProps {
  type: SourceType;
  onBack: () => void;
  item: (a: SourceItem) => JSX.Element;
  itemClassName: string;
}

export default function Collect(props: IProps) {
  const { editor } = stores;
  const [items, setItems] = useState<any[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const params = useRef({
    page: 1,
    page_size: 20,
    keyword: '',
    category_id: '',
  });
  const { type } = props;

  // 获取素材
  const getList = useCallback(async () => {
    setLoading(true);
    const { list, total } = await getItems(type, params.current, null, editor.apiServer.getCollects);
    setItems(list);
    setTotal(total);
    setLoading(false);
  }, [type, editor.apiServer.getCollects]);

  const handlePageChange = (page: number) => {
    params.current.page = page;
    getList();
  };

  const handleItems = (id: string) => {
    const list = items?.filter(item => {
      return item.id !== id;
    });
    if (!list || list.length === 0) {
      props.onBack();
      return;
    }
    setItems(list);
    setTotal(total - 1);
  };

  useEffect(() => {
    getList();
  }, []);

  return (
    <div className={styles.source}>
      <div className={styles.header}>
        <section className={styles.search}>
          <a className={styles.back} onClick={() => props.onBack()}>
            <Left theme="outline" size="24" fill="var(--theme-icon)" />
          </a>
          <h1 className={styles.title}>
            <Intl name="source_favorite" />
          </h1>
        </section>
      </div>
      <div className={styles.list + ' scroll'}>
        <SourceList
          sType="collect"
          total={total}
          page={params.current.page}
          pageSize={params.current.page_size}
          items={items}
          type={type}
          loading={loading}
          onPageChange={handlePageChange}
          item={props.item}
          itemClassName={props.itemClassName}
          callback={handleItems}
        />
      </div>
    </div>
  );
}