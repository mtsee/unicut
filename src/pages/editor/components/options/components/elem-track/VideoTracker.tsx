import { useState, useRef, useEffect, useCallback } from 'react';
import { RectTrack, ProgressData } from './RectTrack';
import parseAPNG from 'apng-js';
import styles from './VideoTracker.module.less';
import { Toast } from '@douyinfe/semi-ui';

interface VideoTrackerProps {
  url: string;
  onResult?: (data: ProgressData[]) => void;
  width?: number;
  height?: number;
  type?: 'video' | 'png';
  startFrameDuration?: number;
  playFrameDuration?: number;
  imageSpeed?: number;
}

interface Point {
  x: number;
  y: number;
}

interface Roi {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function VideoTracker({
  url,
  onResult,
  width = 600,
  height = 600,
  type = 'video',
  imageSpeed = 1,
  startFrameDuration = 0,
  playFrameDuration = 0,
}: VideoTrackerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [roi, setRoi] = useState<Roi | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [curW, setCurW] = useState(0);
  const [curH, setCurH] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<ProgressData[] | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const trackerRef = useRef<RectTrack | null>(null);
  const apngFramesRef = useRef<ImageData[] | null>(null);
  const apngCurrentFrameRef = useRef(0);
  const apngTotalFramesRef = useRef(0);
  const apngIsPlayingRef = useRef(false);
  const apngDelayFrameRef = useRef(0);

  const log = useCallback((msg: string) => {
    setLogs(prev => [...prev, msg]);
  }, []);

  const blobToImageData = (blob: Blob): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        URL.revokeObjectURL(img.src);
        resolve(imageData);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  const loadAPNG = useCallback(
    async (source: ArrayBuffer) => {
      try {
        const apng = parseAPNG(source);
        if (apng instanceof Error) {
          log('不是APNG图片，不支持追踪');
          return;
        }

        const srcW = apng.width;
        const srcH = apng.height;

        const frameCanvas = document.createElement('canvas');
        const frameCtx = frameCanvas.getContext('2d', {
          willReadFrequently: true,
        })!;
        frameCanvas.width = srcW;
        frameCanvas.height = srcH;

        const outCanvas = document.createElement('canvas');
        const outCtx = outCanvas.getContext('2d', {
          willReadFrequently: true,
        })!;
        outCanvas.width = width;
        outCanvas.height = height;

        let prevF: any = null;
        const patchCanvas = document.createElement('canvas');
        const patchContext = patchCanvas.getContext('2d')!;
        patchContext.clearRect(0, 0, srcW, srcH);

        const frames: ImageData[] = [];
        for (let i = 0; i < apng.frames.length; i++) {
          const frame = apng.frames[i];
          if (!frame) return;

          patchCanvas.width = frame.width;
          patchCanvas.height = frame.height;
          const frameImageData = await blobToImageData(frame.imageData as Blob);
          patchContext.putImageData(frameImageData, 0, 0);
          //@ts-ignore
          frame.img = outCanvas;
          //@ts-ignore
          frame.img = patchCanvas;

          if (i === 0) {
            frameCtx.clearRect(0, 0, srcW, srcH);
            prevF = null;
            if (frame.disposeOp === 2) frame.disposeOp = 1;
          }

          if (prevF && prevF.disposeOp === 1) {
            frameCtx.clearRect(prevF.left, prevF.top, prevF.width, prevF.height);
          } else if (prevF && prevF.disposeOp === 2) {
            if (prevF.iData) {
              frameCtx.putImageData(prevF.iData, prevF.left, prevF.top);
            }
          }

          prevF = frame;
          prevF.iData = null;
          if (prevF.disposeOp === 2) {
            prevF.iData = frameCtx.getImageData(frame.left, frame.top, frame.width, frame.height);
          }

          if (frame.blendOp === 0) {
            frameCtx.clearRect(frame.left, frame.top, frame.width, frame.height);
          }

          //@ts-ignore
          frameCtx.drawImage(frame.img, frame.left, frame.top);

          outCtx.clearRect(0, 0, width, height);
          outCtx.drawImage(frameCanvas, 0, 0, srcW, srcH, 0, 0, width, height);
          frames.push(outCtx.getImageData(0, 0, width, height));
        }

        apngFramesRef.current = frames;
        apngTotalFramesRef.current = frames.length;
        apngDelayFrameRef.current = apng.playTime / 1000 / frames.length;
        apngCurrentFrameRef.current = Math.round(startFrameDuration / apngDelayFrameRef.current);

        console.log(
          'apngCurrentFrameRef.current',
          startFrameDuration / apngDelayFrameRef.current,
          apngCurrentFrameRef.current,
        );

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d')!;
          ctx.putImageData(frames[apngCurrentFrameRef.current], 0, 0);
        }

        log(`APNG 加载完成（${srcW}x${srcH}），共 ${frames.length} 帧，请框选追踪区域`);
      } catch (err) {
        log('APNG 加载失败：' + (err as Error).message);
      }
    },
    [log, width, height],
  );

