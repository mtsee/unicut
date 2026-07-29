import styles from './elementTransition.module.less';

import { observer } from 'mobx-react';
// import classNames from 'classnames';
import type { BaseElement, TransitionItem } from 'video-core-sdk';
// import { config } from '../config';
import classNames from 'classnames';
import { transitionIcon } from './icon';
import { useReducer } from 'react';
import $ from 'jquery';
import { config } from '../config';
import { ExchangeFour } from '@icon-park/react';
import { speedHelper, utils } from 'video-core-sdk';
import { util } from '@utils/index';
import { stores } from '@stores/index';

export interface IProps {
  _duration: number; // 为了触发组件更新用的，必须保留
  dirty: string;
  element: BaseElement;
  nextElement: BaseElement;
  transitionElement: TransitionItem;
}

function ElementTransition(props: IProps) {
  const { editor } = stores;
  const { transitionElement, element, nextElement } = props;
  const scale = editor.rulerScale;
  const isActive = editor.selectedElementIds.includes(transitionElement.id);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const speed = speedHelper.videoAvgSpeed(element as any);
  const speedNext = speedHelper.videoAvgSpeed(nextElement as any);

  const onDragStart = (e: any, type: 'left' | 'right') => {
    e.stopPropagation();
    const duration = transitionElement.duration;
    const maxDuration = Math.min(element.duration / speed, nextElement.duration / speedNext) / 2;
    $(document)
      .on('mousemove.ievent.dragTransitionElementDuration', em => {
        let dur =
          type === 'left'
            ? duration - ((em.pageX - e.pageX) * 2) / scale
            : duration + ((em.pageX - e.pageX) * 2) / scale;
        if (dur < 0.1) {
          dur = 0.1;
        }
        if (dur > maxDuration) {
          dur = maxDuration;
        }
        transitionElement.duration = util.timeToNum(dur);
        forceUpdate();
      })
      .on('mouseup.ievent.dragTransitionElementDuration', () => {
        $(document).off('mousemove.ievent.dragTransitionElementDuration');
        $(document).off('mouseup.ievent.dragTransitionElementDuration');
        // 更新画布
        editor.movie.update();
        // 更新设置区域
        editor.updateOption();
      });
  };

  return (
    <div
      data-keyid={transitionElement.id}
      data-name={transitionElement.name}
      data-type="transition"
      data-id={transitionElement.id}
      data-min={Math.min(element.duration / speed / 2, nextElement.duration / speedNext / 2)}
      onMouseDown={e => {
        e.stopPropagation();
        editor.setSelectedElementIds([transitionElement.id]);
      }}
      key={transitionElement.id}
      className={classNames(styles.transition, 'element-item', {
        [styles.transitionActive]: isActive,
      })}
      style={{
        left: (element.startTime + element.duration / speed) * scale - (scale * transitionElement.duration) / 2,
        width: scale * transitionElement.duration,
        height: config.videoTrack,
      }}
    >
      <div className="element-replace-inner">
        <ExchangeFour theme="outline" size="18" fill="#fff" strokeWidth={3} />
        &nbsp; 替换
      </div>
      <a
        onMouseDown={e => onDragStart(e, 'left')}
        className={classNames(styles.button, styles.buttonLeft, 'element-item')}
      ></a>
      <a
        onMouseDown={e => onDragStart(e, 'right')}
        className={classNames(styles.button, styles.buttonRight, 'element-item')}
      ></a>
      {transitionIcon}
    </div>
  );
}

export default observer(ElementTransition);
