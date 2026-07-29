// 帧图绘制
import React, { useEffect, useRef, useState } from 'react';
import styles from './clipvideo.module.less';
import { Leafer, Frame, Canvas, DragEvent } from 'leafer-ui';
import { util } from '@utils/index';
import { stores } from '@stores/index';

type Props = {
  frameImage: string; // 帧图
  thumb: string; // 封面图
  clipStart: number; // 裁剪开始的时间
  clipTime: number; // 裁剪的时长
  duration: number; // 视频原始长度
  aspectRatio: number; // 视频的宽高比
  callback: (t: number) => void;
};

const ClipFrame = (props: Props) => {
  const editor = stores.editor;
  const boxRef = useRef<any>();
  const frameRef = useRef<Frame>();
  const { clipStart, thumb, clipTime, frameImage, duration, aspectRatio } = props;
  const padding = 40;
  const canvasWidth = 926;
  const frameHeight = 60;
  const [ctime, setCTime] = useState(0);
  const leaferRef = useRef<any>();

  // console.log('ctime', ctime);

  useEffect(() => {
    let animationId = null;
    const createFrameImage = () => {
      const leafer = new Leafer({ view: boxRef.current, fill: '#000' });
      /**
       * frame的宽度计算：裁剪实际区域宽度为 viewWidth = boxRef.current.clientWidth - padding * 2;
       * 对应的时间为：clipTime
       * 所以frame长度 = viewWidth / clipTime * duration
       * frameStartLeft = viewWidth / clipTime * clipStart
       */
      // 裁剪实际区域
      const viewWidth = canvasWidth - padding * 2;

      const timeWidth = viewWidth / clipTime; // 单位时间的宽度
      const frame = new Frame({
        width: timeWidth * duration,
        height: frameHeight,
        x: -(timeWidth * clipStart - padding),
        y: 0,
        // fill: '#000',
      });
      frameRef.current = frame;
      // setTimeout(() => {
      //   frame.x = timeWidth * clipStart + padding;
      // }, 300);
      leafer.add(frame);

      // 绘制帧图
      const frameWidth = frameHeight * aspectRatio;
      const drawNum = Math.ceil((timeWidth * duration) / frameWidth);
      const canvas = new Canvas({ width: drawNum * frameWidth, height: frameHeight });
      const { context: ctx } = canvas;
      console.log('drawNum', timeWidth, frameHeight, aspectRatio, frameImage);
      if (frameImage) {
        util.imgLazy(frameImage).then(_img => {
          // 单张帧图片的宽度
          const imgFrameWidth = _img.naturalWidth / Math.ceil(duration);
          for (let i = 0; i < drawNum + 1; i++) {
            let imageIndex = Math.floor((i / drawNum) * duration);
            ctx.drawImage(
              _img,
              imgFrameWidth * imageIndex,
              0,
              imgFrameWidth,
              _img.naturalHeight,
              i * frameWidth,
              0,
              frameWidth,
              frameHeight,
            );
          }
          frame.add(canvas);
        });
      } else {
        // 绘制封面图到帧图上
        util.imgLazy(thumb).then(_img => {
          // 单张帧图片的宽度
          const imgFrameWidth = _img.naturalWidth;
          for (let i = 0; i < drawNum + 1; i++) {
            let imageIndex = Math.floor((i / drawNum) * duration);
            ctx.drawImage(
              _img,
              0,
              0,
              imgFrameWidth,
              _img.naturalHeight,
              i * frameWidth,
              0,
              frameWidth,
              frameHeight,
            );
          }
          frame.add(canvas);
        });
      }
      dragFun();
      leafer.updateClientBounds();

      function dragFun() {
        // 范围区间，只能在这个区间
        const limit = [padding, timeWidth * duration - viewWidth - padding];

        // 初始化变量
        let startX = 0;
        let lastX = 0;
        let velocityX = 0;
        let isDragging = false;
        let lastTime = 0;

        // 衰减系数 (0.9~0.99 效果较自然)
        const decay = 0.95;
        // 最小速度阈值（停止动画）
        const minVelocity = 0.1;

        // 监听触摸事件
        frame.on(DragEvent.START, e => {
          isDragging = true;
          startX = e.x;
          lastX = startX;
          lastTime = Date.now();
          // 停止当前动画
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        });

        frame.on(DragEvent.DRAG, e => {
          if (!isDragging) return;
          const currentX = e.x;
          const currentTime = Date.now();
          const deltaTime = currentTime - lastTime;

          // 计算速度（基于时间差，避免帧率影响）
          if (deltaTime > 0) {
            velocityX = (currentX - lastX) / deltaTime;
            lastTime = currentTime;
          }

          // 实时更新位置
          frame.x += currentX - startX;
          if (frame.x > limit[0]) {
            frame.x = limit[0];
          }
          if (frame.x < -limit[1]) {
            frame.x = -limit[1];
          }
          startX = currentX;
          lastX = currentX;
        });

        frame.on(DragEvent.END, () => {
          isDragging = false;
          // 启动惯性动画
          animateInertia();
        });

        // 惯性动画函数
        function animateInertia() {
          const currentTime = Date.now();
          const deltaTime = currentTime - lastTime;
          lastTime = currentTime;

          // 应用速度衰减
          velocityX *= Math.pow(decay, deltaTime / 16); // 16ms 为基准帧时间

          // 更新位置
          frame.x += velocityX * deltaTime;
          if (frame.x > limit[0]) {
            frame.x = limit[0];
          }
          if (frame.x < -limit[1]) {
            frame.x = -limit[1];
          }

          // 判断是否继续动画
          if (Math.abs(velocityX) > minVelocity) {
            animationId = requestAnimationFrame(animateInertia);
          } else {
            const t = -(frame.x - padding) / timeWidth;
            editor.clipVideo.currentTime = t;
            props.callback(t);
            animationId = null;
          }
        }
      }
    };

    setTimeout(() => {
      createFrameImage();
    }, 600);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      leaferRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    let req = null;
    const run = () => {
      setCTime(editor.clipVideo.currentTime);
      req = requestAnimationFrame(run);
    };
    run();
    return () => {
      cancelAnimationFrame(req);
    };
  }, [clipStart]);

  // 使用canvas处理帧图
  return (
    <div className={styles.clipframe}>
      <div className={styles.lineBox}>
        <span className={styles.cliptime}>{clipTime.toFixed(2)}s</span>
        <span className={styles.line} style={{ left: ((ctime - clipStart) / clipTime) * 100 + '%' }}></span>
      </div>
      <div ref={boxRef} className={styles.canvas}></div>
    </div>
  );
};

export default ClipFrame;
