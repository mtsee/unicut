import styles from './mask.module.less';
import Item from '../item';
import React, { useRef, useCallback, useEffect, useReducer } from 'react';
import type { ImageElement } from 'video-core-sdk';
import { observer } from 'mobx-react';
import { Slider, InputNumber, Button } from '@douyinfe/semi-ui';
import { pubsub } from '@utils/pubsub';
import { mock } from './mask.mock';
import classNames from 'classnames';
import { Upload, Toast } from '@douyinfe/semi-ui';
// import { user } from '@stores/index';
import { util } from '@utils/index';
import { language } from '@language/language';
import { utils } from 'video-core-sdk';
import { stores } from '@stores/index';
import KeyFrameDot from '../keyframe-dot/KeyFrameDot';

export interface IProps {}

function Mask(props: IProps) {
  const { editor } = stores;
  editor.currentTime;
  const elementData = editor.getElementData() as ImageElement;
  const frameStatus = editor.movie?.getFrameStatusByCurrentTime(elementData);
  const frame = editor.movie?.getFrameItem(elementData);
  const refToast = useRef(null);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    console.log('切换进来了');
    editor.movie.changeControlMode('editMask', elementData.id);
    return () => {
      editor.movie.changeControlMode('editElement', elementData.id);
    };
  }, [elementData.mask]);

  // item： name, width, height, url
  const selectMaskImage = useCallback(async item => {
    const res = await editor.movie.addResource(item.url, { width: item.width, height: item.height });

    // 宽或者高撑满
    const scale = calculateScaleFactor(elementData.style.width, elementData.style.height, item.width, item.height);
    console.log('set mask', { scale, res }, editor.data);

    elementData.mask = {
      name: item.name,
      resourceId: res.id,
      blur: 0,
      width: item.width * scale,
      height: item.height * scale,
      alpha: 1,
      x: elementData.style.width / 2,
      y: elementData.style.height / 2,
      rotation: 0,
    };
    editor.updateMovie();
    forceUpdate();
    setTimeout(() => {
      editor.movie.changeControlMode('editMask', elementData.id);
    });
  }, []);

  let blur = elementData.mask ? elementData.mask.blur : 0;
  if (frameStatus?.maskBlur !== undefined) {
    blur = frameStatus.maskBlur;
  }

  let alpha = elementData.mask ? elementData.mask.alpha : 1;
  if (frameStatus?.maskAlpha !== undefined) {
    alpha = frameStatus.maskAlpha;
  }
  const { width, height, captions } = editor.data;

  const changeX = (v: number) => {
    if (frameStatus?.maskX !== undefined) {
      if (frame) {
        frame.maskX = utils.toNum(v + width / 2);
      } else {
        const anime = editor.movie.updateKeyFrame(elementData, ['maskX_maskY']);
        anime.maskX = utils.toNum(v + width / 2);
        editor.frameSelectedId = anime.id;
      }
      pubsub.publish('keyboardUpdateFrame');
    } else {
      elementData.style.x = utils.toNum(v + width / 2);
    }
    editor.updateMovie();
    forceUpdate();
  };

  const changeY = (v: number) => {
    if (frameStatus?.maskY !== undefined) {
      if (frame) {
        frame.maskY = utils.toNum(v + height / 2);
      } else {
        const anime = editor.movie.updateKeyFrame(elementData, ['maskX_maskY']);
        anime.maskY = utils.toNum(v + height / 2);
        editor.frameSelectedId = anime.id;
      }
      pubsub.publish('keyboardUpdateFrame');
    } else {
      elementData.style.y = utils.toNum(v + height / 2);
    }
    editor.updateMovie();
    forceUpdate();
  };

  const x =
    frameStatus?.maskX !== undefined
      ? utils.toNum(frameStatus.maskX - width / 2)
      : utils.toNum(elementData.mask?.x || 0 - width / 2);
  const y =
    frameStatus?.maskY !== undefined
      ? utils.toNum(frameStatus.maskY - height / 2)
      : utils.toNum(elementData.mask?.y || 0 - height / 2);

  return (
    <div className={'scroll scrollBox'}>
      <Item title={language.val('option_mask_shape')}>
        {/* <div>
          <Button block>上传</Button>
        </div> */}
        <div className={styles.list}>
          <a
            className={classNames(styles.item, {
              [styles.active]: !elementData.mask,
            })}
            onClick={() => {
              const elementData = editor.getElementData() as ImageElement;
              delete elementData.mask;
              editor.updateMovie();
              forceUpdate();

              editor.record({
                type: 'elements_update',
                desc: 'mask',
                data: [elementData],
              });
              setTimeout(() => {
                editor.movie.changeControlMode('editMask', elementData.id);
              }, 0);
            }}
          >
            {language.val('option_no_mask')}
          </a>
          {mock.map(d => {
            return (
              <a
                key={d.name}
                className={classNames(styles.item, {
                  [styles.active]: d.name === elementData.mask?.name,
                })}
                style={{
                  backgroundImage: `url(${d.url})`,
                }}
                onClick={() => selectMaskImage({ ...d })}
              ></a>
            );
          })}
          <a className={styles.item}>
            <Upload
              accept=".gif, .png, .jpeg, .jpg, .svg"
              action={'/api/v1/common/upload/form'}
              uploadTrigger="auto"
              headers={{
                Authorization: editor.token,
              }}
              maxSize={10 * 1024}
              multiple={true}
              limit={1}
              draggable={true}
              showUploadList={false}
              className={styles.btn1}
              onAcceptInvalid={v => {
                console.log('>>>>', v);
              }}
              beforeUpload={async v => {
                if (!editor.userInfo) {
                  Toast.warning(language.val('toast_please_login'));
                  return {
                    shouldUpload: false,
                    status: 'error',
                  };
                } else {
                  refToast.current = Toast.info({
                    content: language.val('common_uploading'),
                    duration: 0,
                  });
                }
                return {
                  shouldUpload: true,
                  status: 'success',
                };
              }}
              onSuccess={async (res, file, all) => {
                Toast.close(refToast.current);
                if (res.code !== 0) {
                  Toast.error(res.message);
                  return;
                } else {
                  Toast.success(language.val('common_upload_success'));
                  const _img = await util.imgLazy(editor.movie.reURL(res.data.storage_path));
                  console.log('upload...', {
                    name: res.data.filename,
                    url: res.data.storage_path,
                    width: _img.naturalWidth,
                    height: _img.naturalHeight,
                  });
                  selectMaskImage({
                    name: res.data.filename,
                    url: res.data.storage_path,
                    width: _img.naturalWidth,
                    height: _img.naturalHeight,
                  });
                }
              }}
              onError={(...v) => console.log('error', v)}
            >
              <span style={{ fontSize: 12 }}>{language.val('option_custom_mask')}</span>
            </Upload>
          </a>
        </div>
      </Item>
      {elementData.mask && (
        <>
          <Item title={language.val('option_position')} extra={<KeyFrameDot keyFrameName="maskX_maskY" />}>
            <div className={styles.position}>
              <InputNumber
                innerButtons
                prefix="X"
                value={x}
                onChange={changeX}
                onBlur={() => {
                  editor.record({
                    type: 'elements_update',
                    desc: language.val('option_position_x'),
                    data: [elementData],
                  });
                }}
              />
              <InputNumber
                innerButtons
                prefix="Y"
                value={y}
                onChange={changeY}
                onBlur={() => {
                  editor.record({
                    type: 'elements_update',
                    desc: language.val('option_position_y'),
                    data: [elementData],
                  });
                }}
              />
            </div>
          </Item>
          <Item title={language.val('option_size')} extra={<KeyFrameDot keyFrameName="maskWidth_maskHeight" />}>
            <div className={styles.size}>
              <InputNumber
                innerButtons
                prefix="W"
                min={1}
                value={
                  frameStatus?.maskWidth !== undefined
                    ? utils.toNum(frameStatus.maskWidth)
                    : utils.toNum(elementData.mask.width || 0)
                }
                onChange={(v: number) => {
                  if (frameStatus?.maskWidth !== undefined) {
                    if (frame) {
                      frame.maskWidth = Math.max(utils.toNum(v), 1);
                      // frame.maskHeight = Math.max(frame.maskWidth * (elementData._ratio || 1), 1);
                    } else {
                      const anime = editor.movie.updateKeyFrame(elementData, ['maskWidth_maskHeight']);
                      anime.maskWidth = Math.max(utils.toNum(v), 1);
                      editor.frameSelectedId = anime.id;
                    }
                    pubsub.publish('keyboardUpdateFrame');
                  } else {
                    elementData.mask.width = Math.max(utils.toNum(v), 1);
                    // elementData.mask.height = Math.max(elementData.mask.width * (elementData._ratio || 1), 1);
                  }
                  editor.updateMovie();
                  forceUpdate();
                }}
                onBlur={() => {
                  editor.record({
                    type: 'elements_update',
                    desc: '修改W',
                    data: [elementData],
                  });
                }}
              />
              <InputNumber
                min={1}
                innerButtons
                prefix="H"
                value={
                  frameStatus?.maskHeight !== undefined
                    ? utils.toNum(frameStatus.maskHeight)
                    : utils.toNum(elementData.mask.height)
                }
                onChange={(v: number) => {
                  if (frameStatus?.maskHeight !== undefined) {
                    if (frame) {
                      frame.maskHeight = Math.max(utils.toNum(v), 1);
                    } else {
                      const anime = editor.movie.updateKeyFrame(elementData, ['maskWidth_maskHeight']);
                      anime.maskHeight = Math.max(utils.toNum(v), 1);
                      editor.frameSelectedId = anime.id;
                    }
                    pubsub.publish('keyboardUpdateFrame');
                  } else {
                    elementData.mask.height = Math.max(utils.toNum(v), 1);
                    // elementData.mask.width = Math.max(elementData.mask.height * (elementData._ratio || 1), 1);
                  }
                  // 同步修改
                  editor.updateMovie();
                  forceUpdate();
                }}
                onBlur={() => {
                  editor.record({
                    type: 'elements_update',
                    desc: '修改H',
                    data: [elementData],
                  });
                }}
              />
            </div>
          </Item>
          <Item title={language.val('option_opacity')} extra={<KeyFrameDot keyFrameName="maskAlpha" />}>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={alpha}
              onChange={e => {
                if (elementData.mask) {
                  if (frameStatus?.maskAlpha !== undefined) {
                    if (frame) {
                      frame.maskAlpha = e as number;
                    } else {
                      // 创建新的keyFrame
                      const anime = editor.movie.updateKeyFrame(elementData, ['maskAlpha']);
                      anime.maskAlpha = e as number;
                      editor.frameSelectedId = anime.id;
                    }
                    pubsub.publish('keyboardUpdateFrame');
                  } else {
                    elementData.mask.alpha = e as number;
                  }
                  editor.updateMovie();
                  forceUpdate();
                }
              }}
            />
          </Item>
          <Item title={language.val('option_blur')} extra={<KeyFrameDot keyFrameName="maskBlur" />}>
            <Slider
              min={0}
              max={300}
              step={1}
              value={blur}
              onChange={e => {
                if (elementData.mask) {
                  if (frameStatus?.maskBlur !== undefined) {
                    if (frame) {
                      frame.maskBlur = e as number;
                    } else {
                      // 创建新的keyFrame
                      const anime = editor.movie.updateKeyFrame(elementData, ['maskBlur']);
                      anime.maskBlur = e as number; 
                      editor.frameSelectedId = anime.id;
                    }
                    pubsub.publish('keyboardUpdateFrame');
                  } else {
                    elementData.mask.blur = e as number;
                  }
                  forceUpdate();
                }
              }}
            />
          </Item>
        </>
      )}
    </div>
  );
}

// 计算图片的缩放比例
function calculateScaleFactor(boxWidth: number, boxHeight: number, imgWidth: number, imgHeight: number) {
  // 计算宽度和高度的比例
  const widthRatio = boxWidth / imgWidth;
  const heightRatio = boxHeight / imgHeight;
  // 选择较小的比例，以确保图片完全适应容器
  const scaleFactor = Math.min(widthRatio, heightRatio);
  return scaleFactor;
}

export default observer(Mask);
