import { theme } from '@theme';
import React, { useEffect, useRef, useState } from 'react';

type Props = {
  src: string;
  name: string;
};

const FontImage = (props: Props) => {
  const imgRef = useRef<any>();
  const [hasImg, setHasImg] = useState(true);

  useEffect(() => {
    imgRef.current.addEventListener('error', err => {
      setHasImg(false);
    });

    // 回调函数：当图片进入视口时加载图片
    const lazyLoad = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src; // 将 data-src 的值赋给 src
          img.removeAttribute('data-src'); // 移除 data-src 属性
          observer.unobserve(img); // 停止观察该图片
        }
      });
    };

    const observer = new IntersectionObserver(lazyLoad, {
      root: null, // 使用视口作为根元素
      rootMargin: '0px', // 提前加载的边距
      threshold: 0.1, // 当图片 10% 进入视口时触发
    });

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  return (
    <>
      <img
        ref={imgRef}
        style={{ maxWidth: 200, filter: theme.getTheme() === 'dark' ? 'invert(100%)' : '' }}
        height={20}
        data-src={props.src}
      />
      {!hasImg && <span>{props.name.substring(0, 18)}</span>}
    </>
  );
};

export default FontImage;
