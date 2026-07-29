import styles from './color.module.less';
import { Sketch } from '@uiw/react-color';
import { Popover, Button } from '@douyinfe/semi-ui';
import { useCallback, useState } from 'react';
import { debounce } from 'lodash';

export interface IProps {
  value: string; // 颜色值，比如 '#000000' 或者 'rgba(0,0,0,1)'
  style?: Record<string, any>; // 自定义style样式
  onChange: (v: { hex: string }) => void; // 值变化触发
  onAfterChange?: (v: { hex: string }) => void; // 修改完成后触发
}

declare global {
  interface Window {
    EyeDropper: new () => EyeDropperAPI;
  }

  interface EyeDropperAPI {
    open: () => Promise<{ sRGBHex: string }>;
  }
}

const isSupported = 'EyeDropper' in window;
export default function Color(props: IProps) {
  // 吸管功能
  const handleEyedropper = async () => {
    if (!('EyeDropper' in window)) {
      console.warn('浏览器不支持 EyeDropper API');
      return;
    }

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      // result.sRGBColor 格式为 "rgb(r, g, b)" 或 "rgba(r, g, b, a)"
      const hex = result.sRGBHex;
      props.onChange({ hex });
      props.onAfterChange?.({ hex });
    } catch (error) {
      // 用户取消选择或发生错误
      console.log('Eyedropper cancelled or error:', error);
    }
  };

  // 防抖函数change
  const debouncechange = useCallback(
    debounce((v: any) => {
      console.log('vvvvvvvvv', v);
      props.onAfterChange(v);
    }, 1000),
    [props],
  );

  return (
    <Popover
      trigger="click"
      content={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Sketch
            color={props.value}
            onChange={v => {
              props.onChange(v);
              debouncechange(v);
            }}
          />
          {isSupported && (
            <Button onClick={handleEyedropper} style={{ marginTop: 0 }}>
              吸取颜色
            </Button>
          )}
        </div>
      }
    >
      <span style={{ backgroundColor: props.value, ...(props.style || {}) }} className={styles.color}></span>
    </Popover>
  );
}
