import { observer } from 'mobx-react';
import styles from './ruler.module.less';
import $ from 'jquery';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { utils } from 'video-core-sdk';
import { util } from '@utils/index';
import { debounce } from 'lodash';
import { stores } from '@stores/index';
import throttle from 'lodash/throttle';

export interface IProps {
  scrollx: number;
  noElement: boolean;
}

function Ruler(props: IProps) {
  const { editor } = stores;
  const { width, ref } = useResizeDetector();
  const ctx = useRef<any>();
  const rulerHeight = 24;

  const throttleUpdate = useCallback(
    throttle(ct => {
      editor.updateMovie(util.timeToNum(ct));
    }, 1000/25),
    [],
  );

  const dragCursor = useCallback((e: any) => {
    const currentTime = editor.currentTime;
    editor.pause();
    const totalTime = editor.movie.getTotalTime();
    $(document)
      .on('mousemove.ievent.cursor', em => {
        const ex = em.pageX - e.pageX;
        const t = ex / editor.rulerScale;
        let ct = currentTime + t;
        if (ct <= 0) {
          ct = 0;
        }
        if (ct >= totalTime) {
          ct = totalTime;
        }
        // 降低更新频率
        throttleUpdate(ct);
        // editor.updateMovie(utils.toNum(ct, 2));
      })
      .on('mouseup.ievent.cursor', () => {
        editor.updateMovie(util.timeToNum(editor.currentTime));
        $(document).off('mousemove.ievent.cursor');
        $(document).off('mouseup.ievent.cursor');
      });
  }, []);

  const updateRuler = useCallback(
    debounce((width, scrollx) => {
      if (width) {
        const scale = editor.rulerScale;
        if (!ctx.current) {
          const cav = document.getElementById('canvaTimelineRuler') as HTMLCanvasElement;
          ctx.current = cav.getContext('2d');
        }
        ctx.current.clearRect(0, 0, width, rulerHeight);
        ctx.current.font = '10px normal';
        ctx.current.fillStyle = '#999'; // 文字颜色
        ctx.current.strokeStyle = '#7c7c7c';
        ctx.current.lineWidth = 1;
        ctx.current.beginPath();

        // 间隙
        const totalTime = editor.movie.getTotalTime() + Math.ceil(width / scale);
        let num = Math.ceil(width / scale); // 数量
        // 计算要显示多个
        const minSpace = 100; // 间隙最小值
        const maxShowNum = Math.ceil(width / minSpace);
        let iscale = 1; // 坐标缩放
        if (num > maxShowNum) {
          iscale = Math.ceil(minSpace / scale);
        }

        const space = scale * iscale;
        const offsetNum = Math.floor(scrollx / space);
        // console.log('totalTime>>>>', totalTime, num, maxShowNum, scrollx, offsetNum);
        for (let i = offsetNum; i <= num + maxShowNum + offsetNum; i++) {
          const x = i * space - scrollx;
          if (x > totalTime * scale) {
            break;
          }
          // 绘制长线
          ctx.current.moveTo(x, 2);
          ctx.current.lineTo(x, 10);

          // 绘制文字
          ctx.current.fillText(utils.secToTime((i * space) / scale, 'hh:mm:ss'), x, 20);

          // 绘制短线
          for (let i = 0; i < 10; i++) {
            let ex = x + (i + 1) * (space / 10);
            ctx.current.moveTo(ex, 2);
            ctx.current.lineTo(ex, 4);
          }
          ctx.current.stroke();
        }
        ctx.current.closePath();
      }
    }, 1000 / 60),
    [editor.rulerScale],
  );

  useEffect(() => {
    updateRuler(width, editor.timelineTrackScrollLeft);
    return () => {
      if (ctx.current) {
        ctx.current = null;
      }
    };
  }, [width, editor.rulerScale, editor.timelineTrackScrollLeft]);

  const tx = editor.currentTime * editor.rulerScale - editor.timelineTrackScrollLeft;

  return (
    <div
      className={styles.top}
      ref={ref}
      onClick={(e: any) => {
        const time = (e.pageX - $(ref.current!).offset().left + editor.timelineTrackScrollLeft) / editor.rulerScale;
        editor.pause(time);
      }}
    >
      <a
        id="h5dsCursor"
        onMouseDown={dragCursor}
        className={styles.cursor}
        style={{ transform: `translate(${tx}px)`, display: tx < 0 || tx > width - 16 ? 'none' : 'block' }}
      ></a>
      {width && <canvas id="canvaTimelineRuler" width={width} height={rulerHeight}></canvas>}
    </div>
  );
}

export default observer(Ruler);
