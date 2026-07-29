import styles from './source.module.less';
import { Input, Popover } from '@douyinfe/semi-ui';
import { Filter, HamburgerButton, Like, Search as IconSearch } from '@icon-park/react';
import type { SourceType } from '@config/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import Search from './Search';
import Collect from './Collect';
import { getItems } from '@pages/editor/server';
import { IconSpin } from '@douyinfe/semi-icons';
import SourceList from './SourceList';
import type { SourceItem } from '../../types';
import type { APIServer } from '@config/sdk.d';
import { language } from '@language/language';
import { stores } from '@stores/index';
import { pubsub } from '@utils/pubsub';

export interface IProps {
  type: SourceType;
  item: (a: SourceItem) => JSX.Element;
  itemClassName: string;
  mock?: any;
  addItem?: (a: any) => void; // 只有模版才会传入此参数，其他元素的添加在DragItem中
  apiServer?: APIServer;
}

export default function Source(props: IProps) {
  const [keywords, setKeywords] = useState('');
  const [collect, setCollect] = useState(false);
  const [types, setTypes] = useState<any[] | null>(null);
  const [items, setItems] = useState<any[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const params = useRef({
    page: 1,
    page_size: 30,
    keyword: '',
    category_id: '',
  });
  const { type } = props;
  const { editor } = stores;
  const apiServer = editor.apiServer;

  // 获取素材
  const getMaterialList = useCallback(async () => {
    setLoading(true);
    const { list, total } = await getItems(
      type,
      params.current,
      null,
      type === 'template' ? apiServer.getTemplates : apiServer.getMaterials,
    );
    setItems(list);
    setTotal(total);
    setLoading(false);
  }, [type, apiServer]);

  // 获取分类
  const getTypeList = useCallback(async () => {
    if (type === 'template') {
      const [res, err] = await apiServer.getTemplateTypes();
      if (!err) {
        setTypes(res);
      }
    } else {
      const [res, err] = await apiServer.getMaterialTypes(type);
      if (!err) {
        setTypes(res);
      }
    }
  }, [type, apiServer]);

  useEffect(() => {
    if (props.mock) {
      setItems(props.mock);
      setTotal(props.mock.length);
    } else {
      getTypeList();
      getMaterialList();
    }
  }, []);

  useEffect(() => {
    pubsub.subscribe(`updateItemCollect_${type}`, (_e, data) => {
      const item = items?.find(d => d.id === data.id);
      if (item) {
        item.is_collected = data.collect;
        setItems([...items]);
      }
    });

    return () => {
      pubsub.unsubscribe(`updateItemCollect_${type}`);
    };
  }, [items, type]);

  const handlePageChange = (page: number) => {
    params.current.page = page;
    getMaterialList();
  };

  const content = (
    <div className={styles.popoverTags + ' scroll'}>
      <ul className={styles.ul}>
        {types &&
          types.map(d => {
            return (
              <li
                onClick={() => {
                  setKeywords(d.name);
                }}
                key={d.id}
              >
                {d.name}
              </li>
            );
          })}
      </ul>
    </div>
  );

  if (collect) {
    return (
      <Collect
        type={props.type}
        onBack={() => setCollect(false)}
        item={props.item}
        itemClassName={props.itemClassName}
      />
    );
  }

  if (keywords) {
    return (
      <Search
        type={props.type}
        keywords={keywords}
        itemClassName={props.itemClassName}
        addItem={props.addItem}
        item={props.item}
        getListServer={props.type === 'template' ? apiServer.getTemplates : apiServer.getMaterials}
        onEnterPress={val => {
          setKeywords(val);
        }}
      />
    );
  }

  return (
    <div className={styles.source}>
      <div className={styles.header}>
        <section className={styles.search}>
          <Input
            onEnterPress={(e: any) => {
              setKeywords(e.target.value);
            }}
            placeholder={language.val('common_search')}
            suffix={<IconSearch size={18} style={{ marginRight: 5 }} />}
            showClear
          />
        </section>
        <section className={styles.tags}>
          <a onClick={() => setCollect(true)} className={styles.save}>
            <Like theme="outline" size="20" fill="var(--theme-icon)" />
          </a>
          <ul className={styles.ul}>
            {types === null && <IconSpin spin />}
            {types !== null &&
              types.map(d => {
                return (
                  <li onClick={() => setKeywords(d.name)} key={d.id}>
                    {d.name}
                  </li>
                );
              })}
            <li className={styles.bg}></li>
          </ul>
          <Popover position="bottomRight" className={styles.popover} content={content}>
            <a className={styles.more}>
              <HamburgerButton theme="outline" size="20" fill="var(--theme-icon)" />
            </a>
          </Popover>
        </section>
      </div>
      <div
        onWheel={() => {
          if (editor.previewSource) {
            editor.previewSource = null;
          }
        }}
        className={styles.list + ' scroll'}
        id={`sourceItemsScrollDOM_${type}`}
      >
        <SourceList
          item={props.item}
          itemClassName={props.itemClassName}
          total={total}
          page={params.current.page}
          pageSize={params.current.page_size}
          items={items}
          setItems={setItems}
          type={type}
          addItem={props.addItem}
          loading={loading}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}