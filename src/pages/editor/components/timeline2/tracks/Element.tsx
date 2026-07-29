import { observer } from 'mobx-react';
import React, { useState, useEffect, useRef, useReducer } from 'react';
import { config } from '../config';
import { utils, helper, speedHelper } from 'video-core-sdk';
import useBackground from './useBackground';
import styles from './element.module.less';
import IconSpin from '@douyinfe/semi-icons/lib/es/icons/IconSpin';
import { Caution, ExchangeFour } from '@icon-park/react';
import type { VideoElement, BaseElement } from 'video-core-sdk';
import classNames from 'classnames';
import { util } from '@utils/index';
import ElementButton from './ElementButton';
import useDragItem from './useDragItem';
import FrameItems from './FrameItems';
import { stores } from '@stores/index';

type Props = {
  element: BaseElement;
  prevElement: BaseElement;
  nextElement: BaseElement;
  top: number;
  height?: number;
};

const Element = (props: Props) => {
  const { editor } = stores;
  editor.timelineUpdateElementKey;

  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const { element, prevElement, nextElement, height, top } = props;
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>();
  const scale = editor.rulerScale;
  const avgSpeed = speedHelper.videoAvgSpeed(element as any);
  const [ostyle, audioWaveStyle, backgroundFrames] = useBackground({
    element,
    scale,
    avgSpeed,
  });
  const [style, setStyle] = useState({});

  // 检测资源是否异常
  const resource = editor.movie?.resourceManage?.getResouceById((element as any).resourceId);
  const isResourceError = resource?._error || false;

  const [startDragElement] = useDragItem({
    dragContext: 'element',
    element: element,
    isCaption: false,
    forceUpdate,
    prevElement,
    nextElement,
    setPostion: pos => {
      setStyle(pos);
    },
  });
  const isActive = editor.selectedElementIds.includes(element.id);

  // 监听是否在可视化区域
  useEffect(() => {
    // 创建一个IntersectionObserver实例
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 元素进入可视区域
          setVisible(true);
          // console.log('Element is in viewport');
        } else {
          setVisible(false);
          // 元素离开可视区域
          // console.log('Element is not in viewport');
        }
      });
    });
    // 选择需要观察的目标元素并开始观察
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={classNames(
        styles.elem,
        styles['elem_' + element.type],
        {
          [styles.active]: isActive,
          [styles.resourceError]: isResourceError,
        },
        'element-item',
      )}
      onMouseDown={startDragElement}
      style={{
        top,
        left: element.startTime * scale,
        width: (element.duration / avgSpeed) * scale,
        height: height ? height : config[`${element.type}Track`] || 24,
        ...ostyle,
        ...style,
      }}
      data-top={top}
      data-id={element.id}
      data-track={element.trackIndex || 0}
      data-type={element.type}
      key={element.id}
    >
      {/* 资源异常时显示红色感叹号 */}
      {isResourceError && (
        <div className={styles.resourceErrorIcon}>
          <Caution theme="outline" size="16" fill="#ff0000" strokeWidth={2} />
        </div>
      )}
      {visible && (
        <>
          <div className="element-replace-inner">
            <ExchangeFour theme="outline" size="18" fill="#fff" strokeWidth={3} />
            &nbsp; 替换
          </div>
          {editor.selectedElementIds.includes(element.id) && <FrameItems scale={scale} element={element} />}
          {element.type === 'video' && backgroundFrames.length === 0 && !isResourceError && (
            <div className={styles.spin}>
              <IconSpin spin />
            </div>
          )}
          {['video', 'audio'].includes(element.type) && (
            <div
              className={styles.audioWave}
              data-audio={JSON.stringify(audioWaveStyle)}
              style={{
                ...audioWaveStyle,
                opacity: (element as any).muted ? 0.3 : 1,
              }}
            ></div>
          )}
          <ElementButton
            updateElement={forceUpdate}
            prevElement={prevElement}
            nextElement={nextElement}
            element={element}
            type="left"
          />
          <ElementButton
            updateElement={forceUpdate}
            prevElement={prevElement}
            nextElement={nextElement}
            element={element}
            type="right"
          />
          {(element as VideoElement).animates &&
            (element as VideoElement).animates.map(anim => {
              return (
                <span
                  className={classNames(styles.animateLine, {
                    [styles.animateLineEnter]: anim.type === 'enter',
                    [styles.animateLineEmphasize]: anim.type === 'emphasize',
                    [styles.animateLineLeave]: anim.type === 'leave',
                    // [styles.animateLineCustom]: anim.type === 'custom',
                  })}
                  key={anim.id}
                  style={{ width: (anim.duration * scale) / avgSpeed, left: (anim.start * scale) / avgSpeed }}
                ></span>
              );
            })}
          <span className={styles.info}>
            <span className={styles.infoInner}>
              {config[element.type + 'Icon']}
              {element.templateEnable ? (
                <ExchangeFour className={styles.exchange} theme="outline" size="16" fill="#ff0" />
              ) : null}
              <i className={styles.name}>{utils.secToTime(element.duration / avgSpeed, 'hh:mm:ss')}</i>
              <i className={styles.text}>{(element as any).text || element.name}</i>
            </span>
          </span>
        </>
      )}
    </div>
  );
};

export default observer(Element);
