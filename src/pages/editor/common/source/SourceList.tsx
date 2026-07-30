import IconSpin from '@douyinfe/semi-icons/lib/es/icons/IconSpin';
import styles from './sourceList.module.less';
import WaterFull from '@components/water-full';
import classNames from 'classnames';
import type { SourceType } from '@config/types';
import { Progress, Checkbox, Toast, Pagination, Empty } from '@douyinfe/semi-ui';
import { Stretching, Plus, Like, Add } from '@icon-park/react';
import type { SourceItem } from '../../types';
import { language } from '@language/language';
import { pubsub } from '@utils/pubsub';
import { addItem } from '../../components/sources/addItem';
import { stores } from '@stores/index';

export interface IProps {
  total: number;
  page: number;
  pageSize: number;
  items: SourceItem[];
  item: (a: SourceItem) => JSX.Element;
  itemClassName: string;
  onPageChange: (page: number) => void;
  type: SourceType;
  setItems?: (items: SourceItem[]) => void;
  checkboxs?: string[];
  onChangeCheckboxs?: (n: string) => void;
  sType?: string;
  callback?: (id: string) => void;
  addItem?: any;
  loading?: boolean;
}

export interface ChildProps {
  children?: any;
  className?: string;
  item: any;
}

export default function SourceList(props: IProps) {
  const { editor } = stores;
  const { total, page, pageSize, items, type, checkboxs, onChangeCheckboxs, sType, loading } = props;

  if (loading && !items?.length) {
    return (
      <div className={styles.loadingMore}>
        <span>
          <IconSpin spin style={{ color: 'var(--theme-icon)' }} />
          &nbsp;&nbsp;{language.val('common_loading')}
        </span>
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className={styles.empty}>
        <Empty description={language.val('no_data')} />
      </div>
    );
  }

  const checkboxStyle: any = {};
  if (checkboxs && checkboxs.length) {
    checkboxStyle.display = 'block';
  }

  // 设置缓存数据，用于拖动元素的时候获取数据
  editor.setActiveItems(items);

  return (
    <div className={styles.sourceListWrapper}>
      <WaterFull
        itemWidth={{ video: 120, image: 120, filter: 80, text: 80, effect: 80, transition: 120 }[type]}
        itemHeight={['audio'].includes(type)}
        list={items}
        sType={sType}
        columns={type === 'audio' ? 1 : null}
        item={(item: SourceItem) => {
          const showViewButton = ['image', 'video', 'audio', 'text', 'template'].includes(item.type);
          return (
            <span
              data-type={item.type}
              data-dragitem={props.type === 'template' ? undefined : item.id + '#' + item.type}
              className={classNames(styles.item, props.itemClassName)}
              onClick={e => {
                if (props.type === 'template') {
                  props.addItem(item);
                }
              }}
            >
              {props.item(item)}
              {checkboxs ? (
                <span onMouseDown={e => e.stopPropagation()} className={styles.checkbox} style={checkboxStyle}>
                  <Checkbox
                    checked={checkboxs.includes(item.id)}
                    onChange={e => {
                      onChangeCheckboxs(item.id);
                    }}
                  ></Checkbox>
                </span>
              ) : (
                <a
                  style={{
                    right: showViewButton ? 55 : 5,
                  }}
                  onClick={async () => {
                    const canCollect = !item.is_collected && sType !== 'collect';

                    if (!canCollect) {
                      const [res, err] = await editor.apiServer.cancelCollect([item.id], props.type);
                      if (err) {
                        Toast.error(err);
                        return;
                      }
                      pubsub.publish(`updateItemCollect_${type}`, { id: item.id, collect: false });
                      if (props.callback) {
                        props.callback(item.id);
                      }
                      Toast.success(language.val('common_toast_collect_cancel_success'));
                      return;
                    }
                    await editor.apiServer.collect({
                      source_id: item.id,
                      type: props.type,
                    });
                    pubsub.publish(`updateItemCollect_${type}`, { id: item.id, collect: true });
                    Toast.success(language.val('common_toast_collect_success'));
                  }}
                  className={styles.save}
                >
                  {!item.is_collected && sType !== 'collect' ? (
                    <Like theme="outline" size="16" fill="#fff" />
                  ) : (
                    <Like theme="filled" size="16" fill="var(--theme-main)" />
                  )}
                </a>
              )}
              {showViewButton && (
                <>
                  <a
                    onClick={e => {
                      console.log('预览item--->', item);
                      e.stopPropagation();
                      editor.previewSource = {
                        type: item.type,
                        name: item.name,
                        //@ts-ignore 模版才有video
                        url: item.video || item.urls?.url || item.urls?.thumb || item.thumb,
                      };
                    }}
                    className={styles.preview}
                  >
                    <Stretching theme="outline" size="16" fill="#fff" />
                  </a>
                  <a
                    onClick={async e => {
                      e.stopPropagation();
                      await addItem(item, undefined, undefined);
                    }}
                    className={styles.add}
                  >
                    <Add theme="outline" size="16" fill="#fff" />
                  </a>
                </>
              )}
            </span>
          );
        }}
      />
      {total > pageSize && (
        <div className={styles.paginationWrapper}>
          <Pagination
            total={total}
            currentPage={page}
            pageSize={pageSize}
            onPageChange={page => props.onPageChange(page)}
          />
        </div>
      )}
    </div>
  );
}