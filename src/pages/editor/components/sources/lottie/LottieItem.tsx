import styles from './lottie.module.less';
import lottie from 'lottie-web';
import { useEffect, useRef, useState } from 'react';
import { fetchLottie } from 'video-core-sdk';
import { util } from '@utils/index';
import { stores } from '@stores/index';

export interface IProps {
  item: object;
}

export default function LottieItem(props: IProps) {
  const { editor } = stores;
  const { urls, attrs } = props.item as any;
  const [show, setShow] = useState(false);

  return (
    <div
      onMouseEnter={() => {
        setShow(true);
      }}
      onMouseLeave={() => {
        setShow(false);
      }}
      className={styles.span}
    >
      {show ? <LottieEl url={editor.movie.reURL(urls.url)} /> : <img src={editor.movie.reURL(urls.thumb)} alt="" />}
    </div>
  );
}

function LottieEl(props) {
  const url = props.url;
  const ref = useRef();
  const lottieRef = useRef<any>();

  useEffect(() => {
    fetchLottie(url).then(res => {
      lottieRef.current = lottie.loadAnimation({
        container: ref.current,
        renderer: 'svg', // 或 'canvas'
        loop: true,
        autoplay: true,
        animationData: res,
      });
      // lottieRef.current.resize(200, 200);
      //@ts-ignore
      lottieRef.current.resize(res.w, res.h);
    });

    return () => {
      lottieRef.current?.destroy();
    };
  }, []);

  return <div ref={ref} className={styles.itemCanvas} style={{ width: '100%', height: '100%' }}></div>;
}
