import styles from './align.module.less';
import Item from '../item';
import { Space, Tooltip } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { stores } from '@stores/index';
import { useReducer } from 'react';
// import { util } from '@utils/index';
// import { pubsub } from '@utils/pubsub';
import { Group, Ungroup, DeleteOne, SwitchTrack } from '@icon-park/react';
import { ImageElement } from 'video-core-sdk';
import { pubsub, util } from '@utils/index';

export interface IProps {}

function GroupFast(props: IProps) {
  const { editor } = stores;
  const elements = editor.getGroupElementData() as ImageElement[];
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  let isGroup = false;
  // d.groupId 一样，说明是组元素
  if (elements.length > 1 && elements[0].groupId && elements.every(v => v.groupId === elements[0].groupId)) {
    isGroup = true;
  }

  // 判断组的元素类型是否相同
  const isSameType = elements.every(v => v.type === elements[0].type);

  console.log('isSameType--->', isSameType);

  return (
    <Item title="快捷操作">
      {/* <div>边框，阴影，裁剪、图层、下移、上移、置顶、置底</div> */}
      <Space>
        <Tooltip content={isGroup ? '打散组' : '合并组'}>
          <a
            onClick={() => {
              const elements = editor.getGroupElementData() as ImageElement[];
              if (!isGroup) {
                // 数据合并
                const id = util.randomID();
                elements.forEach(elementData => {
                  elementData.groupId = id;
                });
                // editor.setContorlAndSelectedElemenent(elements.map(d => d.id));
              } else {
                // 打散组
                elements.forEach(elementData => {
                  elementData.groupId = '';
                  delete elementData.groupId;
                });
                editor.setContorlAndSelectedElemenent([elements[0].id]);
              }
              editor.updateMovie();
              editor.updateOption();
              forceUpdate();
            }}
          >
            {isGroup ? (
              <Ungroup theme="filled" size="20" fill="var(--theme-icon)" />
            ) : (
              <Group theme="filled" size="20" fill="var(--theme-icon)" />
            )}
          </a>
        </Tooltip>
        <Tooltip content="删除">
          <a
            onClick={() => {
              pubsub.publish('keyboardDelete');
            }}
          >
            <DeleteOne size={20} color="var(--theme-icon)" />
          </a>
        </Tooltip>
        {isSameType && (
          <Tooltip content="优化轨道，尽可能将相同类型的元素放到一个轨道上">
            <a
              onClick={async () => {
                editor.globalLoading = true;
                setTimeout(() => {
                  // 尽量将元素放到一个轨道，如果有冲突，也可以放多轨道
                  editor.optimizeTrack(elements);
                  editor.updateMovie();
                  editor.updateTimeline();
                  editor.globalLoading = false;
                }, 100);
                forceUpdate();
              }}
            >
              <SwitchTrack size={20} color="var(--theme-icon)" />
            </a>
          </Tooltip>
        )}
      </Space>
    </Item>
  );
}

export default observer(GroupFast);
