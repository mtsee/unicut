import styles from './styles.module.less';
import Content from '@components/content';
import { server } from './server';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Plus, More, MoreFour } from '@icon-park/react';
import DraftThumbImage from './DraftThumbImage';
import { Toast, Tooltip, Popover } from '@douyinfe/semi-ui';
import { getInitData } from '@config/initData';
import { pubsub, util } from '@utils/index';
import MoreMenus from './MoreMenus';
import Intl from '@language/Intl';
import { language } from '@language/language';
import dayjs from 'dayjs';
import { Calendar } from '@icon-park/react';
import mvImg from '@images/mv.png';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import { layout } from '@stores/layout';

export interface IProps {
  match: any;
}

export default function Draft(props: IProps) {
  const history = useHistory();
  console.log('props', props.match.params);
  const [cid = '', cname = ''] = props.match.params.cid?.split('@') || [];
  const [cates, setCates] = useState([]);
  const catesRef = useRef<any[]>([]);
  const [updateContent, setUpdateContent] = useState(1);
  const currentName = useRef<string>();

  console.log('cid', cid, cname);

  return (
    <Content
      key={cid + updateContent}
      categoryId={cid}
      categoryName={cname}
      title={
        <span>
          <Intl name="draft_start" />{' '}
        </span>
      }
      moveCallBack={async (cid, ids) => {
        pubsub.publish('pageLoading', {
          start: true,
        });
        await server.moveDraft({
          ids: ids,
          category_id: cid,
        });
        setUpdateContent(+new Date());
        pubsub.publish('pageLoading', {
          end: true,
        });
      }}
      subTitle={
        <div className={styles.createBtns}>
          <a
            onClick={async () => {
              const initData = getInitData();
              if (cid) {
                initData.category_id = cid;
              }
              const [res, err] = await server.createDraft(initData as any);
              if (err) {
                Toast.error(err);
                return;
              }
              // 先清空缓存
              layout.clearCache();
              history.push(`/editor/${res.id}`);
            }}
            className={styles.createVideo}
          >
            <span className={styles.icon}>
              <img src={mvImg} />
            </span>
            <span>
              <h1>
                <Plus theme="multi-color" strokeWidth={8} size="18" fill={'#fff'} />
                {/* 创建项目 */}
                {language.val('create_project')}
              </h1>
              <p>{language.val('create_project_desc')}</p>
            </span>
          </a>
        </div>
      }
      catesCallback={c => {
        catesRef.current = c;
        setCates(c);
      }}
      type="draft"
      itemWidth={200}
      item={item => {
        // console.log(item);
        return (
          <div className={styles.item}>
            <Popover content={<MoreMenus cates={cates} item={item} updateContent={setUpdateContent} />}>
              <div className={styles.more}>
                <More theme="outline" size="20" fill="var(--theme-main)" />
              </div>
            </Popover>
            <a
              onClick={() => {
                layout.clearCache();
                history.push(`/editor/${item.id}`);
              }}
            >
              <div className={styles.pic}>
                <DraftThumbImage thumb={item.thumb} width={item.width} height={item.height} />
              </div>
            </a>
            <input
              title={language.val('draft_name_input')}
              onFocus={e => {
                currentName.current = e.target.value;
              }}
              onBlur={async e => {
                if (e.target.value === currentName.current) return;
                item.name = e.target.value;
                const [res, err] = await server.updateDraft({
                  id: item.id,
                  name: item.name,
                });
                if (err) {
                  Toast.error(err);
                } else {
                  Toast.success(language.val('draft_name_success'));
                }
              }}
              className={styles.name}
              defaultValue={item.name || 'Untitled'}
            />
            <div className={styles.date}>
              <Calendar theme="outline" size="16" fill={'var(--theme-icon)'} strokeWidth={3} />
              <span>&nbsp;{dayjs(item.updatedAt).format('YYYY-MM-DD hh:mm:ss')}</span>
            </div>
          </div>
        );
      }}
      itemClassName={''}
      getListServer={server.getDraftList}
    />
  );
}
