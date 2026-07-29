import { type BaseElement, type PixiElementProps, type Env, utils } from 'video-core-sdk';
import { useMemo, useEffect, useRef, useReducer, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import QRCode from 'qrcode';
import { plugin } from '@pages/editor/SDK';
import { QrcodeElement } from './ElementData';
import { debounce } from 'lodash';

const { Animate, ControlElment, useSyncPixiElement } = plugin;

function QrcodeEl(props: PixiElementProps) {
  const { visible, env, trackIndex, relativeTime } = props;
  const element = props.element as QrcodeElement;
  // const [, forceUpdate] = useReducer(x => x + 1, 0);
  const store = props.store;
  const animateRef = useRef();
  const cav = useRef<HTMLCanvasElement>();

  // 绘制二维码
  const drawQrcode = (ctx, elem) => {
    // 处理组件中异步问题，当渲染的时候会等renderAsyncMark[elementId] 变为 'success'才会继续执行
    store.renderAsyncMark[element.id] = 'start';
    // 生成二维码
    QRCode.toDataURL(
      elem.text,
      {
        errorCorrectionLevel: elem.correctLevel,
        type: 'image/png',
        quality: 1,
        width: elem.style.width,
        height: elem.style.height,
        color: {
          dark: elem.colorDark,
          light: elem.colorLight,
        },
      },
      (err, base64 = '') => {
        if (!base64) return;
        // 二维码创建成功后，使用图片当新的纹理
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const sprite = pixiElem.children.find(d => d.name === 'element') as PIXI.Sprite;
          ctx.drawImage(img, 0, 0);
          sprite.texture.update();
          syncPixiStyle({ ...elem.style }, pixiElem);
          store.renderAsyncMark[elem.id] = 'success';
        };
        img.src = base64;
      },
    );
  };

  // 创建pixi元素
  const pixiElem = useMemo<PIXI.Container>(() => {
    const container = new PIXI.Container();

    // 默认使用一个空白的图片当纹理创建一个图片元素
    cav.current = document.createElement('canvas');
    cav.current.width = element.style.width;
    cav.current.height = element.style.height;
    drawQrcode(cav.current.getContext('2d'), element);
    const texture = PIXI.Texture.from(cav.current);
    const sprite = new PIXI.Sprite(texture);

    // useSyncPixiElement 会使用到 name
    sprite.name = 'element';
    container.addChild(sprite);
    return container;
  }, [trackIndex]);

  const updateDataDebounce = useCallback(
    debounce(elem => {
      drawQrcode(cav.current.getContext('2d'), elem);
    }, 300),
    [],
  );

  // 设置大小
  useEffect(
    () => updateDataDebounce(element),
    [
      element.text,
      element.style.width,
      element.style.height,
      element.colorDark,
      element.colorLight,
      element.correctLevel,
    ],
  );

  /**
   * 数据和pixi元素进行绑定，这部分代码可以直接复制使用，通常情况下不会变化
   * syncPixiStyle是一个同步元素数据和Pixi元素样式的方法，一般不会用到，具体使用方法： syncPixiStyle({ ...element.style }, pixiElem);
   */
  const [syncPixiStyle] = useSyncPixiElement(
    pixiElem,
    {
      style: { ...element.style! },
      parent: props.parent!,
      animateRef,
      visible,
      hide: props.hide,
      lock: props.lock,
      relativeTime: props.relativeTime,
      store: props.store,
    },
    ['x', 'y', 'width', 'height', 'alpha', 'rotation'],
    element,
  );

  return (
    <>
      {env === 'editor' && (
        <ControlElment
          trackIndex={trackIndex}
          hide={props.hide}
          lock={props.lock}
          scale={props.scale}
          store={props.store}
          element={element}
          visible={visible}
        />
      )}
      <Animate
        ref={animateRef}
        store={props.store}
        pixiElem={pixiElem}
        elementData={element}
        currentTime={props.currentTime}
        relativeTime={props.relativeTime}
      />
    </>
  );
}

export default QrcodeEl;
