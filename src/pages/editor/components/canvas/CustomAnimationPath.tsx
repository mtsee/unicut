import type { VideoElement } from 'video-core-sdk';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import styles from './customAnimationPath.module.less';
import Moveable from 'react-moveable';
import { useEffect, useRef } from 'react';
import { parseTransform, getSizeFromTarget } from './controlHelper';
import { utils } from 'video-core-sdk';
import { stores } from '@stores/index';

export interface IProps {
  scale: number;
}

function CustomAnimationPath(props: IProps) {
  const { editor } = stores;
  const { scale } = props;
  const moveableRef = useRef<any>();
  const { customAnimationId } = editor;
  // 获取选中元素 和 自定义动画
  const elementData = editor.getElementData() as VideoElement;
  //@ts-ignore
  const customAnimation = elementData.animates.find(d => d.type === 'custom');
  const selectFrame = customAnimation.frames.find(d => d.id === customAnimationId);

  console.log('customAnimation', customAnimation);

  const { x, y, width, height } = elementData.style;
  const startRotation = elementData.style.rotation || 0;

  editor.customAnimationPathUpdateKey;

  useEffect(() => {
    editor.movie.updateControl('stopGroupDrag', true);
    editor.movie.updateControl('visible', {
      visible: false,
      elementId: elementData.id,
    });
    return () => {
      editor.movie.updateControl('stopGroupDrag', false);
      editor.movie.updateControl('visible', {
        visible: true,
        elementId: elementData.id,
      });
    };
  }, []);

  return (
    <div className={styles.customAnimation}>
      {customAnimation.frames.map((d, i) => {
        const {
          scaleX = 1,
          scaleY = 1,
          skewX = 0,
          skewY = 0,
          translateX = 0,
          translateY = 0,
          rotation = 0,
        } = d.transform;
        return (
          <span
            key={d.id}
            className={classNames('customAnimationFrame_' + d.id, styles.frame, {
              [styles.activeFrame]: customAnimationId === d.id,
            })}
            onClick={() => {
              editor.setSelectedElementIds([elementData.id]);
              editor.setCustomAnimationId(d.id);
            }}
            onMouseDown={() => {
              // moveableRef.current
            }}
            style={{
              zIndex: i,
              left: (x - (width * scaleX) / 2) * scale,
              top: (y - (height * scaleY) / 2) * scale,
              width: width * scale * scaleX,
              height: height * scale * scaleY,
              borderWidth: 1,
              transform: `rotate(${startRotation + rotation}deg) translate(${translateX * scale}px, ${
                translateY * scale
              }px) skew(${skewX}deg, ${skewY}deg)`,
            }}
          >
            {d.id}
          </span>
        );
      })}
      <Moveable
        ref={moveableRef}
        target={'.customAnimationFrame_' + customAnimationId}
        // stopPropagation={true}
        // preventDefault={true}
        keepRatio={true}
        draggable={true}
        scalable={true}
        rotatable={true}
        pinchable={true}
        pinchOutside={true}
        onRender={e => {
          e.target.style.transform = e.transform;
        }}
        onRenderEnd={e => {
          // const { left, top, width, height } = getSizeFromTarget(e.target as any);
          const size = getSizeFromTarget(e.target as any);
          // const { translatex, translatey, rotate } = parseTransform(e.target.style.transform);
          const transform = parseTransform(e.target.style.transform);

          console.log(transform, size);

          // 修改frame的transform参数
          selectFrame.transform.translateX = transform.translatex / scale;
          selectFrame.transform.translateY = transform.translatey / scale;
          selectFrame.transform.scaleX = transform.scalex * selectFrame.transform.scaleX;
          selectFrame.transform.scaleY = transform.scaley * selectFrame.transform.scaleY;
          selectFrame.transform.rotation = transform.rotate;

          // 更新视图
          elementData._animationDirty = utils.createID();
          editor.updateMovie();
        }}
      />
    </div>
  );
}

export default observer(CustomAnimationPath);
