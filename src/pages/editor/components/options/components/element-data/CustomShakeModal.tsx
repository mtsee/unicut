import React, { useMemo, useState } from 'react';
import { Button, InputNumber, Modal, Switch } from '@douyinfe/semi-ui';
import { util } from '@utils/index';
import styles from './styles.module.less';

interface Props {
  visible: boolean;
  elementData: any;
  onCancel: () => void;
  onApply: (frames: any[]) => void;
}

// 预览动画固定 10s
const PREVIEW_DURATION = 10;

const CustomShakeModal: React.FC<Props> = ({ visible, elementData, onCancel, onApply }) => {
  const [rangeX, setRangeX] = useState(10);
  const [rangeY, setRangeY] = useState(10);
  const [interval, setInterval] = useState(0.2);
  const [isRandom, setIsRandom] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewFrames, setPreviewFrames] = useState<any[]>([]);

  // 生成帧数据（通用，duration 按需传入）
  // interval = 每次波动动画的时长（一个完整正弦波周期）
  const genFrames = (duration: number, baseX: number, baseY: number) => {
    const arr: any[] = [];
    const step = 0.05; // 固定采样步长，保证动画平滑
    if (isRandom) {
      for (let i = step; i < duration; i += step) {
        arr.push({
          id: util.randomID(),
          startTime: i,
          x: baseX + (Math.random() - 0.5) * rangeX * 2,
          y: baseY + (Math.random() - 0.5) * rangeY * 2,
        });
      }
    } else {
      for (let i = step; i < duration; i += step) {
        const ratio = Math.sin((i / interval) * Math.PI * 2);
        arr.push({
          id: util.randomID(),
          startTime: i,
          x: baseX + ratio * rangeX,
          y: baseY + ratio * rangeY,
        });
      }
    }
    return arr;
  };

  // 生成关键帧 CSS 字符串（预览用，固定 10s）
  const keyframesCSS = useMemo(() => {
    if (!previewFrames.length) return '';
    const { x: baseX, y: baseY } = elementData.style || { x: 0, y: 0 };
    let css = '@keyframes customShake {';
    for (const frame of previewFrames) {
      const percent = ((frame.startTime / PREVIEW_DURATION) * 100).toFixed(2);
      const dx = (frame.x - baseX) * 2;
      const dy = (frame.y - baseY) * 2;
      css += `${percent}% { transform: translate(${dx}px, ${dy}px); }`;
    }
    css += '100% { transform: translate(0px, 0px); }';
    css += '}';
    return css;
  }, [previewFrames, elementData]);

  // 弹窗打开时初始化预览帧
  const handleOpen = () => {
    const { x = 0, y = 0 } = elementData.style || {};
    const arr = genFrames(PREVIEW_DURATION, x, y);
    setPreviewFrames(arr);
    setPreviewKey(k => k + 1);
  };

  // 预览
  const handlePreview = () => {
    const { x = 0, y = 0 } = elementData.style || {};
    const arr = genFrames(PREVIEW_DURATION, x, y);
    setPreviewFrames(arr);
    setPreviewKey(k => k + 1);
  };

  // 确认应用
  const handleOk = () => {
    const duration = elementData.duration || 2;
    const { x = 0, y = 0 } = elementData.style || {};
    const arr = genFrames(duration, x, y);
    onApply(arr);
    onCancel();
  };

  return (
    <Modal
      title="自定义抖动"
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      afterOpen={handleOpen}
      okText="生成并应用"
      width={520}
    >
      <style>{keyframesCSS}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className={styles.frameItem}>
          <span>X轴范围</span>
          <InputNumber
            value={rangeX}
            min={0}
            max={500}
            step={1}
            onChange={v => setRangeX(v as number)}
            style={{ width: 120 }}
          />
          <span style={{ marginLeft: 8, opacity: 0.5, fontSize: 12 }}>像素（±范围）</span>
        </div>
        <div className={styles.frameItem}>
          <span>Y轴范围</span>
          <InputNumber
            value={rangeY}
            min={0}
            max={500}
            step={1}
            onChange={v => setRangeY(v as number)}
            style={{ width: 120 }}
          />
          <span style={{ marginLeft: 8, opacity: 0.5, fontSize: 12 }}>像素（±范围）</span>
        </div>
        <div className={styles.frameItem}>
          <span>时间间隔</span>
          <InputNumber
            value={interval}
            min={0.05}
            max={5}
            step={0.05}
            onChange={v => setInterval(v as number)}
            style={{ width: 120 }}
          />
          <span style={{ marginLeft: 8, opacity: 0.5, fontSize: 12 }}>每次波动时长（秒）</span>
        </div>
        <div className={styles.frameItem}>
          <span>随机</span>
          <Switch checked={isRandom} onChange={v => setIsRandom(v)} />
          <span style={{ marginLeft: 8, opacity: 0.5, fontSize: 12 }}>
            {isRandom ? '随机偏移' : '正弦往复'}
          </span>
        </div>
      </div>

      {/* 预览区域 */}
      <div
        style={{
          marginTop: 16,
          border: '1px dashed var(--semi-color-border)',
          borderRadius: 8,
          height: 120,
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--semi-color-fill-0)',
        }}
      >
        <div
          key={previewKey}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 30,
            height: 30,
            marginLeft: -15,
            marginTop: -15,
            background: 'var(--theme-main, #6c5ce7)',
            borderRadius: 4,
            animation: previewFrames.length ? 'customShake 10s linear infinite' : 'none',
          }}
        />
        {!previewFrames.length && (
          <span
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.4,
              fontSize: 12,
            }}
          >
            点击"预览"查看动画效果
          </span>
        )}
      </div>

      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <Button theme="light" onClick={handlePreview}>
          预览
        </Button>
      </div>
    </Modal>
  );
};

export default CustomShakeModal;
