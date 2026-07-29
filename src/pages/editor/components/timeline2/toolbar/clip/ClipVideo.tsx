import React, { useEffect, useRef, useState } from 'react';
import styles from './clipvideo.module.less';
import { Play, PauseOne } from '@icon-park/react';
import { theme } from '@theme';
import { util } from '@utils/index';
import { stores } from '@stores/index';

type Props = {
  poster: string;
  src: string; // 视频时长
  clipTime: number; // 裁剪开始的时间
  duration: number; // 裁剪的时长
};

const ClipVideo = (props: Props) => {
  const videoRef = useRef<HTMLVideoElement>();
  const canvasRef = useRef<HTMLCanvasElement>();
  const boxRef = useRef<HTMLDivElement>();
  const [playing, setPlaying] = useState(false);
  const editor = stores.editor;

  useEffect(() => {
    let req = null;
    const video = videoRef.current;
    video.currentTime = props.clipTime;
    // 只播放裁剪区间的画面
    const timeupdateFun = () => {
      // console.log('----------->currentTime', util.toNum(video.currentTime, 2));
      // console.log('----------->duration+clipTime', util.toNum(props.duration + props.clipTime, 2));
      // console.log('----------->clipTime', util.toNum(props.clipTime, 2));
      if (
        util.toNum(video.currentTime, 2) > util.toNum(props.duration + props.clipTime, 2) ||
        util.toNum(video.currentTime, 2) < util.toNum(props.clipTime, 2)
      ) {
        // 将视频播放位置重置到指定片段的开始时间
        video.currentTime = props.clipTime;
      }
    };
    video.addEventListener('timeupdate', timeupdateFun);

    // 绘制到画布
    const canplayFun = () => {
      const scale = Math.max(
        video.videoWidth / boxRef.current.clientWidth,
        video.videoHeight / boxRef.current.clientHeight,
      );
      canvasRef.current.width = video.videoWidth / scale;
      canvasRef.current.height = video.videoHeight / scale;
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      img.src = props.poster;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      };
      // 定义绘制函数
      function draw() {
        // 将 video 的当前帧绘制到 canvas 上
        ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
        // 请求下一帧动画
        req = requestAnimationFrame(draw);
      }

      // 开始绘制
      draw();
    };
    video.addEventListener('canplay', canplayFun);

    editor.clipVideo = video;

    return () => {
      video.removeEventListener('timeupdate', timeupdateFun);
      video.removeEventListener('canplay', canplayFun);
      if (req) {
        cancelAnimationFrame(req);
        req = null;
      }
    };
  }, [props.duration, props.clipTime]);

  return (
    <div className={styles.clipvideo} ref={boxRef}>
      <a
        onClick={() => {
          if (videoRef.current.paused) {
            videoRef.current.play();
            setPlaying(true);
          } else {
            videoRef.current.pause();
            setPlaying(false);
          }
        }}
        className={styles.play}
      >
        {playing ? (
          <PauseOne theme="filled" size="40" fill={theme.findColor('--theme-main')} strokeWidth={3} />
        ) : (
          <Play theme="filled" size="40" fill={theme.findColor('--theme-main')} strokeWidth={3} />
        )}
      </a>
      <canvas ref={canvasRef} />
      <video loop poster={props.poster} ref={videoRef} src={props.src} />
    </div>
  );
};

export default ClipVideo;
