import React, { useCallback, useReducer } from 'react';
import type { BaseElement, FrameItem } from 'video-core-sdk';
import styles from './element.module.less';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { transaction } from 'mobx';
import $ from 'jquery';
import { stores } from '@stores/index';
import { util } from '@utils/index';

export interface IProps {
  element: BaseElement;
  scale: number;
}
function FrameItems(props: IProps) {
  const { editor } = stores;
  editor.timelineUpdateKey;
  const { element, scale } = props;
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const onMouseDownFrame = useCallback(
    (e, frame: FrameItem) => {
      e.stopPropagation();

      element.frames.forEach(frame => {
        frame.startTime = Number(frame.startTime);
      });

      // 计算拖动范围
      const frames = [
        { ...element.frames[0], startTime: 0, id: 'start' },
        ...element.frames,
        { ...element.frames[element.frames.length - 1], startTime: element.duration, id: 'end' },
      ];

      let interval = null;
      for (let i = 1; i < frames.length; i++) {
        if (frames[i].id === frame.id) {
          const prev = frames[i - 1];
          const next = frames[i + 1];
          interval = [prev.startTime + 0.01, next.startTime - 0.01];
          break;
        }
      }

      console.log('interval', interval);

      if (!interval) {
        return;
      }

      const startTime = frame.startTime;
      // 拖动
      $(document)
        .on('mousemove.ievent.dragFrameItem', em => {
          let ex = em.pageX - e.pageX;
          let time = startTime + ex / scale;
          if (time < interval[0]) {
            time = interval[0];
          } else if (time > interval[1]) {
            time = interval[1];
          }
          frame.startTime = util.timeToNum(time);
          forceUpdate();
        })
        .on('mouseup.ievent.dragFrameItem', em => {
          const ex = em.pageX - e.pageX;
          if (ex < 3) {
            transaction(() => {
              editor.currentTime = util.timeToNum(frame.startTime + element.startTime);
              editor.frameSelectedId = frame.id;
              forceUpdate();
            });
          }
          // 重新设置表情时间
          editor.updateMovie();
          $(document).off('mousemove.ievent.dragFrameItem');
          $(document).off('mouseup.ievent.dragFrameItem');
        });
    },
    [scale],
  );

  if (!element.frames) {
    return null;
  }

  return (
    <>
      {element.frames.map(frame => {
        return (
          <span
            key={frame.id}
            onMouseDown={e => onMouseDownFrame(e, frame)}
            data-id={frame.id}
            style={{ left: scale * frame.startTime }}
            className={classNames(styles.frameSpan, {
              [styles.activeFrame]: frame.id === editor.frameSelectedId,
            })}
          ></span>
        );
      })}
    </>
  );
}

export default observer(FrameItems);
