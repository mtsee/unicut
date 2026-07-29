import styles from './customAnimation.module.less';
import { Popover, Button, InputNumber } from '@douyinfe/semi-ui';
import { utils } from 'video-core-sdk';
import classNames from 'classnames';
import type { AnimationFrame, VideoElement } from 'video-core-sdk';
import SliderInput from '../slider-input';
import Item from '../item';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import $ from 'jquery';
import { remove } from 'lodash';
import { stores } from '@stores/index';
import { util } from '@utils/index';

export interface IProps {
  element: VideoElement;
}

function CustomAnimation(props: IProps) {
  const { editor } = stores;
  const { element } = props;
  const ref = useRef<HTMLDivElement>();
  const { frames } = element.animates[0];
  const [selectFrame, setSelectFrame] = useState(null);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [mx, setMX] = useState(null);
  const [progressBoxLeft, setProgressBoxLeft] = useState(0);

  const getPrevNext = frame => {
    const fIndex = frames.findIndex(f => f.id === frame.id);
    const prev = frames[fIndex - 1] || { progress: 0 };
    const next = frames[fIndex + 1] || { progress: 1 };
    return { prev, next };
  };

  const onDragStart = (e: any, frame: AnimationFrame) => {
    const width = ref.current.clientWidth;
    const startProgress = frame.progress;
    const { prev, next } = getPrevNext(frame);

    $(document)
      .on('mousemove.ievent.customAnimateList', em => {
        const ex = em.pageX - e.pageX;
        let p = ex / width;
        frame.progress = startProgress + p;
        if (frame.progress < prev.progress) {
          frame.progress = prev.progress;
        }
        if (frame.progress > next.progress) {
          frame.progress = next.progress;
        }
        forceUpdate();
      })
      .on('mouseup.ievent.customAnimateList', () => {
        $(document).off('mousemove.ievent.customAnimateList');
        $(document).off('mouseup.ievent.customAnimateList');
      });
  };

  const updateTransForm = (v: number, key: string) => {
    selectFrame.transform[key] = v;
    element._animationDirty = utils.createID();
    editor.updateMovie();
    forceUpdate();
    editor.customAnimationPathUpdateKey++;
  };

  useEffect(() => {
    if (!selectFrame) {
      editor.showCustomAnimation = false;
    } else {
      editor.showCustomAnimation = true;
    }
    return () => {
      editor.showCustomAnimation = false;
    };
  }, [selectFrame]);

  useEffect(() => {
    return () => {
      editor.setCustomAnimationId('');
    };
  }, []);

  // 相对进度
  const speed = (element as any).speed || 1;
  let realtive = (editor.currentTime - element.startTime) / (element.duration / speed);
  if (realtive < 0) {
    realtive = 0;
  }
  if (realtive > 1) {
    realtive = 1;
  }

  return (
    <>
      <div
        className={styles.customAnimateList}
        ref={ref}
        onMouseEnter={() => {
          const { left } = $(ref.current).offset();
          setProgressBoxLeft(left);
        }}
        onMouseMove={e => {
          let p = util.timeToNum((e.pageX - progressBoxLeft) / ref.current.clientWidth);
          if (p < 0) {
            p = 0;
          }
          if (p > 1) {
            p = 1;
          }
          setMX(p);
        }}
        onMouseLeave={() => {
          setMX(null);
        }}
      >
        <span className={styles.line} style={{ left: realtive * 100 + '%' }}></span>
        {frames.map((frame, i) => {
          return (
            <span
              key={frame.id}
              onMouseDown={e => {
                e.stopPropagation();
                setSelectFrame(frame);
                editor.setCustomAnimationId(frame.id);
                if (i !== 0 && i !== frames.length - 1) {
                  onDragStart(e, frame);
                }
              }}
              className={classNames(styles.dot, {
                [styles.active]: selectFrame?.id === frame.id,
              })}
              style={{ left: frame.progress * 100 + '%' }}
              data-id={frame.id}
            ></span>
          );
        })}
        {mx !== null && (
          <span
            onClick={() => {
              console.log('添加', mx);

              // 计算当前的状态
              let prev: AnimationFrame = null;
              let next: AnimationFrame = null;
              for (let i = 0; i < frames.length - 1; i++) {
                prev = frames[i];
                next = frames[i + 1];
                if (prev.progress <= mx && next.progress >= mx) {
                  break;
                }
              }
              if (prev && next) {
                const nFrame = {
                  id: utils.createID(),
                  progress: mx,
                  alpha: (next.alpha - prev.alpha) / 2 + prev.alpha,
                  transform: {
                    translateX: (next.transform.translateX - prev.transform.translateX) / 2 + prev.transform.translateX,
                    translateY: (next.transform.translateY - prev.transform.translateY) / 2 + prev.transform.translateY,
                    rotation: (next.transform.rotation - prev.transform.rotation) / 2 + prev.transform.rotation,
                    scaleX: (next.transform.scaleX - prev.transform.scaleX) / 2 + prev.transform.scaleX,
                    scaleY: (next.transform.scaleY - prev.transform.scaleY) / 2 + prev.transform.scaleY,
                    skewX: (next.transform.skewX - prev.transform.skewX) / 2 + prev.transform.skewX,
                    skewY: (next.transform.skewY - prev.transform.skewY) / 2 + prev.transform.skewY,
                  },
                  _dirty: utils.createID(),
                };
                frames.push(nFrame);
                frames.sort((a, b) => a.progress - b.progress);
                forceUpdate();
                element._animationDirty = utils.createID();
                editor.updateMovie();
                // editor.updateTimelineElement();
                // 设置选中
                setSelectFrame(nFrame);
              } else {
                console.error('prev,next数据异常，新增的点必须在两者之间', { prev, next });
              }
            }}
            className={classNames(styles.dot, styles.addDot)}
            style={{ left: mx * 100 + '%' }}
          >
            +
          </span>
        )}
      </div>
      {selectFrame &&
        (() => {
          const { translateX, translateY, scaleX, scaleY, skewX, skewY, rotation } = selectFrame.transform;
          const { prev, next } = getPrevNext(selectFrame);
          return (
            <div className={styles.options}>
              <Item title="进度" className={styles.item}>
                <div className={styles.position}>
                  <InputNumber
                    innerButtons
                    suffix="%"
                    key={`${prev.progress}_${next.progress}`}
                    // min={utils.toNum(prev.progress * 100)}
                    // max={utils.toNum(next.progress * 100)}
                    min={0}
                    max={100}
                    value={utils.toNum(selectFrame.progress * 100)}
                    onChange={(v: number) => {
                      if (typeof v === 'string') return;
                      selectFrame.progress = utils.toNum(v) / 100;
                      element._animationDirty = utils.createID();
                      editor.updateMovie();
                      forceUpdate();
                    }}
                  />
                  <Button
                    disabled={selectFrame.id === frames[0].id || selectFrame.id === frames[frames.length - 1].id}
                    onClick={() => {
                      remove(frames, d => d.id === selectFrame.id);
                      element._animationDirty = utils.createID();
                      editor.updateMovie();
                      forceUpdate();
                      editor.setCustomAnimationId('');
                    }}
                    type="danger"
                    style={{ width: 'calc(50% - 3px)' }}
                  >
                    删除此帧
                  </Button>
                </div>
              </Item>
              <Item title="位置" className={styles.item}>
                <div className={styles.position}>
                  <InputNumber
                    innerButtons
                    prefix="X"
                    suffix="px"
                    value={utils.toNum(translateX)}
                    onChange={(v: number) => {
                      if (typeof v === 'string') return;
                      updateTransForm(utils.toNum(v), 'translateX');
                    }}
                  />
                  <InputNumber
                    innerButtons
                    prefix="Y"
                    suffix="px"
                    value={utils.toNum(translateY)}
                    onChange={(v: number) => {
                      if (typeof v === 'string') return;
                      updateTransForm(utils.toNum(v), 'translateY');
                    }}
                  />
                </div>
              </Item>
              <Item title="缩放" className={styles.item}>
                <div className={styles.position}>
                  <InputNumber
                    innerButtons
                    prefix="scaleX"
                    step={0.01}
                    suffix="px"
                    min={0}
                    value={utils.toNum(scaleX, 2)}
                    onChange={(v: number) => {
                      if (typeof v === 'string') return;
                      updateTransForm(utils.toNum(v, 2), 'scaleX');
                    }}
                  />
                  <InputNumber
                    innerButtons
                    prefix="scaleY"
                    step={0.01}
                    suffix="px"
                    min={0}
                    value={utils.toNum(scaleY, 2)}
                    onChange={(v: number) => {
                      if (typeof v === 'string') return;
                      updateTransForm(utils.toNum(v, 2), 'scaleY');
                    }}
                  />
                </div>
              </Item>
              <Item title="倾斜" className={styles.item}>
                <div className={styles.position}>
                  <InputNumber
                    innerButtons
                    prefix="skewX"
                    step={0.01}
                    value={utils.toNum(skewX, 2)}
                    suffix="°"
                    onChange={(v: number) => {
                      if (typeof v === 'string') return;
                      updateTransForm(utils.toNum(v, 2), 'skewX');
                    }}
                  />
                  <InputNumber
                    innerButtons
                    prefix="skewY"
                    suffix="°"
                    step={0.01}
                    value={utils.toNum(skewY, 2)}
                    onChange={(v: number) => {
                      if (typeof v === 'string') return;
                      updateTransForm(utils.toNum(v, 2), 'skewY');
                    }}
                  />
                </div>
              </Item>
              <Item title="旋转" className={styles.item}>
                <div className={styles.rotation}>
                  <InputNumber
                    innerButtons
                    prefix="圈数"
                    min={0}
                    value={~~(rotation / (Math.PI * 2))}
                    onChange={(v: number) => {
                      if (typeof v === 'string') return;
                      const rota = rotation % (Math.PI * 2);
                      selectFrame.transform.rotation = utils.toNum(v * Math.PI * 2 + rota, 2);
                      element._animationDirty = utils.createID();
                      editor.updateMovie();
                      forceUpdate();
                    }}
                  />
                  <InputNumber
                    innerButtons
                    prefix="角度"
                    suffix="°"
                    min={0}
                    max={360}
                    value={utils.toNum(((rotation % (Math.PI * 2)) * 180) / Math.PI)}
                    onChange={(v: number) => {
                      if (typeof v === 'string') return;
                      const n = ~~(rotation / (Math.PI * 2));
                      selectFrame.transform.rotation = utils.toNum(v * (Math.PI / 180) + n * Math.PI * 2, 2);
                      element._animationDirty = utils.createID();
                      editor.updateMovie();
                      forceUpdate();
                    }}
                  />
                </div>
              </Item>
              <Item title="透明度" className={styles.item}>
                <SliderInput
                  // suffix="%"
                  min={0}
                  max={100}
                  value={~~(selectFrame.alpha * 100)}
                  onChange={v => {
                    if (typeof v === 'string') return;
                    selectFrame._dirty = utils.createID();
                    selectFrame.alpha = utils.toNum(v / 100, 2);
                    element._animationDirty = utils.createID();
                    editor.updateMovie();
                    forceUpdate();
                  }}
                  step={0.1}
                />
              </Item>
            </div>
          );
        })()}
    </>
  );
}

export default observer(CustomAnimation);
