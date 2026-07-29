import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './styles.module.less';
import { Upload, Button, Toast, Spin, Space, InputNumber } from '@douyinfe/semi-ui';
import JSZip from 'jszip';
import { util } from '@utils/index';
import { language } from '@language/language';
import { uploadInfo } from '@utils/uploadInfo.es.js';
import { userService } from '@server/user.service';

type Props = {};

const VideoSplit = (props: Props) => {
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState('');
  const [frameURL, setFrameURL] = useState('');
  // const [stepFrameDraw, setStepFrameDraw] = useState(10);
  const [duration, setDuration] = useState(0);
  const [mouseX, setMouseX] = useState(-1);
  const [markers, setMarkers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameContainerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLImageElement>(null);
  const [paddingTime, setPaddingTime] = useState(0);

  const downCapture = async () => {
    if (markers.length === 0) {
      Toast.error('请先添加分割标记');
      return;
    }

    console.log('markers', markers);
    setProgress(0);
    setLoading(true);

    try {
      // 使用ffmpeg对视频进行裁剪
      const ffmpeg = (window as any)._ffmpegWASMInstance;
      while (!ffmpeg.loaded) {
        await util.sleep(1000);
      }

      // 开始
      ffmpeg.on('progress', ({ progress }: any) => {
        setProgress(progress);
      });
      await ffmpeg.writeFile('input.mp4', await util.fetchFile(url));

      // 根据 markers 计算时间节点并排序
      const times = markers
        .map(n => {
          const container = frameContainerRef.current;
          if (!container) return 0;
          const img = container.querySelector('img');
          if (!img) return 0;
          const imgWidth = img.scrollWidth;
          const percent = Math.min(Math.max(n / imgWidth, 0), 1);
          return percent * duration;
        })
        .sort((a, b) => a - b);

      console.log('分割时间点:', times);

      // 生成分割命令
      const segments = [];
      let startTime = 0;

      for (let i = 0; i <= times.length; i++) {
        const endTime = i < times.length ? times[i] : duration;
        const segmentDuration = endTime - startTime;

        if (segmentDuration > 0.1) {
          // 过滤掉太短的片段
          const outputFile = `segment_${i + 1}.mp4`;
          segments.push(outputFile);

          // 执行分割命令（使用copy参数快速分割，不重新编码）
          await ffmpeg.exec([
            '-ss',
            (startTime + (i === 0 ? 0 : paddingTime / 2)).toFixed(2),
            '-i',
            'input.mp4',
            '-t',
            (endTime - startTime - (i === times.length - 1 ? 0 : paddingTime / 2)).toFixed(2),
            '-c',
            'copy',
            '-y',
            outputFile,
          ]);

          startTime = endTime;
        }
      }

      console.log('分割完成，生成的片段:', segments);

      // 创建zip文件
      const zip = new JSZip();
      const videoFolder = zip.folder('video_segments');

      // 读取所有分割后的片段并添加到zip
      for (const segment of segments) {
        const data = await ffmpeg.readFile(segment);
        videoFolder.file(segment, data.buffer);

        // 清理临时文件
        ffmpeg.deleteFile(segment);
      }

      // 生成zip文件并下载
      const content = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(content);

      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = 'video_segments.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);

      // 清理临时文件
      ffmpeg.deleteFile('input.mp4');

      // 显示成功提示
      Toast.success(`视频已分割为 ${segments.length} 个片段，已打包成zip文件`);
    } catch (error) {
      console.error('分割视频失败:', error);
      Toast.error('分割视频失败');
    } finally {
      setLoading(false);
    }
  };

  const drawFrameImage = async (url: string) => {
    const info = await uploadInfo.getUploadBeforeData({
      url,
      type: 'video',
      uploadBase64: null,
    });
    console.log('info1', info);
    setDuration(info.duration);
    const res = (await uploadInfo.decoderVideoDrawFrameImage({
      url,
      aspectRatio: info.videoWidth / info.videoHeight,
      audioTrack: null,
      drawRectangle: false,
      stepFrameDraw: 10, // 每10帧绘制一次
      videoRotation: info.rotate ? 90 : 0,
      frameScale: 2,
      duration: info.duration,
      workerPath: '/assets/worker',
    })) as any;
    setFrameURL(res.url);
    console.log(res, 'res--------->');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!frameContainerRef.current) return;

    const container = frameContainerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left + container.scrollLeft;

    // 获取图片实际宽度
    const img = container.querySelector('img');
    if (img) {
      const imgWidth = img.scrollWidth;
      // 限制x坐标在图片宽度范围内
      const limitedX = Math.min(Math.max(x, 0), imgWidth);
      setMouseX(limitedX);

      // 计算当前时间点
      if (videoRef.current && duration > 0) {
        const percent = limitedX / imgWidth;
        const currentTime = percent * duration;
        videoRef.current.currentTime = currentTime;
      }
    }
  };

  const handleMouseLeave = () => {
    setMouseX(-1);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!frameContainerRef.current) return;

    const container = frameContainerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left + container.scrollLeft;

    // 获取图片实际宽度
    const img = container.querySelector('img');
    if (img) {
      const imgWidth = img.scrollWidth;
      // 限制x坐标在图片宽度范围内
      const limitedX = Math.min(Math.max(x, 0), imgWidth);
      setMarkers([...markers, limitedX]);
    }
  };

  const removeMarker = (index: number) => {
    setMarkers(markers.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (url) {
      drawFrameImage(url);
    }
  }, [url]);

  return (
    <Spin spinning={loading}>
      <div className={styles.zip} style={{ height: 'auto' }}>
        <Upload
          action="/"
          accept=".mp4"
          showUploadList={false}
          customRequest={() => {}}
          beforeUpload={obj => {
            setUrl(obj.file.url);
            return true;
          }}
          draggable={true}
          style={{ height: 200 }}
          dragMainText={language.val('mp4_upload_tip', { format: 'MP4' })}
          dragSubText={language.val('mp4_upload_sub_tip', { format: 'MP4' })}
        ></Upload>
        {url && (
          <div className={styles.videoBox}>
            <video ref={videoRef} style={{ height: 400 }} src={url} controls></video>
          </div>
        )}
        <div
          className={styles.videoFrames}
          ref={frameContainerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <img ref={frameRef} src={frameURL} alt="" />

          {/* 鼠标跟随竖线 */}
          {mouseX >= 0 && <div className={styles.mouseLine} style={{ left: `${mouseX}px` }} />}

          {/* 标记红线 */}
          {markers.map((x, index) => (
            <div key={index} className={styles.markerLine} style={{ left: `${x}px` }}>
              <div
                className={styles.markerDelete}
                onClick={e => {
                  e.stopPropagation();
                  removeMarker(index);
                }}
              >
                ×
              </div>
              <div
                className={styles.padding}
                style={{ width: (frameRef.current.width * paddingTime) / duration + 'px' }}
              ></div>
            </div>
          ))}
        </div>
        <div className={styles.markerBox}>
          <div className={styles.markerTime}>
            分割时间点：
            {frameRef.current &&
              duration &&
              markers
                .sort((a, b) => a - b)
                .map(x => `${((x / frameRef.current.width) * duration).toFixed(2)}秒`)
                .join('、')}
          </div>
          <Space>
            <InputNumber
              insetLabel="间隙"
              value={paddingTime}
              onChange={value => setPaddingTime(Number(value))}
              min={0}
              max={duration}
              style={{ width: 160 }}
              step={0.01}
              suffix="秒"
            />
            <Button onClick={downCapture} loading={loading}>
              开始分割
            </Button>
          </Space>
        </div>
      </div>
    </Spin>
  );
};

export default VideoSplit;
