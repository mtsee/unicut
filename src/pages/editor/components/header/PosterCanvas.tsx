import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import styles from './poster.module.less';
import { Movie } from 'video-core-sdk';
import { config } from '@config/index';
import { util } from '@utils/index';
import { Slider } from '@douyinfe/semi-ui';
import { stores } from '@stores/index';

type Props = {};

const PosterCanvas = forwardRef((props: Props, ref) => {
  const { editor } = stores;
  const movieRef = useRef(null);
  const [target, setTarget] = useState<any>();
  const [currentTime, setCurrentTime] = useState(0);
  const [data, setData] = useState(editor.data ? util.toJS(editor.data) : null);
  const [scale, setScale] = useState((window.innerHeight - 96 - 86) / data.height);

  const totalTime = editor.movie?.getTotalTime() || 0;

  useImperativeHandle(ref, () => ({
    capture: async () => {
      //   console.log('子组件执行 focus 操作', movieRef.current.capture());
      const base64 = movieRef.current.capture();
      const [ires] = await editor.apiServer.uploadBase64({
        content: base64,
        name: util.randomID() + '.png',
      });
      return ires.storage_path;
    },
  }));

  useEffect(() => {
    setTarget(document.getElementById('h5dsCanvasPoster'));

    function handleResize() {
      setScale((window.innerHeight - 96 - 86) / data.height);
    }
    // 监听窗口变化事件
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!data) return null;

  return (
    <div className={styles.canvas}>
      <div className={styles.preview}>
        <div className={styles.movie}>
          <div id="h5dsCanvasPoster">
            <Movie
              scale={scale}
              movieId={'posterMovie'}
              ref={(c: any) => {
                movieRef.current = c;
              }}
              target={target}
              resourceHost={editor.resourcesHost}
              fetchSourceBeforeRender={false}
              data={data}
              plugins={editor.pluginsConfig}
              env={'preview'}
              EModuleEffectSourcePath={config.EModuleEffectSourcePath}
              registerId="H5DS_VIDEO_@#PxAz"
              workerPath={config.workerPath + '/decode.worker.js'}
              currentTime={currentTime}
              triggerCurrentTime={(t: number) => {
                setCurrentTime(t);
              }}
              callback={() => {}}
            />
          </div>
          <div className={styles.control}>
            <Slider
              max={totalTime}
              step={0.01}
              value={currentTime}
              onChange={(t: number) => {
                setCurrentTime(t);
                console.log('movieRef.current', movieRef.current);
                movieRef.current.triggerCurrentTime(t);
              }}
            ></Slider>
          </div>
        </div>
      </div>
      {/* <div className={styles.options + ' scroll'}></div> */}
    </div>
  );
});

export default PosterCanvas;
