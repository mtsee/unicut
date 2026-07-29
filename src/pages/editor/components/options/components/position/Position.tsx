import styles from './position.module.less';
import Item from '../item';
import { InputNumber } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import type { ImageElement } from 'video-core-sdk';
import { useEffect, useReducer } from 'react';
import { utils } from 'video-core-sdk';
import { pubsub } from '@utils/pubsub';
import { language } from '@language/language';
import { stores } from '@stores/index';
import KeyFrameDot from '../keyframe-dot/KeyFrameDot';

export interface IProps {}

function Position(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as ImageElement;
  editor.updateKey;
  editor.currentTime;
  const { width, height, captions } = editor.data;

  // 如果有帧
  const frameStatus = editor.movie.getFrameStatusByCurrentTime(elementData);
  const frame = editor.movie.getFrameItem(elementData);
  
  const changeX = (v: number) => {
    const frameStatus = editor.movie.getFrameStatusByCurrentTime(elementData);
    const frame = editor.movie.getFrameItem(elementData);
    if (elementData.type === 'caption') {
      captions.forEach(t => {
        t.style.x = utils.toNum(v + width / 2);
      });
    } else {
      if (frameStatus?.x !== undefined) {
        if (frame) {
          frame.x = utils.toNum(v + width / 2);
        } else {
          const anime = editor.movie.updateKeyFrame(elementData, ['x_y']);
          editor.frameSelectedId = anime.id;
          anime.x = utils.toNum(v + width / 2);
        }
        pubsub.publish('keyboardUpdateFrame');
      } else {
        elementData.style.x = utils.toNum(v + width / 2);
      }
    }
    editor.updateMovie();
    forceUpdate();
  };

  const changeY = (v: number) => {
    if (elementData.type === 'caption') {
      captions.forEach(t => {
        t.style.y = utils.toNum(v + height / 2);
      });
    } else {
      if (frameStatus?.y !== undefined) {
        if (frame) {
          frame.y = utils.toNum(v + height / 2);
        } else {
          const anime = editor.movie.updateKeyFrame(elementData, ['x_y']);
          editor.frameSelectedId = anime.id;
          anime.y = utils.toNum(v + height / 2);
        }
        pubsub.publish('keyboardUpdateFrame');
      } else {
        elementData.style.y = utils.toNum(v + height / 2);
      }
    }
    editor.updateMovie();
    forceUpdate();
  };

  const x =
    frameStatus?.x !== undefined
      ? utils.toNum(frameStatus.x - width / 2)
      : utils.toNum(elementData.style.x - width / 2);
  const y =
    frameStatus?.y !== undefined
      ? utils.toNum(frameStatus.y - height / 2)
      : utils.toNum(elementData.style.y - height / 2);

  useEffect(() => {
    pubsub.subscribe('keyboardArrowLeft', (_, val) => {
      changeX(x - val);
    });
    pubsub.subscribe('keyboardArrowRight', (_, val) => {
      changeX(x + val);
    });
    pubsub.subscribe('keyboardArrowUp', (_, val) => {
      changeY(y - val);
    });
    pubsub.subscribe('keyboardArrowDown', (_, val) => {
      changeY(y + val);
    });

    return () => {
      pubsub.unsubscribe('keyboardArrowLeft');
      pubsub.unsubscribe('keyboardArrowRight');
      pubsub.unsubscribe('keyboardArrowUp');
      pubsub.unsubscribe('keyboardArrowDown');
    };
  }, [x, y]);

  return (
    <Item title={language.val('option_position')} extra={<KeyFrameDot keyFrameName="x_y" />}>
      <div className={styles.position}>
        <InputNumber
          innerButtons
          prefix="X"
          value={utils.toNum(x)}
          onChange={changeX}
          onBlur={() => {
            editor.record({
              type: 'elements_update',
              desc: language.val('option_position_x'),
              data: [elementData],
            });
          }}
        />
        <InputNumber
          innerButtons
          prefix="Y"
          value={utils.toNum(y)}
          onChange={changeY}
          onBlur={() => {
            editor.record({
              type: 'elements_update',
              desc: language.val('option_position_y'),
              data: [elementData],
            });
          }}
        />
      </div>
    </Item>
  );
}

export default observer(Position);
