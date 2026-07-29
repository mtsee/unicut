import styles from './cropSize.module.less';
import { Tailoring } from '@icon-park/react';
import { Modal, Button, Tooltip, Toast } from '@douyinfe/semi-ui';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { VideoElement } from 'video-core-sdk';
import { drawVideoFrame } from '@utils/util';
import { utils } from 'video-core-sdk';
import { observer } from 'mobx-react';
import { util } from '@utils/index';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {}

function CropSize(props: IProps) {
  const { editor } = stores;
  editor.timelineToolsUpdateKey;
  let enable = false;
  if (editor.selectedElementIds.length > 1) {
    enable = false;
  }
  if (editor.selectedElementIds.length === 1) {
    const elementData = editor.getElementData();
    if (elementData && ['video', 'image'].includes(elementData.type)) {
      enable = true;
    }
  }

  const [visible, setVisible] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);
  const [src, setSrc] = useState('');
  const [aspectRatio, setAspectRatio] = useState(1);
  const elementData = editor.getElementData() as VideoElement;

  // 图片的缩放比例
  // const [scale, setScale] = useState(1);

  const frameVideo = useCallback(async url => {
    const video = (await utils.mediaLazy(editor.movie.reURL(url), 1, 'video')) as HTMLVideoElement;
    const vimg = await drawVideoFrame(video, video.videoWidth, 3);
    setSrc(vimg);
    setAspectRatio(video.videoWidth / video.videoHeight);
  }, []);

  useEffect(() => {
    if (visible) {
      const resource = editor.movie.resourceManage.getResouceById(elementData.resourceId);
      // console.log('resource', resource);

      if (resource) {
        const { styleSize, url, type } = resource;
        // 如果是视频。需要截帧
        if (type === 'video') {
          frameVideo(url);
        } else {
          setSrc(url);
          setAspectRatio(styleSize.width / styleSize.height);
        }
      } else {
        Toast.error(language.val('timeline_top_notfound_error'));
      }
    }
  }, [visible, elementData]);

  return (
    <>
      <Tooltip content={language.val('timeline_top_clip')}>
        <a
          className={classNames(styles.btn, {
            [styles.enable]: enable,
          })}
        >
          <Tailoring
            onClick={() => {
              if (enable) {
                setVisible(true);
              }
            }}
            theme="outline"
            size="18"
            fill="var(--theme-icon)"
          />
        </a>
      </Tooltip>
      <Modal maskClosable={false} visible={visible} onCancel={() => setVisible(false)} footer={null} title="裁剪">
        {visible && src && (
          <>
            <Cropper
              key={src}
              src={editor.movie.reURL(src)}
              style={{ height: 300, width: '100%' }}
              // Cropper.js options
              initialAspectRatio={aspectRatio}
              data={{ ...(elementData.cropSize || {}) }}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              highlight={false}
              background={false}
              checkOrientation={false}
              viewMode={1}
              autoCrop={true}
              guides={false}
              zoomable={false}
              ref={cropperRef}
            />
            <div className={styles.btns}>
              <Button onClick={() => setVisible(false)} type="danger">
                取消
              </Button>
              <Button
                onClick={() => {
                  const cropper = cropperRef.current?.cropper;
                  const size = cropper.getData();
                  const { x, y, width, height } = size;

                  // 因为裁剪数据不能超过原始尺寸，这里向下取整确保不会超过原始尺寸
                  elementData.cropSize = {
                    x: ~~x,
                    y: ~~y,
                    width: ~~width,
                    height: ~~height,
                  };
                  const scalex = elementData.style.width / elementData.cropSize.width;
                  const scaley = elementData.style.height / elementData.cropSize.height;
                  const scale = Math.min(scalex, scaley);

                  // 设置新的宽高
                  elementData.style.width = ~~(elementData.cropSize.width * scale);
                  elementData.style.height = ~~(elementData.cropSize.height * scale);

                  // // 重新计算x,y位置，确保尺寸变化后，elementData在画布中的位置不变
                  // const x0 = ~~(x - elementData.style.width / 2) / scalex + elementData.style.x;
                  // const y0 = ~~(y - elementData.style.height / 2) / scaley + elementData.style.y;
                  // elementData.style.x = x0;
                  // elementData.style.y = y0;

                  // 修改mask参数
                  if (elementData.mask) {
                    elementData.mask.width = elementData.style.width;
                    elementData.mask.height = elementData.style.height;
                  }

                  // 修改帧动画
                  if (elementData.frames) {
                    elementData.frames.forEach(f => {
                      let nscale = f.width / elementData.style.width;
                      f.width = nscale * elementData.style.width;
                      f.height = nscale * elementData.style.height;
                    });
                  }

                  editor.setContorlAndSelectedElemenent([elementData.id]);
                  editor.updateMovie();
                  setVisible(false);
                }}
              >
                确认
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

export default observer(CropSize);
