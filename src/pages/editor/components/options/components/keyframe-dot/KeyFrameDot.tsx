import { observer } from 'mobx-react';
import React, { useReducer } from 'react';
import { stores } from '@stores/index';
import type { ImageElement, KeyFrameName } from 'video-core-sdk';
import { effectFrameFields } from 'video-core-sdk';
import { DiamondThree, Left, Right } from '@icon-park/react';
import _remove from 'lodash/remove';
import { transaction } from 'mobx';
import { util } from '@utils/index';
import styles from './styles.module.less';

type Props = {
  keyFrameName: KeyFrameName;
};

const KeyFrameDot = (props: Props) => {
  const { editor } = stores;
  const elementData = editor.getElementData() as ImageElement;
  // const [, forceUpdate] = useReducer(x => x + 1, 0);

  editor.currentTime;
  editor.updateKey;

  if (!elementData) return null;

  if (!elementData.frames) {
    elementData.frames = [];
  }

  // 判断当前currentTime是否有keyframe
  const relativeTime = editor.movie.getRelativeTimeByCurrentTime(elementData, editor.currentTime);
  // 判断relativeTime是否有keyframe

  // 不同的keyFrameName，判断不同的keyframe
  let frames = [...elementData.frames];
  // console.log(frames);

  switch (props.keyFrameName) {
    case 'x_y':
      // 保留x,y
      frames = frames.filter(item => item.x !== undefined || item.y !== undefined);
      break;
    case 'width_height':
      // 保留width,height
      frames = frames.filter(item => item.width !== undefined || item.height !== undefined);
      break;
    case 'scale':
      // 保留scale
      frames = frames.filter(item => item.scale !== undefined);
      break;
    case 'alpha':
      // 保留alpha
      frames = frames.filter(item => item.alpha !== undefined);
      break;
    case 'rotation':
      // 保留rotation
      frames = frames.filter(item => item.rotation !== undefined);
      break;
    case 'maskX_maskY':
      // 保留maskX,maskY
      frames = frames.filter(item => item.maskX !== undefined || item.maskY !== undefined);
      break;
    case 'maskWidth_maskHeight':
      // 保留maskWidth,maskHeight
      frames = frames.filter(item => item.maskWidth !== undefined || item.maskHeight !== undefined);
      break;
    case 'maskBlur':
      // 保留maskBlur
      frames = frames.filter(item => item.maskBlur !== undefined);
      break;
    case 'maskRotation':
      // 保留maskRotation
      frames = frames.filter(item => item.maskRotation !== undefined);
      break;
    case 'maskAlpha':
      // 保留maskAlpha
      frames = frames.filter(item => item.maskAlpha !== undefined);
      break;
    case 'intensity':
      // 保留intensity
      frames = frames.filter(item => item.intensity !== undefined);
      break;
    case 'textScale':
      // 保留textScale
      frames = frames.filter(item => item.textScale !== undefined);
      break;
    // case 'textColor':
    //   // 保留textColor
    //   frames = frames.filter(item => item.textColor !== undefined);
    //   break;
    // case 'textBgColor':
    //   // 保留textBgColor
    //   frames = frames.filter(item => item.textBgColor !== undefined);
    //   break;
    // case 'textBorderColor':
    //   // 保留textBorderColor
    //   frames = frames.filter(item => item.textBorderColor !== undefined);
    //   break;
    // case 'textGradientStops':
    //   // 保留textGradientStops
    //   frames = frames.filter(item => item.textGradientStops !== undefined);
    //   break;
    case 'volume':
      // 保留volume
      frames = frames.filter(item => item.volume !== undefined);
      break;
    default:
      // frames = [];
      break;
  }

  if (effectFrameFields.includes(props.keyFrameName)) {
    frames = frames.filter(item => item[props.keyFrameName] !== undefined);
  }

  const frame = frames.find(item => Math.abs(item.startTime - relativeTime) < 0.05);

  // console.log('frame', frames, frame, effectFrameFields, props.keyFrameName);

  const changeFrame = () => {
    if (frame) {
      // 删除keyframe
      console.log('删除keyframe', frame);
      // 先删除字段
      try {
        switch (props.keyFrameName) {
          case 'x_y':
            delete frame.x;
            delete frame.y;
            break;
          case 'width_height':
            delete frame.width;
            delete frame.height;
            break;
          case 'scale':
            delete frame.scale;
            break;
          case 'alpha':
            delete frame.alpha;
            break;
          case 'rotation':
            delete frame.rotation;
            break;
          case 'maskX_maskY':
            delete frame.maskX;
            delete frame.maskY;
            break;
          case 'maskWidth_maskHeight':
            delete frame.maskWidth;
            delete frame.maskHeight;
            break;
          case 'maskBlur':
            delete frame.maskBlur;
            break;
          case 'maskRotation':
            delete frame.maskRotation;
            break;
          case 'maskAlpha':
            delete frame.maskAlpha;
            break;
          case 'intensity':
            delete frame.intensity;
            break;
          case 'textScale':
            delete frame.textScale;
            break;
          // case 'textColor':
          //   delete frame.textColor;
          //   break;
          // case 'textBgColor':
          //   delete frame.textBgColor;
          //   break;
          // case 'textBorderColor':
          //   delete frame.textBorderColor;
          //   break;
          // case 'textGradientStops':
          //   delete frame.textGradientStops;
          //   break;
          case 'volume':
            delete frame.volume;
            break;
        }

        if (effectFrameFields.includes(props.keyFrameName)) {
          delete frame[props.keyFrameName];
        }
      } catch (error) {
        console.log('删除keyframe失败', error);
      }

      // 删除只剩下id和startTime的keyframe
      _remove(elementData.frames, d => {
        return Object.keys(d).length === 2;
      });
      editor.frameSelectedId = '';
    } else {
      // 插入新的关键帧
      const anime = editor.movie.updateKeyFrame(elementData, [props.keyFrameName]);
      editor.frameSelectedId = anime.id;
    }
    transaction(() => {
      editor.updateTimelineTools();
      editor.updateTimeline();
      editor.updateMovie();
      editor.updateOption();
    });
  };

  const goToPrevFrame = () => {
    if (frames.length === 0) return;
    const sortedFrames = [...frames].sort((a, b) => a.startTime - b.startTime);
    const currentIndex = sortedFrames.findIndex(f => Math.abs(f.startTime - relativeTime) < 0.05);
    if (currentIndex > 0) {
      const prevFrame = sortedFrames[currentIndex - 1];
      const absoluteTime = elementData.startTime + prevFrame.startTime;
      editor.currentTime = absoluteTime;
      editor.frameSelectedId = prevFrame.id;
      transaction(() => {
        editor.updateTimelineTools();
        editor.updateTimeline();
        editor.updateMovie();
        editor.updateOption();
      });
    }
  };

  const goToNextFrame = () => {
    if (frames.length === 0) return;
    const sortedFrames = [...frames].sort((a, b) => a.startTime - b.startTime);
    const currentIndex = sortedFrames.findIndex(f => Math.abs(f.startTime - relativeTime) < 0.05);
    if (currentIndex < sortedFrames.length - 1) {
      const nextFrame = sortedFrames[currentIndex + 1];
      const absoluteTime = elementData.startTime + nextFrame.startTime;
      editor.currentTime = absoluteTime;
      editor.frameSelectedId = nextFrame.id;
      transaction(() => {
        editor.updateTimelineTools();
        editor.updateTimeline();
        editor.updateMovie();
        editor.updateOption();
      });
    }
  };

  return (
    <span>
      <a className={styles.prev} onClick={goToPrevFrame}>
        <Left theme="outline" size="14" fill="var(--theme-icon)" />
      </a>
      <a onClick={changeFrame}>
        {!frame ? (
          <DiamondThree theme="outline" size="14" fill="var(--theme-icon)" />
        ) : (
          <DiamondThree theme="filled" size="14" fill="var(--theme-main)" />
        )}
      </a>
      <a className={styles.next} onClick={goToNextFrame}>
        <Right theme="outline" size="14" fill="var(--theme-icon)" />
      </a>
    </span>
  );
};

export default observer(KeyFrameDot);