  const handleVideoLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, []);

  const handleVideoSeeked = useCallback(() => {
    drawVideoFrame();
    log(`视频加载完成（${width}x${height}），请在画面中框选【头部区域】`);
  }, [width, height, log]);

  const drawVideoFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);

    if (apngFramesRef.current && apngFramesRef.current.length > 0) {
      const frame = apngFramesRef.current[apngCurrentFrameRef.current] || apngFramesRef.current[0];
      ctx.putImageData(frame, 0, 0);
      return;
    }

    if (videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
    }
  }, [width, height]);

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!videoRef.current?.src && (!apngFramesRef.current || apngFramesRef.current.length === 0)) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const sx = width / rect.width;
      const sy = height / rect.height;
      setStartPoint({
        x: (e.clientX - rect.left) * sx,
        y: (e.clientY - rect.top) * sy,
      });
      setIsSelecting(true);
    },
    [width, height],
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isSelecting || !startPoint) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const sx = width / rect.width;
      const sy = height / rect.height;
      const cur: Point = {
        x: (e.clientX - rect.left) * sx,
        y: (e.clientY - rect.top) * sy,
      };

      setCurW(cur.x - startPoint.x);
      setCurH(cur.y - startPoint.y);

      drawVideoFrame();

      const ctx = canvas.getContext('2d')!;
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(startPoint.x, startPoint.y, cur.x - startPoint.x, cur.y - startPoint.y);

      const cx = startPoint.x + (cur.x - startPoint.x) / 2;
      const cy = startPoint.y + (cur.y - startPoint.y) / 2;
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    [isSelecting, startPoint, width, height, drawVideoFrame],
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (!isSelecting || !startPoint) return;
    setIsSelecting(false);

    const newRoi: Roi = {
      x: Math.min(startPoint.x, startPoint.x + curW),
      y: Math.min(startPoint.y, startPoint.y + curH),
      width: Math.abs(curW),
      height: Math.abs(curH),
    };
    setRoi(newRoi);
    log(
      `已框选头部区域：x=${newRoi.x.toFixed(1)}, y=${newRoi.y.toFixed(1)}, w=${newRoi.width.toFixed(1)}, h=${newRoi.height.toFixed(1)}`,
    );
  }, [isSelecting, startPoint, curW, curH, log]);

  const onAPNGFrame = useCallback(() => {
    if (!trackerRef.current || !apngIsPlayingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    console.log('apngCurrentFrameRef.current----->', apngCurrentFrameRef.current);

    const ctx = canvas.getContext('2d')!;
    const frame = apngFramesRef.current?.[apngCurrentFrameRef.current];
    if (frame) {
      ctx.putImageData(frame, 0, 0);
    }

    const mediaTime = apngCurrentFrameRef.current * apngDelayFrameRef.current;
    trackerRef.current.stepTrack(mediaTime - startFrameDuration);

    apngCurrentFrameRef.current += imageSpeed;
    apngCurrentFrameRef.current = Math.round(apngCurrentFrameRef.current);
    const max = Math.max(apngTotalFramesRef.current, playFrameDuration / apngDelayFrameRef.current);
    if (apngCurrentFrameRef.current >= max) {
      apngIsPlayingRef.current = false;
      trackerRef.current.stop();
      trackerRef.current = null;
      setIsTracking(false);
      log('=== APNG 播放结束，追踪自动停止 ===');
      return;
    }

    setTimeout(onAPNGFrame, apngDelayFrameRef.current * 1000);
  }, [log]);

  const scheduleNextFrame = useCallback(() => {
    if (!trackerRef.current) return;

    if (apngFramesRef.current && apngFramesRef.current.length > 0 && apngIsPlayingRef.current) {
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (typeof video.requestVideoFrameCallback === 'function') {
      video.requestVideoFrameCallback(onVideoFrame);
    } else {
      requestAnimationFrame(() => onVideoFrame(performance.now(), { mediaTime: video.currentTime }));
    }
  }, []);

  const onVideoFrame = useCallback(
    (now: number, metadata: { mediaTime: number }) => {
      if (!trackerRef.current) {
        scheduleNextFrame();
        return;
      }

      if (apngFramesRef.current && apngFramesRef.current.length > 0 && apngIsPlayingRef.current) {
        return;
      }

      drawVideoFrame();
      trackerRef.current.stepTrack(metadata.mediaTime);
      scheduleNextFrame();
    },
    [drawVideoFrame, scheduleNextFrame],
  );

  const handleStartTrack = useCallback(() => {
    if (!roi) {
      alert('请先框选头部区域！');
      return;
    }
    if (!videoRef.current?.src && (!apngFramesRef.current || apngFramesRef.current.length === 0)) {
      alert('请先加载媒体！');
      return;
    }

    let duration = videoRef.current?.duration || 1;
    if (apngFramesRef.current && apngFramesRef.current.length > 0) {
      duration = apngTotalFramesRef.current * apngDelayFrameRef.current;
      // 开始帧
      apngCurrentFrameRef.current = Math.round(startFrameDuration * apngDelayFrameRef.current);
      apngIsPlayingRef.current = true;
    }

    console.log('开始帧', apngCurrentFrameRef.current);

    const canvas = canvasRef.current;
    if (!canvas) return;

    trackerRef.current = new RectTrack({
      canvas: canvas,
      roi: roi,
      duration: duration,
      width: width,
      height: height,
    });

    trackerRef.current.on('progress', (data: ProgressData) => {
      if (data.error) {
        log(`${data.time}s → ${data.error}`);
      } else {
        log(
          `${data.time}s → 中心(${data.cx},${data.cy}) 角度 ${data.angle}° 特征点 ${data.pts} 进度 ${data.progress.toFixed(1)}%`,
        );
      }
    });

    trackerRef.current.on('end', (resultData: ProgressData[]) => {
      console.log(resultData);
      setResult(resultData);
      setIsTracking(false);
      if (onResult) {
        onResult(resultData);
      }
      log(`=== 追踪结束，共 ${resultData.length} 帧 ===`);
    });

    trackerRef.current.start();
    setIsTracking(true);

    if (apngFramesRef.current && apngFramesRef.current.length > 0) {
      apngCurrentFrameRef.current = Math.round(startFrameDuration / apngDelayFrameRef.current);
      onAPNGFrame();
    } else if (videoRef.current?.src) {
      videoRef.current.play();
      scheduleNextFrame();
    }

    log('=== 开始跟踪 ===');
  }, [roi, width, height, log, onAPNGFrame, scheduleNextFrame, onResult]);

  const handleStopTrack = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.stop();
      trackerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    apngIsPlayingRef.current = false;
    setIsTracking(false);
    log('=== 跟踪已停止 ===');
  }, [log]);

  const randomID = (randomLength: number = 8): string => {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36);
  };

  const exportResult = useCallback(async () => {
    console.log(result);
    if (!result) return;
    const frames = result.map(d => ({
      id: randomID(),
      startTime: Number(d.time) / imageSpeed,
      x: Number(d.cx),
      y: Number(d.cy),
      rotation: -(Number(d.angle) * Math.PI) / 180,
    }));
    try {
      await navigator.clipboard.writeText(JSON.stringify(frames, null, 2));
      Toast.success('轨迹数据已复制到剪贴板');
    } catch (err) {
      // log('复制失败：' + (err as Error).message);
      Toast.error('复制失败');
    }
  }, [result, log]);

  useEffect(() => {
    if (!url) return;

    if (type === 'png') {
      fetch(url)
        .then(response => response.arrayBuffer())
        .then(source => loadAPNG(source))
        .catch(err => log('APNG 加载失败：' + (err as Error).message));
    } else {
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.load();
      }
    }
  }, [url, loadAPNG, log, type]);

  return (
    <div className={styles.videoTracker}>
      <div className={styles.tools}>
        <button onClick={handleStartTrack} disabled={isTracking}>
          {isTracking ? '追踪中...' : '开始追踪'}
        </button>
        <button onClick={handleStopTrack}>停止追踪</button>
        <button onClick={exportResult} disabled={!result}>
          复制轨迹数据
        </button>
      </div>

      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>

      <h4>实时轨迹日志（时间/坐标）</h4>
      <div className={styles.logBox}>
        {logs.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>

      <video
        ref={videoRef}
        style={{ display: 'none' }}
        crossOrigin="anonymous"
        muted
        loop={false}
        onLoadedMetadata={handleVideoLoadedMetadata}
        onSeeked={handleVideoSeeked}
        onEnded={() => {
          if (trackerRef.current) {
            trackerRef.current.stop();
            trackerRef.current = null;
            setIsTracking(false);
            log('=== 视频播放结束，追踪自动停止 ===');
          }
        }}
      />
    </div>
  );
}
