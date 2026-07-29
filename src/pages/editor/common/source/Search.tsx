import styles from './search.module.less';
import { Input, Popover } from '@douyinfe/semi-ui';
import { Left, Search as IconSearch } from '@icon-park/react';
import type { SourceType } from '@config/types';
import { useState, useRef, useCallback, useEffect } from 'react';
import { getItems } from '@pages/editor/server';
import SourceList from './SourceList';
import type { SourceItem } from '../../types';
import { language } from '@language/language';

export interface IProps {
  type: SourceType;
  keywords: string;
  onEnterPress: (e: any) => void;
  item: (a: SourceItem) => JSX.Element;
  itemClassName: string;
  addItem: (a: SourceItem) => void;
  getListServer: any;
}

export default function Search(props: IProps) {
  const { type, keywords } = props;
  const [val, setVal] = useState(keywords);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useRef({
    page: 1,
    page_size: 20,
    keyword: val,
    category_id: '',
  });

  const getMaterialList = useCallback(async () => {
    setLoading(true);
    const { list, total } = await getItems(type, params.current, null, props.getListServer);
    setItems(list);
    setTotal(total);
    setLoading(false);
  }, [type, props.getListServer]);

  const handlePageChange = (page: number) => {
    params.current.page = page;
    getMaterialList();
  };

  useEffect(() => {
    params.current.keyword = val;
    params.current.page = 1;
    getMaterialList();
  }, [val]);

  return (
    <div className={styles.source}>
      <div className={styles.header}>
        <section className={styles.search}>
          <a className={styles.back} onClick={() => props.onEnterPress('')}>
            <Left theme="outline" size="24" fill="var(--theme-icon)" />
          </a>
          <Input
            defaultValue={val}
            onEnterPress={(e: any) => {
              setVal(e.target.value);
            }}
            placeholder={language.val('common_search')}
            suffix={<IconSearch size={18} style={{ marginRight: 5 }} />}
            showClear
          />
        </section>
      </div>
      <div className={styles.list + ' scroll'} id={`sourceItemsScrollDOM_search_${props.type}`}>
        <SourceList
          total={total}
          page={params.current.page}
          pageSize={params.current.page_size}
          items={items}
          type={type}
          loading={loading}
          onPageChange={handlePageChange}
          item={props.item}
          itemClassName={props.itemClassName}
          addItem={props.addItem}
        />
      </div>
    </div>
  );
}