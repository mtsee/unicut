import { Button, Input, InputNumber, Modal, Space, Switch, TextArea, Toast } from '@douyinfe/semi-ui';
import { Item } from '@pages/editor/components/options/components';
import { Editor } from '@stores/editor';
import { util } from '@utils/index';
import React, { useReducer, useState } from 'react';
import { CodeDownload } from '@icon-park/react';
import { stores } from '@stores/index';
import CustomShakeModal from './CustomShakeModal';

type Props = {};

const FrameData = (props: Props) => {
  const { editor } = stores;
  const elementData = editor.getElementData() as any;
  const [visible, setVisible] = useState<boolean>(false);
  const [frames, setFrames] = useState<any>(elementData.frames);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [customVisible, setCustomVisible] = useState(false);

  const applyToElement = (arr: any[]) => {
    setFrames(arr);
    elementData.frames = arr;
    editor.updateMovie();
    editor.updateTimeline();
  };

  return (
    <>
      <Item
        title="帧数据"
        extra={
          <Space>
            <a onClick={() => setVisible(true)}>
              <CodeDownload theme="outline" size="20" fill="var(--theme-icon)" strokeWidth={3} />
            </a>
          </Space>
        }
      ></Item>
      <Modal title="帧数据" visible={visible} onCancel={() => setVisible(false)} onOk={() => setVisible(false)}>
        <TextArea
          rows={8}
          onBlur={() => {
            elementData.frames = frames;
            editor.updateMovie();
            editor.updateTimeline();
          }}
          onChange={e => {
            setFrames(JSON.parse(e));
          }}
          value={JSON.stringify(frames, null, 2)}
        />
        <Space style={{ marginTop: '10px' }}>
          <a
            onClick={() => {
              const duration = elementData.duration;
              const arr = [];
              const { x, y } = elementData.style;
              let lock = false;
              const distance = 5;
              for (let i = 0.2; i < duration; i += 0.2) {
                arr.push({
                  id: util.randomID(),
                  startTime: i,
                  x: x + (lock ? 0 : distance * 2),
                  y: y + (lock ? 0 : distance * 2),
                });
                lock = !lock;
              }
              applyToElement(arr);
            }}
          >
            抖↘
          </a>
          <a
            onClick={() => {
              const duration = elementData.duration;
              const arr = [];
              const { x, y } = elementData.style;
              let lock = false;
              const distance = 5;
              for (let i = 0.2; i < duration; i += 0.2) {
                arr.push({
                  id: util.randomID(),
                  startTime: i,
                  x: x,
                  y: y + (lock ? 0 : -distance * 2),
                });
                lock = !lock;
              }
              applyToElement(arr);
            }}
          >
            抖↓
          </a>
          <a
            onClick={() => {
              const duration = elementData.duration;
              const arr = [];
              const { x, y } = elementData.style;
              let lock = false;
              const distance = 5;
              for (let i = 0.2; i < duration; i += 0.2) {
                arr.push({
                  id: util.randomID(),
                  startTime: i,
                  x: x - (lock ? 0 : distance * 2),
                  y: y + (lock ? 0 : distance * 2),
                });
                lock = !lock;
              }
              applyToElement(arr);
            }}
          >
            抖↙
          </a>
          <a
            onClick={() => {
              const duration = elementData.duration;
              const arr = [];
              const { x, y } = elementData.style;
              let lock = false;
              const distance = 5;
              for (let i = 0.2; i < duration; i += 0.2) {
                arr.push({
                  id: util.randomID(),
                  startTime: i,
                  x: x + (lock ? distance : -distance),
                  y: y,
                });
                lock = !lock;
              }
              applyToElement(arr);
            }}
          >
            抖↔
          </a>
          <a
            onClick={() => {
              applyToElement([]);
            }}
          >
            清空
          </a>
          <a onClick={() => setCustomVisible(true)}>自定义</a>
        </Space>
      </Modal>

      <CustomShakeModal
        visible={customVisible}
        elementData={elementData}
        onCancel={() => setCustomVisible(false)}
        onApply={applyToElement}
      />
    </>
  );
};

export default FrameData;
