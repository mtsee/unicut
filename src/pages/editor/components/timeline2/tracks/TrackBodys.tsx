import React, { useEffect, useReducer, useState } from 'react';
import styles from './tracks.module.less';
import { observer } from 'mobx-react';
import { helper, speedHelper, utils } from 'video-core-sdk';
import classNames from 'classnames';
import { config } from '../config';
import type { BaseElement } from 'video-core-sdk';
// import { AudioElement, ImageElement, VideoElement } from 'video-core-sdk';
import TrackType from './TrackType';
import Element from './Element';
import $ from 'jquery';
import { pubsub, util } from '@utils/index';
import ElementTransition from './ElementTransition';
import TransitionInsertTemp from './TransitionInsertTemp';
import { stores } from '@stores/index';

type Props = {};

const Trackbody = (props: Props) => {
  const { editor } = stores;
  editor.selectedElementIds;
  editor.timelineUpdateKey;
  const [trackWidth, setTrackWidth] = useState(window.innerWidth);

  const scale = editor.rulerScale;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  // const totalTime = editor.movie.getTotalTime();
  const captions = editor.data.captions || [];
  const cameras = editor.data.cameras || [];
  // const noElement = captions.length === 0 && editor.data.elements.length === 0;
  const groups = helper.groupByTrackIndex(editor.data.elements);

  editor.resetTimeLineElementTrackHeightTop();
  // console.log('upHeightupHeightupHeightupHeight', editor.data, editor.timeLineTrackHeightTop);

  useEffect(() => {
    pubsub.subscribe('timelineUpdateTracks', () => {
      forceUpdate();
    });
    // 组的框选
    const $h5dsVideoTracksBody = $('#h5dsVideoTracksBody');
    $h5dsVideoTracksBody.on('mousedown.groupSelected', e => {
      const isElement = $(e.target).closest('.element-item')[0];
      const isTrackTypesBox = $(e.target).closest('#trackTypesBox')[0];
      if (!isElement && !isTrackTypesBox) {
        const $calibration = $('#h5dsVideoTracksBody');
        const $elementSelectedBox = $('#elementSelectedBox');
        const scrollTop = $calibration.scrollTop();
        const scrollLeft = $calibration.scrollLeft();
        const offsetxy = $calibration.offset();

        // 设置初始位置
        $elementSelectedBox.css({
          display: 'block',
          left: e.pageX - offsetxy.left + scrollLeft,
          top: e.pageY - offsetxy.top + scrollTop,
        });
        const $elements = $('.element-item');
        const rects = [];
        $elements.each(function () {
          const $this = $(this);
          rects.push({
            id: $this.attr('data-id'),
            width: $this.width(),
            height: $this.height(),
            y: $this.offset().top - offsetxy.top + scrollTop,
            x: $this.offset().left - offsetxy.left + scrollLeft,
          });
        });

        let willUpdate = '';
        $(document)
          .on('mousemove.groupSelected', em => {
            const exScrollTopTop = $calibration.scrollTop() - scrollTop;
            const exScrollTopLeft = $calibration.scrollLeft() - scrollLeft;
            let width = em.pageX - e.pageX;
            let height = em.pageY - e.pageY;
            let y = e.pageY - offsetxy.top + scrollTop + exScrollTopTop;
            let x = e.pageX - offsetxy.left + scrollLeft + exScrollTopLeft;
            if (width < 0) {
              x -= Math.abs(width);
              width = Math.abs(width) - exScrollTopLeft;
            } else {
              x -= exScrollTopLeft;
              width += exScrollTopLeft;
            }
            if (height < 0) {
              y -= Math.abs(height);
              height = Math.abs(height) - exScrollTopTop;
            } else {
              y -= exScrollTopTop;
              height += exScrollTopTop;
            }
            $elementSelectedBox.css({
              display: 'block',
              left: x,
              top: y,
              width,
              height,
            });

            // 碰撞检测
            let crashArr = [];
            rects.forEach(rect => {
              if (util.crashRects(rect, { x, y, width, height })) {
                crashArr.push(rect.id);
              }
            });
            if (willUpdate !== crashArr.join('#')) {
              willUpdate = crashArr.join('#');
              editor.setContorlAndSelectedElemenent([...crashArr]);
            }
          })
          .on('mouseup.groupSelected', () => {
            $(document).off('mousemove.groupSelected');
            $(document).off('mouseup.groupSelected');
            $elementSelectedBox.css({ display: 'none', width: 0, height: 0 });
          });
      }
    });

    $h5dsVideoTracksBody.on('mousewheel', (e: any) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.originalEvent.wheelDelta;
        let scale = editor.rulerScale;
        if (delta > 0) {
          scale += 10;
        } else {
          scale -= 10;
        }
        if (scale < 1) {
          scale = 1;
        }
        if (scale > 500) {
          scale = 500;
        }
        editor.rulerScale = scale;
      }
    });

    return () => {
      pubsub.unsubscribe('timelineUpdateTracks');
      $h5dsVideoTracksBody.off('mousedown.groupSelected');
      $h5dsVideoTracksBody.off('mousewheel');
    };
  }, []);

  useEffect(() => {
    const totalDuration = editor.movie?.getTotalTime() || 0;
    setTrackWidth(Math.max(window.innerWidth + 200, totalDuration * scale + 200));
  }, [editor.totalTimeKey, scale]);

  return (
    <>
      <TrackType
        // mainTracks={mainTracks}
        groups={groups}
        captionTracks={[captions]}
        cameraTracks={[cameras]}
      />
      <div
        className={styles.trackBody + ' scroll'}
        id="h5dsVideoTracksBody"
        onMouseDown={e => {
          // 如果是滚动条，不处理
          const { isScrollbar, type } = checkClickScrollbar(document.getElementById('h5dsVideoTracksBody'), e);
          if (isScrollbar) {
            return;
          }

          const time =
            (e.pageX - $('#h5dsVideoTracksBody').offset().left + editor.timelineTrackScrollLeft) / editor.rulerScale;
          editor.pause(time);
        }}
        onScroll={(e: any) => {
          editor.timelineTrackScrollLeft = e.target.scrollLeft;
          editor.timelineTrackScrollTop = e.target.scrollTop;
        }}
      >
        <span id="elementSelectedBox" data-width={trackWidth} className={styles.elementSelectedBox}></span>
        <div
          className={classNames(styles.track, styles.captionTrack)}
          style={{ height: config.cameraTrack, marginTop: config.marginTop, width: trackWidth }}
        >
          {editor.data._hideLock['-2']?.lock && (
            <div
              className={styles.trackLock}
              style={{ height: config.captionTrack, top: config.marginTop, width: trackWidth }}
            ></div>
          )}
          {cameras.map((element, index) => {
            const prevElement = cameras[index - 1];
            const nextElement = cameras[index + 1];
            return (
              <Element
                top={config.marginTop}
                key={element.id}
                element={element}
                nextElement={nextElement}
                prevElement={prevElement}
              />
            );
          })}
        </div>
        <div
          className={classNames(styles.track, styles.captionTrack)}
          style={{ height: config.captionTrack, marginTop: config.marginTop, width: trackWidth }}
        >
          {editor.data._hideLock['-1']?.lock && (
            <div
              className={styles.trackLock}
              style={{ height: config.captionTrack, top: config.marginTop * 2 + config.cameraTrack, width: trackWidth }}
            ></div>
          )}
          {captions.map((element, index) => {
            const prevElement = captions[index - 1];
            const nextElement = captions[index + 1];
            return (
              <Element
                top={config.marginTop * 2 + config.cameraTrack}
                key={element.id}
                element={element}
                nextElement={nextElement}
                prevElement={prevElement}
              />
            );
          })}
        </div>
        {groups.map((track, index) => {
          const trackIndex = track[0]?.trackIndex;
          const trackStyle = editor.timeLineTrackHeightTop[index];
          if (!editor.data._hideLock[trackIndex]) {
            editor.data._hideLock[trackIndex] = { hide: false, lock: false };
          }
          const hideLockOption = editor.data._hideLock[trackIndex];
          return (
            <div
              // id组成的字符串过长，这里取hash值作为key，避免影响react性能
              key={utils.betterHash(track.map(d => d.id).join('-'))}
              data-trackindex={track[0]?.trackIndex}
              className={classNames(styles.track, styles.elementTrack, {
                [styles.trackHide]: hideLockOption?.hide,
              })}
              style={{ height: trackStyle.height, marginTop: config.marginTop, width: trackWidth }}
            >
              {hideLockOption?.lock && (
                <div className={styles.trackLock} style={{ height: trackStyle.height, top: trackStyle.top, width: trackWidth }}></div>
              )}

              {track.map((element, i) => {
                const transitions = editor.data.transitions;
                const prevElement = track[i - 1];
                const nextElement = track[i + 1];
                const transitionElement = transitions.find(t => t.startElementId === element.id);
                let hasTransition = false;
                if (transitionElement && element && nextElement) {
                  const avgSpeed = speedHelper.videoAvgSpeed(element as any);
                  if (Math.abs(element.startTime + element.duration / avgSpeed - nextElement.startTime) <= 0.01) {
                    hasTransition = true;
                  }
                }
                // console.log('hasTransition', hasTransition, transitionElement, element, nextElement, transitions);
                return (
                  <React.Fragment key={element.id}>
                    {hasTransition && transitionElement && (
                      <ElementTransition
                        _duration={transitionElement.duration}
                        dirty={transitionElement._dirty}
                        element={element}
                        nextElement={nextElement}
                        transitionElement={transitionElement}
                      />
                    )}
                    <TransitionInsertTemp
                      hasTranstion={!!(hasTransition && transitionElement)}
                      scale={scale}
                      element={element}
                    />
                    <Element
                      top={element._elementTimeLineTrackTop}
                      key={element.id}
                      element={element}
                      nextElement={nextElement}
                      prevElement={prevElement}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}
        <span
          id="h5dsMagnetLine"
          style={{ height: editor.timeLineTrackMaxHeight }}
          className={styles.magnetLine}
        ></span>
        <span id="h5dsTrackInserLine" className={styles.insertLine}></span>
      </div>
    </>
  );
};

export default observer(Trackbody);

/**
 * 判断点击的是否为滚动条，并区分垂直/水平
 * @param {HTMLElement} el 目标滚动容器
 * @param {MouseEvent} e 鼠标事件对象
 * @returns {Object} { isScrollbar: boolean, type: 'vertical' | 'horizontal' | null }
 */
function checkClickScrollbar(el, e) {
  const rect = el.getBoundingClientRect();
  // 计算滚动条宽度/高度（兼容所有浏览器）
  const scrollbarWidth = el.offsetWidth - el.clientWidth;
  const scrollbarHeight = el.offsetHeight - el.clientHeight;

  let isVerticalScrollbar = false;
  let isHorizontalScrollbar = false;

  // 1. 判断垂直滚动条（右侧）
  if (scrollbarWidth > 0) {
    const isInVerticalScrollbarX = e.clientX > rect.right - scrollbarWidth;
    const isNotInHorizontalScrollbarArea = scrollbarHeight === 0 || e.clientY < rect.bottom - scrollbarHeight;
    isVerticalScrollbar = isInVerticalScrollbarX && isNotInHorizontalScrollbarArea;
  }

  // 2. 判断水平滚动条（底部）
  if (scrollbarHeight > 0) {
    const isInHorizontalScrollbarY = e.clientY > rect.bottom - scrollbarHeight;
    const isNotInVerticalScrollbarArea = scrollbarWidth === 0 || e.clientX < rect.right - scrollbarWidth;
    isHorizontalScrollbar = isInHorizontalScrollbarY && isNotInVerticalScrollbarArea;
  }

  // 同时在角落（两个滚动条交叉的位置），优先判定为垂直/水平都命中，这里统一视为滚动条
  if (isVerticalScrollbar || isHorizontalScrollbar) {
    return {
      isScrollbar: true,
      type: isVerticalScrollbar ? 'vertical' : 'horizontal',
    };
  }

  return {
    isScrollbar: false,
    type: null,
  };
}
