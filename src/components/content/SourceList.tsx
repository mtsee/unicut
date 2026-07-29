import { IconSpin } from '@douyinfe/semi-icons';
// import InfiniteScroll from 'react-infinite-scroll-component';
import styles from './sourceList.module.less';
import WaterFull from '@components/water-full';
import classNames from 'classnames';
import { Progress, Checkbox, Toast, Empty } from '@douyinfe/semi-ui';
import { userService } from '@server/user.service';
import { observer } from 'mobx-react';
import { layout } from '@stores/layout';
import { useReducer } from 'react';
import { language } from '@language/language';
import {
  IllustrationConstruction,
  IllustrationConstructionDark,
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';
import { Link } from 'react-router-dom';

export interface IProps {
  items: any[];
  itemWidth: number;
  item: (a: any) => JSX.Element;
  itemClassName: string;
  type: 'draft' | 'material'; // 资源类型
  selects?: any[];
  setSelects?: (selects: any[]) => void;
  propsCheckboxStyle?: React.CSSProperties;
}

export interface ChildProps {
  children?: any;
  className?: string;
  item: any;
}

function SourceList(props: IProps) {
  const { items, type, itemWidth, propsCheckboxStyle = {} } = props;
  // console.log(items, hasMore, "items");
  if (!items) {
    return (
      <div className={styles.loadingMore}>
        <span>
          <IconSpin spin style={{ color: '#fff' }} />
          &nbsp;&nbsp;{language.val('loading_more')}
        </span>
      </div>
    );
  }

  const checkboxStyle: any = {};
  if (layout.openSelectManage) {
    checkboxStyle.display = 'block';
  }

  layout.selects;

  if (items.length === 0) {
    if (type === 'draft') {
      // 草稿/作品页
      return (
        <Empty
          image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
          darkModeImage={<IllustrationNoResultDark style={{ width: 150, height: 150 }} />}
          title={'暂无作品'}
          description="暂无任何作品，点击上方「创建项目」开始创作"
        />
      );
    }
    // 素材页
    return (
      <Empty
        image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
        darkModeImage={<IllustrationNoResultDark style={{ width: 150, height: 150 }} />}
        title={'暂无素材'}
        description="暂无任何素材去选择"
      />
    );
  }

  return (
    // <InfiniteScroll
    //   dataLength={items.length || 0}
    //   hasMore={hasMore}
    //   next={next}
    //   loader={
    //     <>
    //       {hasMore && (
    //         <div className={styles.loadingMore}>
    //           <span>
    //             <IconSpin spin style={{ color: '#fff' }} />
    //             &nbsp;&nbsp;加载中...
    //           </span>
    //         </div>
    //       )}
    //     </>
    //   }
    //   scrollableTarget={scrollableTarget ? scrollableTarget : `sourceItemsScrollDOM_${props.type}`}
    //   endMessage={<p className={styles.noMoreTips}>{language.val('no_more_data')}</p>}
    // >
    <WaterFull
      gap={16}
      itemWidth={itemWidth}
      itemHeight={['draft'].includes(type) ? 180 : 'count'}
      list={items}
      item={(item: any) => {
        return (
          <span data-type={item.type} className={classNames(styles.item, props.itemClassName)}>
            {props.item(item)}
            {item.id !== 'null' && (
              <span className={styles.checkbox} style={{ ...checkboxStyle, ...propsCheckboxStyle }}>
                {props.selects ? (
                  <Checkbox
                    checked={!!props.selects.find(d => d.id === item.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        props.setSelects([...props.selects, { ...item }]);
                      } else {
                        props.setSelects([...props.selects.filter(d => d.id !== item.id)]);
                      }
                    }}
                  ></Checkbox>
                ) : (
                  <Checkbox
                    checked={!!layout.selects.find(d => d.id === item.id)}
                    onChange={e => {
                      layout.setSelected(
                        {
                          id: item.material_id || item.id,
                          type: 'item',
                        },
                        e.target.checked,
                      );
                    }}
                  ></Checkbox>
                )}
              </span>
            )}
          </span>
        );
      }}
    />
    // </InfiniteScroll>
  );
}

export default observer(SourceList);
