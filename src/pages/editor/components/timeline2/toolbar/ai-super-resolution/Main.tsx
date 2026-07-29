import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.less';
import { Upload, Progress, RadioGroup, Radio, Space, Spin, Button } from '@douyinfe/semi-ui';
import { util } from '@utils/index';
import * as utils from './utils';
import type { ImageElement, CameraElement } from 'video-core-sdk';
import { stores } from '@stores/index';
import { addImageVideoAudioItem } from '@pages/editor/components/sources/addItem';

type Props = {
  onCancel: any;
  onOk: any;
};

const AiSuperResolution = (props: Props) => {
  const { editor } = stores;
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState('');
  const [oldURL, setOldURL] = useState('');
  const [loading, setLoading] = useState(false);
  const blobURLRef = useRef<any>();
  const [resolution, setResolution] = useState(2);
  const [showOld, setShowOld] = useState(false);
  const [imgSize, setImageSize] = useState([0, 0]);
  const [loadingMode, setLoadMode] = useState(false);

  const run = useCallback(async obj => {
    setProgress(0);
    setUrl(obj.url);
    setOldURL(obj.url);
    setShowOld(false);

    console.log('run', obj.url);

    const image = new Image();
    image.src = editor.movie.reURL(obj.url);
    image.crossOrigin = 'anonymous';
    image.onload = async () => {
      try {
        setImageSize([image.width, image.height]);
        setLoadMode(true);
        await utils.loadModel();
        setLoadMode(false);
        const url = await utils.sessionRun(image, resolution, v => {
          setProgress(v);
        });
        setUrl(url);
        setTimeout(() => {
          setProgress(0);
          setShowOld(true);
          obj.callback();
        }, 1000);
      } catch (error) {
        console.error('推理失败:', error);
        obj.callback();
      } finally {
        console.log('over');
        obj.callback();
      }
    };
  }, []);

  useEffect(() => {
    const elementData = editor.getElementData() as ImageElement;
    const resource = editor.movie.resourceManage.getResouceById(elementData.resourceId);
    setUrl(editor.movie.reURL(resource.url));
    setOldURL(editor.movie.reURL(resource.url));

    const image = new Image();
    image.src = editor.movie.reURL(resource.url);
    image.crossOrigin = 'anonymous';
    image.onload = async () => {
      setImageSize([image.width, image.height]);
    };

    return () => {
      if (blobURLRef.current) {
        URL.revokeObjectURL(blobURLRef.current);
        blobURLRef.current = null;
      }
    };
  }, []);

  const [imgWidth, imgHeight] = imgSize;

  const previewWidth = 1000;
  const previewHeight = imgWidth ? (imgHeight / imgWidth) * previewWidth : previewWidth;

  // 获取当前时间节点的 camera 数据，计算矩形框位置（预览用 + 原始图裁剪用）
  const cameraRect = useMemo(() => {
    const cameras = editor.data.cameras;
    if (!cameras || cameras.length === 0) return null;

    const elementData = editor.getElementData() as ImageElement;
    if (!elementData) return null;

    const ct = editor.currentTime;
    const camera = cameras.find(c => ct >= c.startTime && ct <= c.startTime + c.duration);
    if (!camera || !imgWidth || !imgHeight) return null;

    const { width: cw, height: ch, x: cx, y: cy, rotation = 0 } = camera.style;
    const { x: imgX, y: imgY, width: imgW, height: imgH } = elementData.style;

    // 计算 camera 的包围盒尺寸和左上角（考虑旋转）
    let rectLeft, rectTop, rectW, rectH;
    if (rotation) {
      const rad = (rotation * Math.PI) / 180;
      const cosR = Math.abs(Math.cos(rad));
      const sinR = Math.abs(Math.sin(rad));
      rectW = cw * cosR + ch * sinR;
      rectH = cw * sinR + ch * cosR;
      rectLeft = cx - rectW / 2;
      rectTop = cy - rectH / 2;
    } else {
      rectLeft = cx - cw / 2;
      rectTop = cy - ch / 2;
      rectW = cw;
      rectH = ch;
    }

    // camera 和图片都相对于画布中心定位
    // 将 camera 包围盒坐标映射到图片上的相对位置，再转为预览图片的像素坐标
    const left = ((rectLeft - (imgX - imgW / 2)) / imgW) * previewWidth;
    const top = ((rectTop - (imgY - imgH / 2)) / imgH) * previewHeight;
    const width = (rectW / imgW) * previewWidth;
    const height = (rectH / imgH) * previewHeight;

    // 原始图片上的裁剪区域（像素坐标）
    const cropX = ((rectLeft - (imgX - imgW / 2)) / imgW) * imgWidth;
    const cropY = ((rectTop - (imgY - imgH / 2)) / imgH) * imgHeight;
    const cropW = (rectW / imgW) * imgWidth;
    const cropH = (rectH / imgH) * imgHeight;

    return {
      preview: { left, top, width, height },
      crop: { x: cropX, y: cropY, w: cropW, h: cropH },
    };
  }, [editor.currentTime, editor.data.cameras, imgWidth, imgHeight, previewHeight]);

  console.log('previewSize', previewWidth, previewHeight, imgWidth, imgHeight);

  // 区域变清晰：截取 camera 区域 → AI 超分 → 打印 base64
  const handleAreaEnhance = useCallback(async () => {
    if (!cameraRect) return;

    const { x: cropX, y: cropY, w: cropW, h: cropH } = cameraRect.crop;
    if (cropW <= 0 || cropH <= 0) return;

    const elementData = editor.getElementData() as ImageElement;
    const resource = editor.movie.resourceManage.getResouceById(elementData.resourceId);
    const src = editor.movie.reURL(resource.url);

    // 加载原图
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = src;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
    });

    // 截取 camera 区域
    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const cropBase64 = canvas.toDataURL('image/png');

    // 加载裁剪后的图片用于 AI 推理
    const cropImage = new Image();
    cropImage.src = cropBase64;

    await new Promise<void>((resolve, reject) => {
      cropImage.onload = () => resolve();
      cropImage.onerror = reject;
    });

    // AI 超分
    try {
      setLoadMode(true);
      await utils.loadModel();
      setLoadMode(false);

      const resultBase64 = await utils.sessionRun(cropImage, resolution, v => {
        setProgress(v);
      });

      setProgress(0);

      // 上传 base64 到服务器
      const [uploadRes] = await editor.apiServer.uploadBase64({
        content: resultBase64,
        name: util.randomID() + '.png',
      });
      if (!uploadRes?.storage_path) {
        console.error('上传失败');
        return;
      }

      // 获取当前 camera 数据
      const cameras = editor.data.cameras;
      const ct = editor.currentTime;
      const camera = cameras.find(c => ct >= c.startTime && ct <= c.startTime + c.duration);
      if (!camera) return;

      // 创建新图片元素，位置和大小与 camera 一致
      const newElem: any = await addImageVideoAudioItem(
        {
          type: 'image',
          from: 'user',
          name: 'AI清晰区域',
          urls: { url: uploadRes.storage_path, thumb: uploadRes.storage_path },
          attrs: {
            width: cropW * 4,
            height: cropH * 4,
            duration: elementData.duration || 5,
          },
        },
        elementData.startTime,
        elementData.trackIndex - 0.5,
      );

      if (newElem) {
        newElem.style.x = camera.style.x;
        newElem.style.y = camera.style.y;
        newElem.style.width = camera.style.width;
        newElem.style.height = camera.style.height;
        editor.updateMovie();
        editor.updateTimeline();
      }
      // 关闭弹窗
      props.onCancel();
      console.log('区域变清晰结果 base64:', resultBase64);
    } catch (error) {
      console.error('区域变清晰失败:', error);
      setLoadMode(false);
    }
  }, [cameraRect, resolution, editor]);

  if (imgWidth === 0 || imgHeight === 0) {
    return null;
  }

  return (
    <div className={styles.zip}>
      <div className={styles.title}>
        <h1>修改原图的清晰度，最大X4</h1>
      </div>
      <Spin tip="模型加载中..." spinning={loadingMode}>
        <div style={{ marginTop: 20 }}>
          <Progress percent={Number(progress.toFixed(2))} />
        </div>
      </Spin>
      <div className={styles.options}>
        <span style={{ color: '#ccc' }}>图片大小倍数：</span>
        <RadioGroup
          type="button"
          onChange={e => {
            setResolution(e.target.value);
          }}
          buttonSize="small"
          value={resolution}
          aria-label="图片大小"
          name="demo-radio-small"
        >
          <Radio value={1}>x1</Radio>
          <Radio value={2}>x2</Radio>
          <Radio value={3}>x3</Radio>
          <Radio value={4}>x4</Radio>
        </RadioGroup>
      </div>
      {/* <div className={styles.result}>{url && <img src={url} />}</div> */}
      {url && (
        <Space className={styles.download}>
          <Button
            style={{ height: 40 }}
            onClick={() => {
              setShowOld(!showOld);
            }}
          >
            {!showOld ? '切换新图' : '切换旧图'}
          </Button>
          <Button
            // theme="solid"
            loading={loading}
            style={{ height: 40 }}
            onClick={async () => {
              setLoading(true);
              const elementData = editor.getElementData() as ImageElement;
              const resource = editor.movie.resourceManage.getResouceById(elementData.resourceId);
              await run({
                url: editor.movie.reURL(resource.url),
                callback: () => {
                  setLoading(false);
                },
              });
            }}
          >
            开始转换
          </Button>
          <Button
            theme="solid"
            loading={loading}
            style={{ height: 40 }}
            onClick={async () => {
              setLoading(true);
              await props.onOk(url);
              setLoading(false);
            }}
          >
            确认
          </Button>
          <Button
            style={{ height: 40 }}
            disabled={!cameraRect}
            onClick={handleAreaEnhance}
          >
            区域变清晰
          </Button>
        </Space>
      )}
      <div className={styles.imageCompare}>
        <div className={styles.oldImage} style={{ position: 'relative' }}>
          <img
            src={oldURL}
            style={{ width: previewWidth, height: previewHeight }}
          />
          {cameraRect && (
            <div
              className={styles.cameraRect}
              style={{
                left: cameraRect.preview.left,
                top: cameraRect.preview.top,
                width: cameraRect.preview.width,
                height: cameraRect.preview.height,
              }}
            />
          )}
        </div>
        <div className={styles.newImage} style={{ width: showOld ? '100%' : '0%' }}>
          {/* <a className={styles.btn}></a> */}
          <div className={styles.newImageInner} style={{ position: 'relative' }}>
            <img
              src={url}
              style={{ width: previewWidth, height: previewHeight }}
            />
            {cameraRect && (
              <div
                className={styles.cameraRect}
                style={{
                  left: cameraRect.preview.left,
                  top: cameraRect.preview.top,
                  width: cameraRect.preview.width,
                  height: cameraRect.preview.height,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSuperResolution;
