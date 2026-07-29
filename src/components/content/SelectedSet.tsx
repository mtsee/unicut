import styles from './content.module.less';
import { server as draftServer } from '@pages/workspace/draft/server';
import { server as materialServer } from '@pages/workspace/material/server';
import { Button, Space, Checkbox, Modal, Toast, Popover } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { layout } from '@stores/layout';
import { userService } from '@server/user.service';
import { pubsub } from '@utils/pubsub';
import _remove from 'lodash/remove';
import { language, Intl } from '@language/index';

export interface IProps {
  items: any[];
  total: number;
  type: 'draft' | 'material'; // 类型
  cates: any[]; // 分类
  removeCallBack: (params: [any[]]) => void; // 移除元素的回调
  moveCallBack: (cid: string, ids: string[]) => void; // 移动元素的回调
}

// 选中元素的操作
function SelectedSet(props: IProps) {
  const { items, cates, total, removeCallBack } = props;
  // console.log(
  //   layout.selects.length,
  //   items,
  //   cates,
  //   (items || []).length + (cates || []).length,
  //   "layout.selects, items, cates"
  // );
  return (
    <Space className={styles.selectedManager}>
      <Checkbox
        onChange={e => {
          if (e.target.checked) {
            //@ts-ignore
            layout.selects = [
              ...(items || []).map(item => {
                return {
                  type: 'item',
                  id: item.id,
                };
              }),
            ];
          } else {
            layout.selects = [];
          }
        }}
        indeterminate={layout.selects.length > 0 && layout.selects.length < (items || []).length + (cates || []).length}
        checked={layout.selects.length === (items || []).length + (cates.filter(d => d.type === 'folder') || []).length}
      >
        {language.val('common_all')}
      </Checkbox>
      <span>
        <Intl name="draft_has_selected" data={{ num: layout.selects.length }} />
      </span>
      <Button
        disabled={layout.selects.length === 0}
        onClick={() => {
          Modal.confirm({
            title: language.val('draft_batch_modal_title'),
            content: language.val('draft_batch_modal_content'),
            onOk: async () => {
              // 删除分类
              const ids = layout.selects.filter(d => d.type === 'folder').map(d => d.id);
              if (ids.length) {
                const [res, err] = await userService.deleteCategory(ids);
                if (err) {
                  Toast.error(err);
                  return;
                }
                pubsub.publish('updateFolders');
              }

              const deleteIds = [];

              // 删除草稿
              if (props.type === 'draft') {
                const ids2 = layout.selects.filter(d => d.type === 'item').map(d => d.id);
                if (ids2.length) {
                  deleteIds.push(...ids2);
                  for (const id of ids2) {
                    const [res2, err2] = await draftServer.deleteDraft(id);
                    if (err2) {
                      Toast.error(err2);
                      return;
                    }
                  }
                }
              }

              // 删除素材
              if (props.type === 'material') {
                const ids2 = layout.selects.filter(d => d.type === 'item').map(d => d.id);
                if (ids2.length) {
                  deleteIds.push(...ids2);
                  const [res2, err2] = await materialServer.deleteMaterial({
                    id: ids2,
                  });
                  if (err2) {
                    Toast.error(err2);
                    return;
                  }
                }
              }

              // 如果分类和草稿（素材）都删除了，取消操作弹框
              if (ids.length + deleteIds.length === cates?.length + items?.length) {
                layout.openSelectManage = false;
              }

              if (deleteIds.length) {
                //移除列表
                _remove(items, d => deleteIds.includes(d.id));
                removeCallBack([[...items]]);
              }

              layout.selects = [];
              Toast.success(language.val('common_delete_success'));
            },
          });
        }}
        type="danger"
      >
        {language.val('common_delete')}
      </Button>

      <Button
        disabled={
          !(
            layout.selects.filter(d => d.type === 'item').length !== 0 &&
            layout.selects.filter(d => d.type === 'folder').length === 0
          )
        }
      >
        {' '}
        <Popover
          position="bottom"
          content={
            <ul className={styles.menus}>
              {props.cates.map(d => {
                return (
                  <li
                    onClick={() => {
                      props.moveCallBack(
                        d.id,
                        layout.selects.map(d => d.id),
                      );
                      layout.selects = [];
                    }}
                    key={d.id}
                  >
                    {d.name}
                  </li>
                );
              })}
            </ul>
          }
        >
          <span>{language.val('common_move')}</span>
        </Popover>
      </Button>
      <Button
        type="tertiary"
        onClick={() => {
          layout.cancelSelected();
        }}
      >
        {language.val('common_cancel')}
      </Button>
    </Space>
  );
}
export default observer(SelectedSet);
