import styles from './strength.module.less';
import Item from '../item';
import SliderInput from '../slider-input';
import { utils } from 'video-core-sdk';
import type { FilterElement } from 'video-core-sdk';
import { observer } from 'mobx-react';
import { useReducer } from 'react';
import { language } from '@language/language';
import { stores } from '@stores/index';
import KeyFrameDot from '../keyframe-dot/KeyFrameDot';
import { pubsub } from '@utils/pubsub';

export interface IProps {}

function Strength(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as FilterElement;
  const { intensity } = elementData;

  const frameStatus = editor.movie.getFrameStatusByCurrentTime(elementData);
  const frame = editor.movie.getFrameItem(elementData);

  const val =
    frameStatus?.intensity !== undefined ? utils.toNum(frameStatus.intensity * 100) : utils.toNum(intensity * 100);

  return (
    <Item title={language.val('option_strength')} extra={<KeyFrameDot keyFrameName="intensity" />}>
      <div className={styles.strength}>
        <SliderInput
          value={val}
          onChange={v => {
            elementData.intensity = utils.toNum(v / 100, 2);
            if (frameStatus?.intensity !== undefined) {
              if (frame) {
                frame.intensity = utils.toNum(v / 100, 2);
              } else {
                const anime = editor.movie.updateKeyFrame(elementData as any, ['intensity']);
                editor.frameSelectedId = anime.id;
                anime.intensity = utils.toNum(v / 100, 2);
              }
              pubsub.publish('keyboardUpdateFrame');
            } else {
              elementData.intensity = utils.toNum(v / 100, 2);
            }
            editor.updateMovie();
            forceUpdate();
          }}
          suffix="%"
          step={1}
          min={0}
          max={100} // 16 + 9
          onAfterChange={() => {
            editor.record({
              type: 'elements_update',
              desc: '修改滤镜强度',
              data: [elementData],
            });
          }}
        />
      </div>
    </Item>
  );
}

export default observer(Strength);
