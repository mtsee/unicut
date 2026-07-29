import { observer } from 'mobx-react';
import styles from './folders.module.less';
import { layout } from '@stores/layout';
import { FolderIcon } from './icon';
import { Button, Space, Checkbox, Toast } from '@douyinfe/semi-ui';
import { userService } from '@server/user.service';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { pubsub } from '@utils/pubsub';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { language } from '@language/language';
import {
  isFSApiSupported,
  getRootHandle,
  getLocalCategoryList,
  createLocalCategory,
  updateLocalCategory,
} from '@services/localStorageService';

export interface IProps {
  type: 'draft' | 'material'; // 类型
  catesCallback: (cates: any[]) => void;
  noCheckbox?: boolean;
  onClick?: (item: any) => void;
}

function Folders(props: IProps) {
  const [list, setList] = useState([]);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const currentName = useRef<string>();

  const getList = useCallback(() => {
    const t = props.type === 'draft' ? 'project' : 'material';
    getLocalCategoryList(t as 'project' | 'material').then(resp => {
      const [res, err] = resp;
      if (err) {
        return Toast.error(err);
      } else {
        setList(res.data);
        props.catesCallback(res.data);
      }
    });
  }, []);

  useEffect(() => {
    pubsub.subscribe('updateFolders', () => {
      getList();
    });

    getList();

    return () => {
      pubsub.unsubscribe('updateFolders');
    };
  }, []);

  const checkboxStyle: any = {};
  if (layout.openSelectManage) {
    checkboxStyle.display = 'flex';
  }

  console.log('list', list);

  return (
    <div className={classNames(styles.folders, 'scroll')}>
      {list.map(item => {
        return (
          <section key={item.id} className={styles.folderItem}>
            {props.noCheckbox ? null : (
              <Checkbox
                style={checkboxStyle}
                checked={!!layout.selects.find(d => d.id === item.id)}
                onChange={e => {
                  layout.setSelected(
                    {
                      id: item.id,
                      type: 'folder',
                    },
                    e.target.checked,
                  );
                }}
              />
            )}
            {props.onClick ? (
              <a onClick={() => props.onClick(item)}>
                <FolderIcon size={60} />
              </a>
            ) : (
              <Link
                to={
                  {
                    draft: `/workspace/draft/${item.id}@${item.name}`,
                    material: `/workspace/material/${item.id}@${item.name}`,
                  }[props.type]
                }
              >
                <FolderIcon size={60} />
              </Link>
            )}

            <input
              title={language.val('draft_name_input')}
              value={item.name}
              onFocus={e => {
                currentName.current = e.target.value;
              }}
              onChange={e => {
                item.name = e.target.value;
                forceUpdate();
              }}
              onBlur={async e => {
                if (item.name === currentName.current) {
                  return;
                }
                let [res, err] = await updateLocalCategory(item.id, { name: item.name });
                if (!err) {
                  Toast.success(language.val('draft_name_success'));
                }
                getList();
              }}
            />
          </section>
        );
      })}
    </div>
  );
}

export default observer(Folders);
