import styles from './rotation.module.less';
import Item from '../item';
import { InputNumber, Space } from '@douyinfe/semi-ui';
import { useReducer } from 'react';
import type { ImageElement } from 'video-core-sdk';
import { utils } from 'video-core-sdk';
import { pubsub } from '@utils/pubsub';
import { observer } from 'mobx-react';
import { language } from '@language/language';
import { stores } from '@stores/index';
import KeyFrameDot from '../keyframe-dot/KeyFrameDot';
import SliderInput from '../slider-input';

export interface IProps {}

function Rotation(props: IProps) {
  const { editor } = stores;
  editor.currentTime;
  editor.updateKey;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as ImageElement;
  const frameStatus = editor.movie.getFrameStatusByCurrentTime(elementData);
  const frame = editor.movie.getFrameItem(elementData);

  return (
    <Item title={language.val('option_rotation')} extra={<KeyFrameDot keyFrameName="rotation" />}>
      <div className={styles.opacity}>
        <SliderInput
          step={1}
          min={-360}
          max={360}
          inputNumberNoMinMax={true}
          suffix="°"
          value={
            frameStatus?.rotation !== undefined
              ? utils.toNum((frameStatus.rotation * 180) / Math.PI, 0)
              : utils.toNum((elementData.style.rotation * 180) / Math.PI, 0)
          }
          onChange={(v: any) => {
            console.log('v', v);
            let val = utils.toNum((v * Math.PI) / 180, 2);
            if (elementData.type === 'caption') {
              editor.data.captions.forEach(t => {
                t.style.rotation = val;
              });
            } else {
              if (frameStatus?.rotation !== undefined) {
                if (frame) {
                  frame.rotation = val;
                } else {
                  console.log('插入新的关键帧插入新的关键帧插入新的关键帧', val);
                  const anime = editor.movie.updateKeyFrame(elementData, ['rotation']);
                  editor.frameSelectedId = anime.id;
                  anime.rotation = val;
                }
                pubsub.publish('keyboardUpdateFrame');
              } else {
                elementData.style.rotation = val;
              }
            }
            forceUpdate();
            editor.updateMovie();
          }}
          onAfterChange={e => {
            editor.record({
              type: 'elements_update',
              desc: '修改旋转角度',
              data: [elementData],
            });
          }}
        />
      </div>
    </Item>
  );
}

export default observer(Rotation);
