import styles from './size.module.less';
import Item from '../item';
import { InputNumber, Slider, Space, Tooltip } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import type { ImageElement } from 'video-core-sdk';
import { useReducer, useState, useRef } from 'react';
import { utils } from 'video-core-sdk';
import { pubsub } from '@utils/pubsub';
import { Undo, ScanSetting } from '@icon-park/react';
import SliderInput from '../slider-input';
import { language } from '@language/language';
import { stores } from '@stores/index';
import KeyFrameDot from '../keyframe-dot/KeyFrameDot';

export interface IProps {
  hasScale?: boolean;
}

function Size(props: IProps) {
  const { editor } = stores;
  const elementData = editor.getElementData() as ImageElement;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  // const [scale, setScale] = useState(1);

  editor.updateKey;
  editor.currentTime;
  if (!elementData.controlUnKeepRatio && !elementData._ratio) {
    elementData._ratio = utils.toNum(elementData.style.width) / (utils.toNum(elementData.style.height) || 1);
  }

  let ostyle: any = {};
  if (!elementData.ostyle) {
    ostyle = { ...elementData.ostyle };
  } else {
    let hasRes: any = editor.movie.resourceManage.getResouceById(elementData.resourceId);
    if (!hasRes) {
      ostyle = { ...elementData.ostyle };
      if (!elementData.ostyle) {
        console.error('elementData元素没有原始样式');
      }
    } else {
      ostyle = { ...hasRes.styleSize };
    }
  }

  // 如果有帧
  const frameStatus = editor.movie.getFrameStatusByCurrentTime(elementData);
  const frame = editor.movie.getFrameItem(elementData);
  if (elementData.scale === undefined) {
    elementData.scale = 1;
  }
  const scale = frameStatus?.scale !== undefined ? frameStatus.scale : elementData.scale;

  // console.log('frameStatus size-->', frameStatus);
  // console.log('ostyle-->', ostyle);

  return (
    <>
      <Item
        title={language.val('option_size')}
        extra={
          <Space>
            <Tooltip content={language.val('option_size_reset')}>
              <a
                onClick={() => {
                  const hasRes = editor.movie.resourceManage.getResouceById(elementData.resourceId);
                  const style = utils.calcSizeAndPosition(hasRes ? hasRes.styleSize : ostyle, {
                    width: editor.data.width,
                    height: editor.data.height,
                  });
                  if (frameStatus?.width !== undefined) {
                    if (frame) {
                      frame.rotation = 0;
                      frame.width = style.width;
                      frame.height = style.height;
                      frame.x = editor.data.width / 2;
                      frame.y = editor.data.height / 2;
                    }
                    pubsub.publish('keyboardUpdateFrame');
                  } else {
                    elementData.style.rotation = 0;
                    elementData.style.width = style.width;
                    elementData.style.height = style.height;
                    elementData.style.x = editor.data.width / 2;
                    elementData.style.y = editor.data.height / 2;
                  }
                  forceUpdate();
                  editor.updateMovie();
                  // editor.updateOption();
                }}
              >
                <Undo theme="outline" size="14" fill="var(--theme-icon)" />
              </a>
            </Tooltip>
            <Tooltip content={language.val('option_adaptive')}>
              <a
                onClick={() => {
                  const hasRes = editor.movie.resourceManage.getResouceById(elementData.resourceId);
                  const style = hasRes
                    ? {
                        width: hasRes.styleSize.width,
                        height: hasRes.styleSize.height,
                      }
                    : ostyle;
                  // 计算图片的缩放比例
                  var widthRatio = editor.data.width / style.width;
                  var heightRatio = editor.data.height / style.height;
                  var ratio = Math.max(widthRatio, heightRatio);

                  if (frameStatus?.width !== undefined) {
                    if (frame) {
                      frame.rotation = 0;
                      frame.width = style.width * ratio;
                      frame.height = style.height * ratio;
                      frame.x = editor.data.width / 2;
                      frame.y = editor.data.height / 2;
                    }
                    pubsub.publish('keyboardUpdateFrame');
                  } else {
                    elementData.style.rotation = 0;
                    elementData.style.width = style.width * ratio;
                    elementData.style.height = style.height * ratio;
                    elementData.style.x = editor.data.width / 2;
                    elementData.style.y = editor.data.height / 2;
                  }
                  forceUpdate();
                  editor.updateMovie();
                }}
              >
                <ScanSetting theme="outline" size="14" fill="var(--theme-icon)" />
              </a>
            </Tooltip>
            <KeyFrameDot keyFrameName="width_height" />
          </Space>
        }
      >
        <div className={styles.size}>
          <InputNumber
            innerButtons
            prefix="W"
            min={1}
            value={
              frameStatus?.width !== undefined ? utils.toNum(frameStatus.width) : utils.toNum(elementData.style.width)
            }
            onChange={(v: number) => {
              if (frameStatus?.width !== undefined) {
                if (frame) {
                  frame.width = Math.max(utils.toNum(v), 1);
                  // frame.height = Math.max(elementData.style.width / (elementData._ratio || 1), 1);
                  pubsub.publish('keyboardUpdateFrame');
                } else {
                  const anime = editor.movie.updateKeyFrame(elementData, ['width_height']);
                  editor.frameSelectedId = anime.id;
                  anime.width = Math.max(utils.toNum(v), 1);
                  // anime.height = Math.max(anime.width / (elementData._ratio || 1), 1);
                  pubsub.publish('keyboardUpdateFrame');
                }
              } else {
                elementData.style.width = Math.max(utils.toNum(v), 1);
                // elementData.style.height = Math.max(elementData.style.width / (elementData._ratio || 1), 1);
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
              frameStatus?.height !== undefined
                ? utils.toNum(frameStatus.height)
                : utils.toNum(elementData.style.height)
            }
            onChange={(v: number) => {
              if (frameStatus?.height !== undefined) {
                if (frame) {
                  frame.height = Math.max(utils.toNum(v), 1);
                  // frame.width = Math.max(elementData.style.height * (elementData._ratio || 1), 1);
                } else {
                  const anime = editor.movie.updateKeyFrame(elementData, ['width_height']);
                  editor.frameSelectedId = anime.id;
                  anime.height = Math.max(utils.toNum(v), 1);
                  // frame.width = anime.height * Math.max(anime.height / (elementData._ratio || 1), 1);
                }
                pubsub.publish('keyboardUpdateFrame');
              } else {
                elementData.style.height = Math.max(utils.toNum(v), 1);
                // elementData.style.width = Math.max(elementData.style.height * (elementData._ratio || 1), 1);
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
      {props.hasScale && (
        <Item title={language.val('option_zoom')} extra={<KeyFrameDot keyFrameName="scale" />}>
          <SliderInput
            min={0.01}
            max={10}
            step={0.01}
            value={scale}
            onChange={(v: number) => {
              if (frameStatus?.scale !== undefined) {
                if (frame) {
                  frame.scale = v;
                } else {
                  const anime = editor.movie.updateKeyFrame(elementData, ['scale']);
                  editor.frameSelectedId = anime.id;
                  anime.scale = v;
                }
                pubsub.publish('keyboardUpdateFrame');
              } else {
                elementData.scale = v;
              }
              // 同步修改
              editor.updateMovie();
              forceUpdate();
            }}
          />
        </Item>
      )}
    </>
  );
}

export default observer(Size);
