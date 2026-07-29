import styles from './color.module.less';
import { Sketch } from '@uiw/react-color';
import { Popover } from '@douyinfe/semi-ui';
import { useCallback, useReducer, useRef, useState } from 'react';
import { debounce, throttle } from 'lodash';

export interface IProps {
  colors: { color: string; p: number }[]; // 颜色值，比如 [{color: '#000000', p: 0}, {color: '#fff000', p: 1}]
  onChange: (colors: { color: string; p: number }[]) => void; // 值变化触发
  onAfterChange?: (colors: { color: string; p: number }[]) => void; // 修改完成后触发
}

export default function GradualColor(props: IProps) {
  // <Popover trigger="click" content={<SketchPicker />}>
  const ref = useRef<HTMLDivElement>();
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const { colors } = props;
  // const [colors, setColors] = useState([...props.colors]);
  const gradients = [];
  colors.forEach(d => {
    if (d.p < 0) {
      d.p = 0;
    }
    if (d.p > 1) {
      d.p = 1;
    }
    gradients.push(`${d.color} ${d.p * 100}%`);
  });

  // 防抖函数change
  const debouncechange = useCallback(
    debounce((v: any) => {
      console.log('vvvvvvvvv', v);
      props.onAfterChange(v);
    }, 1000),
    [],
  );

  return (
    <div
      className={styles.color}
      ref={ref}
      onClick={e => {
        if (e.target !== ref.current) {
          return;
        }
        const per = (e.pageX - ref.current.getBoundingClientRect().left) / ref.current.clientWidth;
        colors.push({ color: '#000000', p: per });
        props.onChange([...colors.sort((a, b) => a.p - b.p)]);
      }}
      style={{ backgroundImage: `linear-gradient(90deg, ${gradients.join(',')})` }}
    >
      {colors.map((d, index) => {
        const color = d.color;
        const left = d.p * 100;
        return (
          <Popover
            trigger="click"
            key={index}
            content={
              <div className={styles.colorModal}>
                <Sketch
                  color={color}
                  onChange={e => {
                    console.log('eee', e);
                    const nColors = [...colors];
                    //@ts-ignore
                    nColors[index].color = `rgba(${e.rgba.r}, ${e.rgba.g}, ${e.rgba.b}, ${e.rgba.a})`;
                    props.onChange([...nColors]);
                    debouncechange([...nColors]);
                  }}
                  // onChangeComplete={props.onAfterChange as any}
                  className={styles.colorPicker}
                />
                <div className={styles.colorModalFooter}>
                  {/* <a>前面插入</a> */}
                  {/* <a>后面插入</a> */}
                  <a
                    onClick={() => {
                      colors.splice(index, 1);
                      props.onChange([...colors]);
                    }}
                  >
                    删除颜色
                  </a>
                </div>
              </div>
            }
          >
            <a
              onClick={e => {
                e.stopPropagation();
              }}
              onMouseDown={e => {
                console.log(e.pageX, ref.current.clientWidth);
                const len = ref.current.clientWidth;
                const start = d.p;
                const moveFun = em => {
                  const min = colors[index - 1] ? colors[index - 1].p : 0;
                  const max = colors[index + 1] ? colors[index + 1].p : 1;
                  let a = (em.pageX - e.pageX) / len;
                  a = start + a;
                  if (a < min) {
                    a = min;
                  }
                  if (a > max) {
                    a = max;
                  }
                  if (a < 0) {
                    a = 0;
                  }
                  if (a > 1) {
                    a = 1;
                  }
                  d.p = a;
                  forceUpdate();
                };
                const moveUp = () => {
                  document.removeEventListener('mousemove', moveFun);
                  document.removeEventListener('mouseup', moveUp);
                  const nColors = [...colors];
                  props.onChange([...nColors]);
                };
                document.addEventListener('mousemove', moveFun);
                document.addEventListener('mouseup', moveUp);
              }}
              style={{ background: color, left: left + '%' }}
            ></a>
          </Popover>
        );
      })}
    </div>
  );
}
