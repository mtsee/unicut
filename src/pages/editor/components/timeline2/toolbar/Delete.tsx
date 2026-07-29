import styles from './tools.module.less';
import { DeleteOne } from '@icon-park/react';
import { Toast, Tooltip } from '@douyinfe/semi-ui';
import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import { helper } from 'video-core-sdk';
import { observer } from 'mobx-react';
import { pubsub } from '@utils/pubsub';
import { language } from '@language/language';
import { stores } from '@stores/index';
import type { VideoElement } from 'video-core-sdk';
import { remove } from 'lodash';

export interface IProps {}

/**
 * 元素翻转
 * @param props
 * @returns
 */
function Delete(props: IProps) {
  const { editor } = stores;
  editor.timelineToolsUpdateKey;

  let enable = false;

  if (editor.selectedElementIds.length > 1) {
    enable = false;
  }
  if (editor.selectedElementIds.length === 1) {
    const elementData = editor.getElementData();
    if (elementData) {
      enable = true;
    }
  }

  // 删除选中元素
  const deleteFun = useCallback(() => {
    // 如果选中了帧，先删除帧
    if (editor.frameSelectedId) {
      const elementData = editor.getElementData() as VideoElement;
      if (!elementData) {
        Toast.error(language.val('timeline_top_please_select_element'));
        return;
      }
      remove(elementData.frames, d => d.id === editor.frameSelectedId);
      editor.frameSelectedId = '';
      editor.updateTimeline();
      editor.updateMovie();
      editor.updateOption();
      return;
    }

    const ids = [...editor.selectedElementIds];
    if (ids.length) {
      helper.deleteElementByIds(ids, editor.data);
      editor.setSelectedElementIds([]);
      editor.updateMovie();
      editor.updateTimeline();
    }
  }, []);

  useEffect(() => {
    pubsub.subscribe('keyboardDelete', deleteFun);

    return () => {
      pubsub.unsubscribe('keyboardDelete');
    };
  }, []);

  return (
    <Tooltip content={language.val('timeline_top_delete')}>
      <a
        onClick={deleteFun}
        className={classNames({
          [styles.enable]: enable,
        })}
      >
        <DeleteOne theme="outline" size="18" fill="var(--theme-icon)" />
      </a>
    </Tooltip>
  );
}

export default observer(Delete);
