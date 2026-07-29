import styles from './drawLine.module.less';
import { useEffect, useReducer, useRef, useState } from 'react';
import $ from 'jquery';
import { Button, Modal, Slider, Space } from '@douyinfe/semi-ui';
import { Erase, CosmeticBrush, Clear, Click, Check, Download } from '@icon-park/react';
import { canvasScale } from './tools';
import { language } from '@language/language';

/**
 * 绘制区域的组件
 */
export interface IProps {
  width: number;
  height: number;
  scale: number;
  children?: JSX.Element;
  showTools?: boolean;
  onOk: () => void;
  onRun: (base64: string) => void;
  history: JSX.Element;
  disabled?: boolean;
  maskData?: any; // 默认的形状数据
}

export interface Pos {
  x: number;
  y: number;
}

// 点
export interface Point {
  points: Pos[];
  size: number;
}

export default function DrawLine(props: IProps) {
  let { width, height, scale } = props;

  width *= scale;
  height *= scale;

  const [isClear, setIsClear] = useState(false);
  const sizeRef = useRef<number>(20);
  const divRef = useRef<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>();
  const ctxRef = useRef<CanvasRenderingContext2D>();
  const offsetxy = useRef({ left: 0, top: 0 });
  const [mouseMV, setMouseMV] = useState<[number, number] | null>(null);

  // 缓存绘制的点
  const cachePoints = useRef<{ draw: Point[]; clear: Point[] }>({
    draw: [], // 绘制点
    clear: [], // 删除点
  });
  const lineColor = 'rgb(12, 246, 246)';
  // 清理指定的点
  const clearLine = (points: Pos[], n: number) => {
    ctxRef.current.globalCompositeOperation = 'destination-out';
    points.forEach(p => {
      // 画一个圆
      ctxRef.current.beginPath();
      ctxRef.current.arc(p.x, p.y, n / 2, 0, 2 * Math.PI);
      ctxRef.current.fill();
      // ctxRef.current.clearRect(p.x - n / 2, p.y - n / 2, n, n);
    });
    ctxRef.current.globalCompositeOperation = 'source-over';
  };

  // 清理全部线条
  const clearAll = () => {
    cachePoints.current = {
      draw: [], // 绘制点
      clear: [], // 删除点
    };
    ctxRef.current.clearRect(0, 0, width, height);
  };

  const drawLine = (points: Pos[], n: number) => {
    ctxRef.current.lineWidth = n;
    ctxRef.current.strokeStyle = lineColor;
    if (points.length > 1) {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        ctxRef.current.lineTo(points[i].x, points[i].y);
      }
      ctxRef.current.stroke();
    }
  };

  const initCtx = () => {
    if (!ctxRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      ctxRef.current = canvasRef.current.getContext('2d');
      divRef.current.innerHTML = '';
      divRef.current.appendChild(canvasRef.current);

      if (!offsetxy.current) {
        offsetxy.current = $(canvasRef.current).offset();
      }
    }
    ctxRef.current.clearRect(0, 0, width, height);
    // 设置初始线条颜色和透明度
    ctxRef.current.strokeStyle = lineColor;
    ctxRef.current.lineWidth = sizeRef.current;
    ctxRef.current.lineCap = 'round';
    ctxRef.current.lineJoin = 'round';
    ctxRef.current.imageSmoothingEnabled = true;
    if (!offsetxy.current) {
      offsetxy.current = $(divRef.current).offset();
    }
  };

  const reDraw = () => {
    cachePoints.current.draw.forEach(ps => {
      drawLine(ps.points, ps.size);
    });
    cachePoints.current.clear.forEach(ps => {
      clearLine(ps.points, ps.size);
    });
  };

  useEffect(() => {
    initCtx();
    reDraw();

    // 设置偏移值
    $(divRef.current)
      .on('mouseenter.showPen', () => {
        offsetxy.current = null;
      })
      .on('mousemove.showPen', e => {
        if (!offsetxy.current) {
          offsetxy.current = $(divRef.current).offset();
        }
        setMouseMV([e.pageX - offsetxy.current.left, e.pageY - offsetxy.current.top]);
      })
      .on('mouseleave.showPen', () => {
        setMouseMV(null);
      });

    $(document).on('mousewheel.drawLine', e => {
      offsetxy.current = null;
    });

    // 绘制
    $(divRef.current).on('mousedown.drawLine touchstart.drawLine', (e: any) => {
      e.preventDefault();

      // 添加点到数组
      let points = [];
      const addPoint = (x, y) => {
        x = x - offsetxy.current.left;
        y = y - offsetxy.current.top;
        points.push({
          x: x,
          y: y,
        });
      };

      if (e.touches) {
        e = e.touches[0];
      }

      addPoint(e.pageX, e.pageY);
      $(document).on('mousemove.drawLine touchmove.drawLine', (em: any) => {
        em.preventDefault();

        if (em.touches) {
          em = em.touches[0];
        }
        // 增加多个点以减少间距
        addPoint(em.pageX, em.pageY);
        ctxRef.current.clearRect(0, 0, width, height);
        reDraw();

        if (isClear) {
          clearLine(points, sizeRef.current);
        } else {
          drawLine(points, sizeRef.current);
        }
      });
      $(document).on('mouseup.drawLine touchend.drawLine', () => {
        if (isClear) {
          cachePoints.current.clear.push({
            points: [...points],
            size: sizeRef.current,
          });
        } else {
          cachePoints.current.draw.push({
            points: [...points],
            size: sizeRef.current,
          });
        }

        points = [];
        $(document).off('mousemove.drawLine touchmove.drawLine');
      });
    });

    return () => {
      $(document).off('mousewheel.drawLine');
      divRef.current?.removeChild(canvasRef.current); 
      $(divRef.current).off(
        'mousedown.drawLine touchstart.drawLine mousemove.showPen mouseenter.showPen mouseleave.showPen',
      );
    };
  }, [isClear]);

  return (
    <>
      <Space className={styles.tools}>
        <span className={styles.pen}>
          <i>{language.val('ai_rubber_draw')}</i>
          <Slider
            style={{ width: 120 }}
            defaultValue={sizeRef.current}
            size="small"
            min={1}
            tipFormatter={(v: number) => (
              <>
                <span className={styles.penSize} style={{ width: v, height: v }}></span>
                {v}px
              </>
            )}
            onChange={v => {
              sizeRef.current = v as number;
              reDraw();
            }}
          />
        </span>
        <Button
          type="danger"
          icon={<Clear theme="outline" size="20" fill="var(--theme-icon)" />}
          onClick={() => {
            Modal.confirm({
              title: language.val('ai_rubber_confirm_tip'),
              content: language.val('ai_rubber_confirm_content'),
              onOk: () => {
                clearAll();
              },
            });
          }}
        >
          {language.val('ai_rubber_clear')}
        </Button>
        <Button
          icon={<Erase theme="outline" size="20" fill="var(--theme-icon)" />}
          onClick={() => {
            setIsClear(true);
          }}
        >
          {language.val('ai_rubber_eraser')}
        </Button>
        <Button
          icon={<CosmeticBrush theme="outline" size="20" fill="var(--theme-icon)" />}
          onClick={() => {
            setIsClear(false);
          }}
        >
          {language.val('ai_rubber_pen')}
        </Button>
        <Button
          icon={<Click theme="outline" size="20" fill="var(--theme-icon)" />}
          onClick={async () => {
            // const imageData = ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            const imageData = canvasScale(1 / scale, canvasRef.current);
            const data = imageData.data;
            // rgb(12, 246, 246)
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] !== 0) {
                // console.log("data", data[i], data[i + 1], data[i + 2]);
                // 将不透明的颜色设置成白色
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
                data[i + 3] = 255;
              }
            }
            if (data.reduce((a, b) => a + b, 0) === 0) {
              props.onRun(null);
              ctxRef.current.clearRect(0, 0, width, height);
              return;
            }
            const cav = document.createElement('canvas');
            cav.width = canvasRef.current.width / scale;
            cav.height = canvasRef.current.height / scale;
            const ctx = cav.getContext('2d');
            ctx.putImageData(imageData, 0, 0);
            const base64 = cav.toDataURL('image/png');
            props.onRun(base64);
            clearAll();
          }}
        >
          {language.val('ai_rubber_execute')}
        </Button>
        <Button
          theme="solid"
          // icon={<Download theme="outline" size="20" fill="var(--theme-icon)" />}
          onClick={props.onOk}
        >
          {language.val('ai_download_tip')}
        </Button>
        {props.history}
      </Space>
      <div
        className={styles.drawLine + ' scroll'}
        onScroll={() => {
          offsetxy.current = $(divRef.current).offset();
        }}
      >
        <div className={styles.canvas} style={{ width, height }} ref={divRef}>
          {mouseMV ? (
            <span
              style={{
                display: mouseMV ? 'block' : 'none',
                left: mouseMV ? mouseMV[0] : 0,
                top: mouseMV ? mouseMV[1] : 0,
                width: sizeRef.current,
                height: sizeRef.current,
                borderRadius: 1000,
                backgroundColor: isClear ? '#fff' : lineColor,
              }}
              className={styles.mouseMV}
            ></span>
          ) : null}
        </div>
        {props.children}
      </div>
    </>
  );
}
