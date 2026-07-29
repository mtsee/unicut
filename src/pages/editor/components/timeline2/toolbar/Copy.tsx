import styles from './tools.module.less';
import { Copy } from '@icon-park/react';
import { Tooltip, Toast } from '@douyinfe/semi-ui';
import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import type { VideoElement } from 'video-core-sdk';
import { helper, utils } from 'video-core-sdk';
import { observer } from 'mobx-react';
import { pubsub } from '@utils/pubsub';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {}

/**
 * 元素分割
 * @param props
 * @returns
 */
function CopyElem(props: IProps) {
  const { editor } = stores;
  editor.timelineToolsUpdateKey;

  let enable = false;

  if (editor.selectedElementIds.length >= 1) {
    const elementData = editor.getElementData();
    if (elementData) {
      enable = true;
    }
  }

  // 收集所有选中的元素
  const getAllSelectedElements = () => {
    const ids = editor.selectedElementIds;
    const results: any[] = [];
    const allArrays = [editor.data.elements, editor.data.captions, editor.data.cameras, editor.data.transitions];
    allArrays.forEach(arr => {
      const found = helper.getElementsByIds(ids, arr as any);
      if (found) {
        results.push(...found);
      }
    });
    return results;
  };

  // clone 单个元素
  const cloneElement = (sourceElem: any) => {
    const elem = utils.toJS(sourceElem) as VideoElement;
    if (elem.animates) {
      elem.animates.forEach(d => {
        d.id = utils.createID();
      });
    }

    // role拷贝
    if (elem.type === 'role') {
      const roleElem = elem as any;
      roleElem.role.id = utils.createID();
      roleElem.role.actions.forEach((d: any) => {
        d.id = utils.createID();
        d.elems.forEach((e: any) => {
          e.id = utils.createID();
        });
      });
    }

    (elem.frames || []).forEach(el => {
      el.id = utils.createID();
    });
    elem.id = utils.createID();
    elem.startTime = editor.currentTime;
    elem.trackIndex = helper.getInsertTrackIndex(elem.trackIndex, 'up', editor.data);
    return elem;
  };

  // 插入拷贝后的元素
  const insertClonedElement = (elem: any) => {
    if (elem.type === 'caption') {
      editor.data.captions.sort((a: any, b: any) => a.startTime - b.startTime);
      const texts = editor.data.captions;
      const lastCaption = texts[texts.length - 1];
      elem.startTime = lastCaption.startTime + lastCaption.duration;
      editor.data.captions.push(elem);
    } else if (elem.type === 'camera') {
      editor.data.cameras.sort((a: any, b: any) => a.startTime - b.startTime);
      const lastCamera = editor.data.cameras[editor.data.cameras.length - 1];
      elem.startTime = lastCamera.startTime + lastCamera.duration;
      editor.data.cameras.push(elem);
    } else {
      editor.data.elements.push(elem);
    }
  };

  // 复制
  const copyFun = useCallback(async () => {
    const selected = getAllSelectedElements();
    if (!selected.length) return;

    const newIds: string[] = [];
    selected.forEach(elem => {
      const cloned = cloneElement(elem);
      insertClonedElement(cloned);
      newIds.push(cloned.id);
    });

    editor.setSelectedElementIds(newIds);
    editor.updateMovie();
    editor.updateTimeline();
  }, []);

  // 拷贝元素关联的 resource 资源（resourceId + resourceIds），跨场景粘贴时需要
  const collectResources = (elem: any) => {
    const resources: any[] = [];
    const resourceManage = editor.movie.resourceManage;
    if (elem.resourceId) {
      const res = resourceManage.getResouceById(elem.resourceId);
      if (res) resources.push(res);
    }
    if (elem.resourceIds && elem.resourceIds.length) {
      elem.resourceIds.forEach((rid: string) => {
        const res = resourceManage.getResouceById(rid);
        if (res) resources.push(res);
      });
    }
    return resources;
  };

  // 恢复 resource 资源到当前编辑器的 data 中
  const restoreResources = async (resources: any[]) => {
    for (const res of resources) {
      const exists = editor.data.resouces.find((d: any) => d.id === res.id);
      if (!exists) {
        await editor.movie.resourceManage.cacheMedia(editor.movie.reURL(res.url), res.type);
        editor.data.resouces.push(res);
      }
    }
  };

  useEffect(() => {
    pubsub.subscribe('keyboardCopy', () => {
      const selected = getAllSelectedElements();
      if (!selected.length) return;

      const allResources: any[] = [];
      selected.forEach(elem => {
        allResources.push(...collectResources(elem));
      });

      editor.copyTempData = {
        type: 'copy',
        data: selected.map(e => utils.toJS(e)),
        resources: allResources,
      };
      Toast.success(language.val('timeline_top_copy_success'));
    });
    pubsub.subscribe('keyboardCut', () => {
      const selected = getAllSelectedElements();
      if (!selected.length) return;

      const allResources: any[] = [];
      selected.forEach(elem => {
        allResources.push(...collectResources(elem));
      });

      editor.copyTempData = {
        type: 'cut',
        data: selected.map(e => utils.toJS(e)),
        resources: allResources,
      };
      // 移除元素
      pubsub.publish('keyboardDelete');
      Toast.success(language.val('timeline_top_cut_success'));
    });
    pubsub.subscribe('keyboardPaste', async () => {
      if (!editor.copyTempData || !editor.copyTempData.data) {
        Toast.error(language.val('timeline_top_copy_error'));
        return;
      }

      const dataList = Array.isArray(editor.copyTempData.data)
        ? editor.copyTempData.data
        : [editor.copyTempData.data];

      const newIds: string[] = [];

      // 跨场景粘贴：恢复 resource 资源
      if (editor.copyTempData.resources && editor.copyTempData.resources.length) {
        await restoreResources(editor.copyTempData.resources);
      }

      for (const item of dataList) {
        const elem = utils.toJS(item) as VideoElement;

        // 如果是scene，不复制
        if (elem.type === 'camera') {
          Toast.error('镜头轨道不支持手动粘贴');
          continue;
        }

        if (editor.copyTempData.type === 'copy') {
          elem.id = utils.createID();
          if (elem.animates) {
            elem.animates.forEach(d => {
              d.id = utils.createID();
            });
          }
          if (elem.type === 'role') {
            const roleElem = elem as any;
            roleElem.role.id = utils.createID();
            roleElem.role.actions.forEach((d: any) => {
              d.id = utils.createID();
              d.elems.forEach((e: any) => {
                e.id = utils.createID();
              });
            });
          }
          (elem.frames || []).forEach(el => {
            el.id = utils.createID();
          });
        }

        elem.startTime = editor.currentTime;
        elem.trackIndex = helper.getInsertTrackIndex(elem.trackIndex, 'up', editor.data);
        editor.data.elements.push(elem);
        newIds.push(elem.id);
      }

      if (newIds.length) {
        editor.setContorlAndSelectedElemenent(newIds);
      }
      editor.updateMovie();
      editor.updateTimeline();
      if (editor.copyTempData.type === 'cut') {
        editor.copyTempData = null;
      }
    });
    return () => {
      pubsub.unsubscribe('keyboardCopy');
      pubsub.unsubscribe('keyboardCut');
      pubsub.unsubscribe('keyboardPaste');
    };
  }, [editor]);

  return (
    <Tooltip content={language.val('timeline_top_copy')}>
      <a
        className={classNames({
          [styles.enable]: enable,
        })}
        onClick={copyFun}
      >
        <Copy theme="outline" size="18" fill="var(--theme-icon)" />
      </a>
    </Tooltip>
  );
}

export default observer(CopyElem);
