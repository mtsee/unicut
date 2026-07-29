import styles from './tools.module.less';
import { HorizontalSpacingBetweenItems } from '@icon-park/react';
import { Tooltip, Toast } from '@douyinfe/semi-ui';
import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import type { CameraElement, FrameItem, VideoElement } from 'video-core-sdk';
import { helper, speedHelper, utils } from 'video-core-sdk';
import { observer } from 'mobx-react';
import { pubsub } from '@utils/pubsub';
import { language } from '@language/language';
import { stores } from '@stores/index';
import { util } from '@utils/index';

export interface IProps {}

/**
 * 元素分割
 * @param props
 * @returns
 */
function Split(props: IProps) {
  const { editor } = stores;
  editor.timelineToolsUpdateKey;

  let enable = false;

  if (editor.selectedElementIds.length > 1) {
    enable = false;
  }
  if (editor.selectedElementIds.length === 1) {
    const elementData = editor.getElementData();
    if (elementData) {
      const { startTime, duration } = elementData as VideoElement;
      const avgSpeed = speedHelper.videoAvgSpeed(elementData as any);
      if (editor.currentTime > startTime && editor.currentTime < startTime + duration / avgSpeed) {
        enable = true;
      }
    }
  }

  // 分割视频
  const splitFun = useCallback(() => {
    console.log('分割数据，分割后，动画时间待处理');
    const elementData = editor.getElementData() as VideoElement;
    if (!elementData) {
      Toast.error(language.val('timeline_top_please_select_track'));
      return;
    }
    const currentTime = editor.currentTime;
    const { duration, clipTime = 0, startTime, type } = elementData;
    const avgSpeed = speedHelper.videoAvgSpeed(elementData);
    if (currentTime > startTime && currentTime < startTime + duration / avgSpeed) {
      // 分割变速
      let line1, line2;
      if (elementData.curveSpeed) {
        let relativeTime = (editor.currentTime - elementData.startTime) * avgSpeed;
        const res = speedHelper.getSpeedByRelative(relativeTime / elementData.duration, elementData);
        [line1, line2] = speedHelper.splitPoints(res.cx, elementData.curveSpeedLines);
      }

      // 分割元素
      const duration1 = (currentTime - startTime) * avgSpeed;
      const duration2 = duration - duration1;
      const startTime2 = currentTime;
      const clipTime2 = ['video', 'audio'].includes(type) ? clipTime + duration1 : 0;

      elementData.duration = util.timeToNum(duration1);

      // 创建新的元素
      const elementData2 = utils.toJS(elementData) as VideoElement;
      elementData2.id = utils.createID();
      elementData2.startTime = util.timeToNum(startTime2);
      elementData2.duration = util.timeToNum(duration2);
      if (elementData2.speed !== undefined) {
        elementData2.speed = elementData.speed;
      }
      if (elementData2.clipTime !== undefined) {
        elementData2.clipTime = util.timeToNum(clipTime2);
      }

      // 角色元素分割，要重新设置action id 和 elems id
      if (type === 'role') {
        //@ts-ignore
        const newElem = elementData2 as RoleElement;
        newElem.role.id = utils.createID();
        newElem.role.actions.forEach(action => {
          action.id = utils.createID();
          action.elems.forEach(elem => {
            elem.id = utils.createID();
          });
        });
      }

      // 分割动画
      if (elementData.animates && elementData.animates.length) {
        // console.log('elementData.animates', elementData.animates);
        const anim1 = [];
        const anim2 = [];
        // return;
        elementData.animates.forEach(anim => {
          const { start, duration } = anim;
          if (start + duration <= duration1) {
            anim1.push(anim);
          } else if (start <= duration1 && start + duration >= duration1) {
            // 分割动画
            const a1 = utils.toJS(anim);
            const a2 = utils.toJS(anim);
            a1.duration = duration1 - start;
            a2.duration = start + duration - duration1;
            a2.start = duration1;
          } else {
            anim.start -= duration1;
            anim2.push(anim);
          }
          elementData.animates = anim1;
          elementData._animationDirty = utils.createID();

          elementData2.animates = anim2;
          elementData2._animationDirty = utils.createID();
        });
      }

      // 分割关键帧
      if (elementData.frames && elementData.frames.length) {
        // 获取分割点当前的帧状态（插值后的属性）
        const splitFrameState = editor.movie.getFrameStatus(elementData, duration1);

        const frames1: FrameItem[] = [];
        const frames2: FrameItem[] = [];

        for (const f of elementData.frames) {
          if (f.startTime < duration1) {
            frames1.push(utils.toJS(f) as FrameItem);
          } else if (f.startTime > duration1) {
            const adjusted = utils.toJS(f) as FrameItem;
            adjusted.startTime = util.timeToNum(adjusted.startTime - duration1);
            frames2.push(adjusted);
          }
          // startTime === duration1 的帧两个元素都复制一份
        }

        // 在分割点创建关键帧（捕获当前的插值状态），两个元素各一个
        if (splitFrameState) {
          const splitFrame1: FrameItem = { id: utils.createID(), startTime: duration1 };
          const splitFrame2: FrameItem = { id: utils.createID(), startTime: 0 };
          for (const key of Object.keys(splitFrameState)) {
            if (key !== 'id' && key !== 'startTime') {
              (splitFrame1 as any)[key] = (splitFrameState as any)[key];
              (splitFrame2 as any)[key] = (splitFrameState as any)[key];
            }
          }
          frames1.push(splitFrame1);
          frames2.push(splitFrame2);
        }

        // 按 startTime 排序
        frames1.sort((a, b) => a.startTime - b.startTime);
        frames2.sort((a, b) => a.startTime - b.startTime);

        elementData.frames = frames1;
        elementData2.frames = frames2;
      }

      if (elementData2.type === 'caption') {
        // 添加元素
        editor.data.captions.push(elementData2 as any);
      } else if (elementData2.type === 'camera') {
        // 添加元素
        editor.data.cameras.push(elementData2 as CameraElement);
      } else {
        // 添加元素
        editor.data.elements.push(elementData2);
      }

      if (line1 && line2) {
        // line1, line2
        console.log('line1, line2', line1, line2);
        elementData.curveSpeed = true;
        elementData.curveSpeedLines = line1;
        elementData.curveSpeedName = 'custom';

        elementData2.curveSpeed = true;
        elementData2.curveSpeedLines = line2;
        elementData2.curveSpeedName = 'custom';
      }

      editor.setSelectedElementIds([elementData2.id]);
      editor.updateMovie();
      editor.updateTimeline();
    } else {
      Toast.error(language.val('timeline_top_split_tips'));
    }
  }, []);

  useEffect(() => {
    pubsub.subscribe('keyboardSplit', splitFun);
    return () => {
      pubsub.unsubscribe('keyboardSplit');
    };
  }, []);

  return (
    <Tooltip content={language.val('timeline_top_split')}>
      <a
        className={classNames({
          [styles.enable]: enable,
        })}
        onClick={splitFun}
      >
        <HorizontalSpacingBetweenItems theme="outline" size="18" fill="var(--theme-icon)" />
      </a>
    </Tooltip>
  );
}

export default observer(Split);
