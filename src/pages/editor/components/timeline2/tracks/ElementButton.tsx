import classNames from 'classnames';
import { observer } from 'mobx-react';
import styles from './element.module.less';
import type { BaseElement, ImageElement, VideoElement } from 'video-core-sdk';
import { useCallback } from 'react';
import $ from 'jquery';
import { speedHelper, utils } from 'video-core-sdk';
import { config } from '../config';
import { stores } from '@stores/index';
import { util } from '@utils/index';

export interface IProps {
  type: 'left' | 'right';
  element: BaseElement;
  prevElement: BaseElement;
  nextElement: BaseElement;
  updateElement: () => void;
}

function ElementButton(props: IProps) {
  const { editor } = stores;
  const { type, updateElement } = props;
  const gap = 5; // 吸附距离

  const onDragStart = useCallback(
    (e: any) => {
      e.stopPropagation();

      editor.pause();

      const element = props.element as VideoElement;
      const { nextElement, prevElement } = props;
      const { clipTime = 0, startTime = 0 } = element;
      const avgSpeed = speedHelper.videoAvgSpeed(element);
      const duration = element.duration / avgSpeed;

      let maxTime = Infinity;
      let minTime = 0.1;
      if (['audio', 'video'].includes(element.type)) {
        const resource = editor.movie.resourceManage.getResouceById(element.resourceId);
        console.log('resource>>>>', resource);
        maxTime = resource.duration;
      }

      // // 吸附用的
      // const $tracksBody = $('#h5dsVideoTracksBody');
      // const scrollx = Number($tracksBody.scrollLeft());

      let adsorptionx: number[] = [editor.currentTime];
      [...editor.data.elements, ...editor.data.captions].forEach(d => {
        if (d.id !== element.id) {
          const dAvgSpeed = speedHelper.videoAvgSpeed(d as VideoElement);
          adsorptionx.push(d.startTime);
          adsorptionx.push(d.startTime + d.duration / dAvgSpeed);
        }
      });
      adsorptionx = [...new Set(adsorptionx)];
      // duration范围
      const scopes = [minTime, maxTime];

      console.log('scopesscopes', scopes);

      // 显示吸附线
      const $h5dsMagnetLine = $('#h5dsMagnetLine');
      // const timelineBodyOffset = $tracksBody.offset();

      // 检查是否吸附
      const checkAdsorption = (type: 'left' | 'right', elem: { startTime: number; duration: number }) => {
        let isadsorp = undefined;
        if (type === 'left') {
          isadsorp = adsorptionx.find(d => Math.abs(d - elem.startTime) <= gap / editor.rulerScale);
        } else {
          isadsorp = adsorptionx.find(d => Math.abs(d - elem.startTime - elem.duration) <= gap / editor.rulerScale);
        }
        if (isadsorp !== undefined && elem.duration > 0) {
          $h5dsMagnetLine.css({ display: 'block', left: isadsorp * editor.rulerScale });
        } else {
          $h5dsMagnetLine.css({ display: 'none' });
        }
        return isadsorp;
      };

      $(document)
        .on('mousemove.ievent.dragElementDuration', em => {
          const ex = em.pageX - e.pageX;
          let time = (ex / editor.rulerScale) * avgSpeed;

          // 判断是否吸附
          let absorp;
          if (type === 'left') {
            absorp = checkAdsorption(type, {
              startTime: startTime + time / avgSpeed,
              duration: duration - time / avgSpeed,
            });
            if (absorp && duration - time / avgSpeed > 0) {
              time = (absorp - startTime) * avgSpeed;
            }
          } else {
            absorp = checkAdsorption(type, {
              startTime: startTime,
              duration: duration + time / avgSpeed,
            });

            if (absorp && duration + time / avgSpeed > 0) {
              time = (absorp - startTime - duration) * avgSpeed;
            }
          }

          // audio, video有长度限制, audio 和video是裁剪
          if (type === 'left') {
            if (['audio', 'video'].includes(element.type)) {
              // time的范围在 [-clipTime, duration - clipTime]
              if (time <= -clipTime) {
                time = -clipTime;
              } else if (time >= duration * avgSpeed) {
                time = duration * avgSpeed;
              }
              // 修改clipTime
              let clip = clipTime + time / avgSpeed;
              let st = startTime + time / avgSpeed;
              let dur = util.timeToNum(duration * avgSpeed - time);

              // 不能超出前面的元素
              let prevTime = 0;
              if (prevElement) {
                prevTime = prevElement.startTime + prevElement.duration / avgSpeed;
              }
              if (st < prevTime) {
                st = prevTime;
                dur = duration * avgSpeed + startTime - prevTime;
                clip = clipTime - (startTime - prevTime);
              }
              // 左边拉到最小0.1
              const maxEnd = startTime + duration * avgSpeed - 0.1;
              if (st > maxEnd) {
                dur = 0.1;
                st = maxEnd;
                clip = duration * avgSpeed - 0.1;
              }
              element.clipTime = util.timeToNum(clip);
              element.startTime = util.timeToNum(st);
              element.duration = util.timeToNum(dur);
            } else {
              // 其他元素修改duration
              let st = startTime + time;
              let dt = duration * avgSpeed - time;
              const times = [0, Infinity];
              if (prevElement) {
                const speed = speedHelper.videoAvgSpeed(prevElement as VideoElement);
                const prevTime = prevElement.startTime + prevElement.duration / speed;
                times[0] = prevTime;
              }
              if (nextElement) {
                times[1] = nextElement.startTime;
              }
              // 时间范围在times，duration范围在scopes
              if (st < times[0]) {
                st = times[0];
                dt = duration - (st - startTime);
                // console.log('st < ', times);
              } else if (st > times[1]) {
                st = times[1];
                // console.log('st > ', times);
              }
              if (dt < scopes[0]) {
                dt = scopes[0];
                st = startTime + (duration - dt);
              } else if (dt > scopes[1]) {
                dt = scopes[1];
              }

              element.startTime = util.timeToNum(st);
              element.duration = util.timeToNum(dt * avgSpeed);
            }
          } else {
            // right情况
            if (['audio', 'video'].includes(element.type)) {
              let dt = duration * avgSpeed + time;
              if (nextElement && dt > nextElement.startTime - element.startTime) {
                dt = nextElement.startTime - element.startTime;
              }
              // duration 范围 [0.1, maxTime - clipTime];
              if (dt < 0.1) {
                dt = 0.1;
              } else if (dt > maxTime - clipTime) {
                dt = maxTime - clipTime;
              }
              if (dt < scopes[0]) {
                dt = scopes[0];
              } else if (dt > scopes[1]) {
                dt = scopes[1];
              }
              element.duration = util.timeToNum(dt);
            } else {
              let dt = duration + time;
              if (nextElement && dt > nextElement.startTime - element.startTime) {
                dt = nextElement.startTime - element.startTime;
              }
              if (dt < scopes[0]) {
                dt = scopes[0];
              } else if (dt > scopes[1]) {
                dt = scopes[1];
              }
              element.duration = util.timeToNum(dt);
            }
          }

          // 更新动画
          if (element.animates) {
            element.animates.forEach(anim => {
              if (anim.type === 'leave') {
                anim._dirty = utils.createID();
                anim.start = element.duration - anim.duration;
              }
            });
          }
          updateElement();
        })
        .on('mouseup.ievent.dragElementDuration', () => {
          $h5dsMagnetLine.css({ display: 'none' });
          if (element.animates) {
            element.animates = [...element.animates];
          }
          $(document).off('mousemove.ievent.dragElementDuration');
          $(document).off('mouseup.ievent.dragElementDuration');
          // 更新画布
          editor.movie.update();
          editor.totalTimeKey = utils.createID();
          editor.record({
            type: 'elements_update',
            data: [element],
            desc: '更新元素clipTime，duration',
          });
        });
    },
    [props.element, props.nextElement, props.prevElement],
  );

  return (
    <a
      onMouseDown={onDragStart}
      className={classNames(styles.button, {
        [styles.buttonLeft]: type === 'left',
        [styles.buttonRight]: type === 'right',
      })}
    ></a>
  );
}

export default observer(ElementButton);
