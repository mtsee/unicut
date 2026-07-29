import styles from './styles.module.less';
import React from 'react';
// import { drawPNG } from './tools';
import { useCallback, useEffect, useRef, useState, useReducer } from 'react';
import { InteractiveSegmenter, FilesetResolver, MPMask } from '@mediapipe/tasks-vision';
import { Button, Spin, Toast } from '@douyinfe/semi-ui';
import $ from 'jquery';
import { imageThumb } from '@pages/editor/tools/uploadBeforeData';
import { pubsub, util } from '@utils/index';
import type { ImageElement } from 'video-core-sdk';
import { utils, ResourceItem } from 'video-core-sdk';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {
  url: string; // 图片的URL
  callback: () => void;
}

export default function MattingImage(props: IProps) {
  const { editor } = stores;
  const interactiveSegmenter = useRef<InteractiveSegmenter>();
  const imgRef = useRef<any>();
  const canvasRef = useRef<HTMLCanvasElement>();
  const maskDataRef = useRef<any>();
  const [loading, setLoading] = useState(true);

  // 创建实例
  const createSegmenter = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks('/assets/ai/wasm');
    interactiveSegmenter.current = await InteractiveSegmenter.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: `/assets/ai/matting/magic_touch.tflite`,
        delegate: 'GPU',
      },
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    });
    setLoading(false);
  };

  /**
   * Draw segmentation result
   */
  const drawSegmentation = useCallback((mask: MPMask) => {
    const width = mask.width;
    const height = mask.height;
    const maskData = mask.getAsFloat32Array();
    maskDataRef.current = maskData;
    const scale = imgRef.current.width / width;

    // 绘制形状
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#00000000';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(18, 181, 203, 0.7)';

    //@ts-ignore
    maskData.map((category, index) => {
      const x = (index + 1) % width;
      const y = (index + 1 - x) / width;
      if (Math.round(category * 255.0) === 0) {
        ctx.fillRect(x, y, 1, 1);
      }
    });
    canvas.style.transform = `scale(${scale})`;
  }, []);

  /**
   * 裁剪图片
   */
  const cropImage = async () => {
    if (!maskDataRef.current) {
      Toast.warning(language.val('timeline_top_please_select_image'));
      return;
    }
    setLoading(true);
    const img = await util.imgLazy(props.url);
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0);
    // 获取图像的像素数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    // 起始点默认有1px的灰色，去掉
    data[3] = 0;
    maskDataRef.current.map((category, index) => {
      const x = (index + 1) % width;
      const y = (index + 1 - x) / width;
      const i = (y * canvas.width + x) * 4;
      // 透明的部分去掉;
      if (Math.round(category * 255.0) === 0) {
        // ctx.fillRect(x, y, 1, 1); 透明的部分去掉
      } else {
        data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0;
      }
    });
    // 羽化
    // featherEdge(data, ctx.canvas.width, ctx.canvas.height, 10);
    ctx.putImageData(imageData, 0, 0);

    // 抗锯齿算法，画面会模糊
    // applyAntialiasing(ctx);

    // 1、获取base64图片
    const base64 = canvas.toDataURL('image/png');
    const attrs = await imageThumb(base64, 200);
    // 2、base64上传服务器
    const name = 'aimatting_' + util.randomID() + '.png';
    const [res] = await editor.apiServer.uploadBase64({
      content: base64,
      name: name,
    });
    const [thumbRes] = await editor.apiServer.uploadBase64({
      content: attrs._base64,
      name: 'thumb_' + util.randomID() + '.png',
    });
    // 保存到素材库
    const [item, err] = await editor.apiServer.createUserMaterial({
      name,
      app_id: editor.appid,
      urls: { url: res.storage_path, thumb: thumbRes.storage_path },
      attrs: {
        naturalWidth: width,
        naturalHeight: height,
      },
    });
    pubsub.publish('addItemToCloudList', item);
    // 3、添加素材到resource
    const resource = new ResourceItem({
      id: utils.createID(),
      originId: item.id,
      url: item.urls.url,
      name: item.name,
      fileType: item.type,
      type: item.type as any,
      mustFetch: item.type === 'image' ? true : false,
      thumb: item.urls.thumb,
      styleSize: {
        width: item.attrs.videoWidth || item.attrs.naturalWidth || Number(item.attrs.width),
        height: item.attrs.videoHeight || item.attrs.naturalHeight || Number(item.attrs.height),
      },
      duration: item.attrs.duration,
      from: 'user',
      attrs: { ...item.attrs },
    });
    // 加载素材
    await editor.movie.resourceManage.fetchBlob(item.urls.url);
    await editor.movie.resourceManage.fetchBlob(item.urls.thumb);
    editor.data.resouces.push(resource);
    // 4、然后替换素材
    const elementData = editor.getElementData() as ImageElement;
    elementData.resourceId = resource.id;
    const scale = elementData.style.width / resource.styleSize.width;
    elementData.style.height = resource.styleSize.height * scale;
    elementData._dirty = util.randomID();
    editor.updateMovie();
    editor.updateTimeline();
    setLoading(false);
    props.callback();
    // const _img = new Image();
    // _img.src = base64;
    // _img.onload = () => {
    //   drawPNG(_img, { width, height });
    // };
  };

  /**
   * x，y是图片的百分比坐标
   */
  const clickTarget = useCallback(async (imgTarget, { x, y }) => {
    setLoading(true);
    setTimeout(() => {
      interactiveSegmenter.current.segment(
        imgTarget,
        {
          keypoint: { x, y },
        },
        result => {
          drawSegmentation(result.categoryMask);
          setLoading(false);
        },
      );
    }, 100);
  }, []);

  useEffect(() => {
    checkWebgpu().then(ok => {
      if (!ok) {
        Toast.warning(language.val('timeline_top_please_upgrade_browser'));
      } else {
        createSegmenter();
      }
    });

    return () => {
      if(interactiveSegmenter.current) {
        interactiveSegmenter.current.close();
      }
    };
  }, []);

  return (
    <div className={styles.matting}>
      <div className={styles.btns}>
        <p>{language.val('timeline_top_ai_matting_tips')}</p>
        <Button onClick={cropImage}>{language.val('timeline_top_ai_matting_confirm')}</Button>
      </div>
      <Spin spinning={loading}>
        <div className={styles.box}>
          <div className={styles.boxinner}>
            <img
              ref={imgRef}
              src={props.url}
              crossOrigin="anonymous"
              onClick={(e: any) => {
                const { top, left } = $(e.target).offset();
                clickTarget(e.target, {
                  x: (e.pageX - left) / e.target.width,
                  y: (e.pageY - top) / e.target.height,
                });
              }}
            />
            <canvas ref={canvasRef}></canvas>
          </div>
        </div>
      </Spin>
    </div>
  );
}

export async function checkWebgpu() {
  if (!(navigator as any).gpu) {
    return false;
  }
  const adapter = await (navigator as any).gpu.requestAdapter();
  if (!adapter) {
    return false;
  }
  return true;
}
