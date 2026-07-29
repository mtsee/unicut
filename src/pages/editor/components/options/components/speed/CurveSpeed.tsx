import React, { useCallback, useEffect, useReducer, useState } from 'react';
import type { VideoElement } from 'video-core-sdk';
import styles from './curveSpeed.module.less';
import { Redo, Plus, Delete } from '@icon-park/react';
import { theme } from '@theme';
import { observer } from 'mobx-react';
import { Tooltip } from '@douyinfe/semi-ui';
import $ from 'jquery';
import { utils, speedHelper } from 'video-core-sdk';
import CurveSpeedItems from './CurveSpeedItems';
import { curveSpeedMock } from './curveSpeedMock';
import { util } from '@utils/index';
import _remove from 'lodash/remove';
import { stores } from '@stores/index';

type Props = {};

// 前提是curveSpeed===true
const CurveSpeed = (props: Props) => {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as VideoElement;
  if (!elementData.curveSpeedLines) {
    elementData.curveSpeedLines = [];
  }
  const avgSpeed = speedHelper.videoAvgSpeed(elementData as any);
  let relativeTime = (editor.currentTime - elementData.startTime) * avgSpeed;
  if (relativeTime < 0) {
    relativeTime = 0;
  }
  if (relativeTime > elementData.duration) {
    relativeTime = elementData.duration;
  }
  const res = speedHelper.getSpeedByRelative(relativeTime / elementData.duration, elementData);
  const progress = res.cx;
  // x范围[0~220], y范围[0,180]
  const boxWidth = 220;
  const boxHeight = 180;
  const padding = 10;
  // const [lines, setLines] = useState(curveSpeedLines ? curveSpeedLines : []);

  const paths = [];
  elementData.curveSpeedLines.forEach((d, i) => {
    if (i !== 0) {
      const p1 = elementData.curveSpeedLines[i - 1];
      const p2 = elementData.curveSpeedLines[i];
      paths.push({
        id: p1.id + '_' + p2.id,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
      });
    }
  });

  // 点的拖动
  const onDragDot = useCallback(
    (e, tid, curveSpeedLines) => {
      const { left, top } = $('.' + styles.dots).offset();
      const startX = e.pageX - left;
      const startY = e.pageY - top;
      // 获取前后数据
      curveSpeedLines.sort((a, b) => {
        return a.x - b.x;
      });
      const lineIndex = curveSpeedLines.findIndex(d => d.id === tid);
      const prev = curveSpeedLines[lineIndex - 1];
      const next = curveSpeedLines[lineIndex + 1];
      const line = curveSpeedLines.find(d => d.id === tid);
      const [limitMin, limitMax] = [prev ? prev.x : 0, next ? next.x : 1];
      const ext = 0.01; // 相邻两个元素中间的差值
      $(document)
        .on('mousemove.curveSpeedDragDot', em => {
          let x = em.pageX - e.pageX + startX;
          let y = em.pageY - e.pageY + startY;
          x = x / boxWidth;
          y = y / boxHeight;
          if (y < 0) y = 0;
          if (y > 1) y = 1;
          if (x <= limitMin + ext) x = limitMin + ext;
          if (x >= limitMax - ext) x = limitMax - ext;
          if (line) {
            // 第一个和最后一个点不改变X值
            if (lineIndex !== 0 && lineIndex !== curveSpeedLines.length - 1) {
              line.x = x;
            }
            line.y = y;
          }
          elementData.curveSpeedLines = [...curveSpeedLines];
          forceUpdate();
        })
        .on('mouseup.curveSpeedDragDot', () => {
          console.log('点的坐标——>', elementData.curveSpeedLines);
          editor.timelineUpdateElementKey = util.randomID();
          $(document).off('mousemove.curveSpeedDragDot');
          $(document).off('mouseup.curveSpeedDragDot');
        });
    },
    [elementData],
  );

  // 线条拖动
  const onDragLine = useCallback(
    e => {
      const { left } = $('.' + styles.dots).offset();
      const startX = e.pageX - left;

      const updateProgress = x => {
        let p = x / boxWidth;
        if (p < 0) {
          p = 0;
        } else if (p > 1) {
          p = 1;
        }
        console.log('XXXXXXXXXXXX', p);
        const { progress } = speedHelper.getBezierLineAreaFromBezierLineProgress(p, elementData);
        editor.currentTime = (progress * elementData.duration) / avgSpeed + elementData.startTime;
      };

      updateProgress(startX);

      $(document)
        .on('mousemove.curveSpeedDragLine', em => {
          let x = em.pageX - e.pageX + startX;
          updateProgress(x);
        })
        .on('mouseup.curveSpeedDragLine', () => {
          $(document).off('mousemove.curveSpeedDragLine');
          $(document).off('mouseup.curveSpeedDragLine');
        });
    },
    [avgSpeed],
  );

  // 相邻的两个元素
  const [left, right] = speedHelper.findAdjacentPoints(elementData.curveSpeedLines, progress);
  let btnType = 'add';
  // console.log('left, right', left, right);
  if (left && Math.abs(left.x - progress) < 0.01) {
    btnType = 'delete';
  }
  if (right && Math.abs(right.x - progress) < 0.01) {
    btnType = 'delete';
  }
  return (
    <div className={styles.curveSpeedBox}>
      <CurveSpeedItems
        onChange={v => {
          console.log(v);
          elementData.curveSpeed = true;
          elementData.curveSpeedName = v.name;
          elementData.curveSpeedLines = v.points;
          editor.timelineUpdateElementKey = util.randomID();
          forceUpdate();
          editor.record({
            type: 'elements_update',
            desc: '修改曲线变速',
            data: [elementData],
          });
        }}
      />
      <div className={styles.duration}>
        <i>时长：</i>
        {elementData.duration.toFixed(2)}s → <em>{(elementData.duration / avgSpeed).toFixed(2)}s</em>
      </div>
      <div className={styles.curveSpeed}>
        <div className={styles.points} id="points"></div>
        <div onMouseDown={onDragLine} className={styles.dots}>
          {elementData.curveSpeedLines.map(d => {
            const { x, y, id } = d;
            return (
              <span
                key={id}
                data-id={id}
                onMouseDown={e => onDragDot(e, id, elementData.curveSpeedLines)}
                className={styles.dot}
                style={{
                  left: x * boxWidth,
                  top: y * boxHeight,
                }}
              ></span>
            );
          })}
        </div>
        <div className={styles.cursor}>
          <span
            style={{
              left: progress * boxWidth,
            }}
          ></span>
        </div>
        <svg width={boxWidth + padding * 2} height={boxHeight + padding * 2}>
          {paths.map(d => {
            let { x1, y1, x2, y2, id } = d;
            x1 *= boxWidth;
            y1 *= boxHeight;
            x1 += padding;
            y1 += padding;
            x2 *= boxWidth;
            y2 *= boxHeight;
            x2 += padding;
            y2 += padding;
            return (
              <path
                key={id}
                d={`M${x1} ${y1}, C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`}
                stroke="#54a9ff"
                strokeWidth="2"
                fill="none"
              />
            );
          })}
        </svg>
        <div className={styles.lines}>
          <span className={styles.line1}></span>
          <span className={styles.line2}></span>
          <span className={styles.line3}></span>
        </div>
        <div className={styles.names}>
          <span className={styles.name1}>10x</span>
          <span className={styles.name2}>1x</span>
          <span className={styles.name3}>0.1x</span>
        </div>
      </div>
      <div className={styles.btns}>
        <Tooltip content="恢复">
          <a
            className={styles.btn}
            onClick={() => {
              const resetLines = curveSpeedMock.find(d => d.name === (elementData.curveSpeedName || 'custom'));
              elementData.curveSpeedLines = utils.toJS(resetLines.points);
              forceUpdate();
            }}
          >
            <Redo theme="outline" size="14" fill={theme.findColor('--theme-icon')} strokeWidth={4} />
          </a>
        </Tooltip>
        <Tooltip content="新增/删除">
          <a
            onClick={() => {
              if (btnType === 'add') {
                const cpx = (left.x + right.x) / 2;
                const [x0, y0] = speedHelper.findIntersection(
                  {
                    p1: [left.x * boxWidth, left.y * boxHeight],
                    cp1: [cpx * boxWidth, left.y * boxHeight],
                    cp2: [cpx * boxWidth, right.y * boxHeight],
                    p2: [right.x * boxWidth, right.y * boxHeight],
                  },
                  progress * boxWidth,
                );
                elementData.curveSpeedLines.push({ x: x0 / boxWidth, y: y0 / boxHeight, id: utils.createID() });
                elementData.curveSpeedLines.sort((a, b) => {
                  return a.x - b.x;
                });
                forceUpdate();
              } else {
                const point = speedHelper.findNearestPoint(elementData.curveSpeedLines, progress);
                if (point) {
                  _remove(elementData.curveSpeedLines, d => d.id === point.id);
                }
                forceUpdate();
              }
            }}
            className={styles.btn}
          >
            {btnType === 'add' ? (
              <Plus theme="outline" size="14" fill={theme.findColor('--theme-icon')} strokeWidth={6} />
            ) : (
              <Delete theme="outline" size="14" fill={theme.findColor('--theme-icon')} strokeWidth={6} />
            )}
          </a>
        </Tooltip>
      </div>
    </div>
  );
};

export default observer(CurveSpeed);
