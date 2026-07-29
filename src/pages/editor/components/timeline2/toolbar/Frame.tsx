import styles from './tools.module.less';
import { Tooltip, Toast, Switch, Modal } from '@douyinfe/semi-ui';
import classNames from 'classnames';
import { useCallback, useEffect, useReducer } from 'react';
import type { VideoElement } from 'video-core-sdk';
import { helper, speedHelper } from 'video-core-sdk';
import { observer } from 'mobx-react';
import { transaction } from 'mobx';
import { pubsub } from '@utils/pubsub';
import { remove } from 'lodash';
import { util } from '@utils/index';
import { ExclusiveGateway, DiamondThree, Other, CardTwo } from '@icon-park/react';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {}

/**
 * 元素翻转
 * @param props
 * @returns
 */
function Frame(props: IProps) {
  const { editor } = stores;
  editor.timelineToolsUpdateKey;

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  let enable = false;

  if (editor.selectedElementIds.length > 1) {
    enable = false;
  }

  if (editor.selectedElementIds.length === 1) {
    const elementData = editor.getElementData() as any;
    if (
      elementData &&
      !['caption', 'effect', 'audio'].includes(elementData.type) &&
      elementData.frames &&
      elementData.frames.length > 1
    ) {
      enable = true;
    }
  }

  // 插入&更新帧
  const updateFrameItem = useCallback((animeId?: string) => {
    // 添加帧
    const elementData = editor.getElementData() as VideoElement;
    if (!elementData) {
      Toast.error(language.val('timeline_top_please_select_element'));
      return;
    }
    transaction(() => {
      if (animeId) {
        editor.frameSelectedId = animeId;
      }
      editor.updateTimeline();
      editor.updateMovie();
      editor.updateOption();
    });
  }, []);

  // 插入帧
  useEffect(() => {
    pubsub.subscribe('keyboardUpdateFrame', (_name, key) => {
      updateFrameItem();
    });

    return () => {
      pubsub.unsubscribe('keyboardUpdateFrame');
    };
  }, []);

  return (
    <>
      {/* <Tooltip content={language.val('timeline_top_copy_frame')}>
        <a
          onClick={() => {
            if (enable) {
              const elementData = editor.getElementData() as VideoElement;
              if (elementData.frames && elementData.frames.length) {
                editor.copyTempFrameDataType = elementData.type;
                editor.copyTempFrameData = util.toJS(elementData.frames);
                forceUpdate();
                Toast.success(language.val('timeline_top_copy_success'));
              } else {
                Toast.warning(language.val('timeline_top_no_frame_data'));
              }
            } else {
              Toast.error(language.val('timeline_top_please_select_element'));
            }
          }}
          className={classNames(styles.button, {
            [styles.enable]: enable,
          })}
        >
          <DiamondThree theme="outline" size="18" fill="var(--theme-icon)" />
        </a>
      </Tooltip>
      {editor.copyTempFrameData && (
        <Tooltip content={language.val('timeline_top_paste_frame')}>
          <a
            onClick={() => {
              if (enable) {
                const elementData = editor.getElementData() as VideoElement;
                switch (editor.copyTempFrameDataType) {
                  case 'video':
                  case 'image':
                  case 'sticker':
                    if (!['video', 'image', 'sticker'].includes(elementData.type)) {
                      Toast.error(language.val('timeline_top_paste_type_error'));
                      return;
                    }
                    break;
                  case 'filter':
                  case 'text':
                  case 'audio':
                    if (elementData.type !== editor.copyTempFrameDataType) {
                      Toast.error(language.val('timeline_top_paste_type_error'));
                      return;
                    }
                    break;

                  default:
                    return;
                }

                console.log('paste frame', editor.copyTempFrameData);
                // return;
                // 宽高使用原素材的宽高
                editor.copyTempFrameData.forEach(frame => {
                  frame.width = elementData.style.width;
                  frame.height = elementData.style.height;
                });

                elementData.frames = util.toJS(editor.copyTempFrameData);
                elementData._dirty = util.randomID();
                editor.updateMovie();
                editor.updateTimelineTools();
                editor.updateTimeline();
                Toast.success(language.val('timeline_top_paste_success'));
              } else {
                Toast.error(language.val('timeline_top_please_select_element'));
              }
            }}
            className={classNames(styles.button, {
              [styles.enable]: enable,
            })}
          >
            <DiamondThree theme="filled" size="18" fill="var(--theme-icon)" />
          </a>
        </Tooltip>
      )} */}
    </>
  );
}

export default observer(Frame);
