import lottie from 'lottie-web';
import { useEffect, useRef, useState } from 'react';
import { Slider, Button } from '@douyinfe/semi-ui';
import { server } from '../../../server';
import { util } from '@utils/index';
import fetchLottie from './fetchLottie';

export interface IProps {
  url: string;
  setValues: (data: { thumb: string; width: string; height: string; totalFrames: number; frameRate: number }) => void;
}

const Lottie = ({ url, setValues }: IProps) => {
  const ref = useRef();
  const lottieRef = useRef<any>();
  const [frame, setFrame] = useState<any>(0);
  const [size, setSize] = useState([200, 200]);
  const maxWidth = 300;
  const [width, setWidth] = useState(maxWidth);

  useEffect(() => {
    let lot: any = null;
    fetchLottie(url).then((res: any) => {
      console.log('res', res);
      lottieRef.current = lottie.loadAnimation({
        container: ref.current,
        renderer: 'canvas', // 或 'canvas'
        loop: true,
        autoplay: false,
        animationData: res,
      });
      let asp = Math.min(1, maxWidth / res.w);
      lottieRef.current.goToAndStop(0);
      setSize([~~(res.w * asp), ~~(res.h * asp)]);
      lottieRef.current.resize(~~(res.w * asp), ~~(res.h * asp));
    });

    return () => {
      lottieRef.current?.destroy();
    };
  }, []);

  // 截图
  const screenshot = async () => {
    const [res] = await server.uploadBase64({
      content: lottieRef.current.container.toDataURL('image/png'),
      name: util.randomID() + '.png',
    });
    setValues({
      thumb: res.storage_path,
      width: lottieRef.current.animationData.w,
      height: lottieRef.current.animationData.h,
      totalFrames: lottieRef.current.totalFrames,
      frameRate: lottieRef.current.frameRate,
    });
  };

  useEffect(() => {
    if (lottieRef.current) {
      const rote = size[0] / size[1];
      setSize([width, width / rote]);
      lottieRef.current.resize(width, width / rote);
    }
  }, [width]);

  return (
    <>
      <div ref={ref} style={{ width: size[0], height: size[1] }}></div>
      <Slider
        value={frame}
        onChange={(v: number) => {
          setFrame(v);
          lottieRef.current.goToAndStop(v * 30);
        }}
      />
      <div>
        大小：
        <Slider
          min={100}
          max={300}
          value={width}
          onChange={(v: number) => {
            setWidth(v);
          }}
        />
      </div>
      <Button onClick={screenshot}>截图</Button>
    </>
  );
};

export default Lottie;
