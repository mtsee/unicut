import styles from './opacity.module.less';
import Item from '../item';
import SliderInput from '../slider-input';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { observer } from 'mobx-react';
import type { ImageElement } from 'video-core-sdk';
import { utils } from 'video-core-sdk';
import { pubsub } from '@utils/pubsub';
import { language } from '@language/language';
import { stores } from '@stores/index';
import KeyFrameDot from '../keyframe-dot/KeyFrameDot';
import { Button, InputNumber, Modal, Space } from '@douyinfe/semi-ui';
import { VideoTracker } from './VideoTracker';
import { getMaterialFileUrl } from '@services/localStorageService';

export interface IProps {}

function ElemTrack(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as ImageElement;
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [key, setKey] = useState(0);
  const [url, setUrl] = useState('');
  const [type, setType] = useState('video');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (elementData) {
      const resource = editor.data.resouces.find(d => d.id === elementData.resourceId);
      if (!resource) return null;
      setWidth(elementData.style.width);
      setHeight(elementData.style.height);
      console.log('resource>》》》》》》》》》》》》》》》》>>noAudioTracks', resource.noAudioTracks);
      getMaterialFileUrl(resource.url).then(url => {
        if (url) {
          setUrl(url);
        }
      });
      setType(resource.type === 'image' ? 'png' : 'video');
      setDuration(resource.duration || 0);
    }
  }, [elementData]);

  if (!elementData.isApng && elementData.type !== 'video') return null;

  console.log('elementData>>>', elementData);

  return (
    <>
      <Item title={'轨迹追踪'} extra={<Button onClick={() => setVisible(true)}>追踪</Button>}></Item>
      <Modal
        visible={visible}
        footer={null}
        title="轨迹追踪"
        width={1200}
        onCancel={() => setVisible(false)}
        onOk={() => setVisible(false)}
      >
        <div>轨迹追踪</div>
        <div>
          <Space>
            <InputNumber
              suffix="宽"
              value={width}
              onChange={(val: number) => {
                setWidth(val);
              }}
              style={{ width: 120 }}
            />
            <InputNumber
              suffix="高"
              value={height}
              onChange={(val: number) => {
                setHeight(val);
              }}
              style={{ width: 120 }}
            />
            <Button onClick={() => setKey(+new Date())}>重置</Button>
          </Space>
        </div>
        <div style={{ width: 1150 }}>
          {url && (
            <VideoTracker
              key={key}
              url={url}
              imageSpeed={elementData.imageSpeed || 1}
              startFrameDuration={elementData.startFrameDuration || 0}
              playFrameDuration={elementData.playFrameDuration || duration || 0}
              onResult={data => {
                console.log('data>>>', data);
              }}
              width={width}
              height={height}
              type={type as 'video' | 'png'}
            />
          )}
        </div>
      </Modal>
    </>
  );
}

export default observer(ElemTrack);
