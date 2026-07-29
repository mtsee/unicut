import styles from './canvas.module.less';
import { Store, Movie, utils } from 'video-core-sdk';

import { useEffect, useState, useReducer, useCallback, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import Player from './Player';
import { observer } from 'mobx-react';
import $ from 'jquery';
import { getMaterialFileUrl, hydrateResourcePaths } from '@services/localStorageService';
// import CustomAnimationPath from './CustomAnimationPath';
import { pubsub } from '@utils/pubsub';
import { config } from '@config/index';
import TemplatePlayer from './TemplatePlayer';
import { stores } from '@stores/index';
import { Space, Tooltip } from '@douyinfe/semi-ui';
import classNames from 'classnames';
import { Minus, Move, MoveOne, OffScreen, Plus } from '@icon-park/react';
import debounce from 'lodash/debounce';

export interface IProps {}

function Canvas(props: IProps) {
  const { editor } = stores;
  const { width = 0, height = 0, ref } = useResizeDetector();
  const paddingTopBottom = 0;
  const paddingLeftRight = 40;
  const [dragLock, setDragLock] = useState('1');
  const [mv, setMv] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(
    Math.min((width - paddingLeftRight) / editor.data.width, (height - paddingTopBottom) / editor.data.height) || 0.1,
  );
  const setScaleDo = (s: number) => {
    editor.scale = s;
    setScale(s);
  };

  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const debounceForceUpdate = useCallback(
    debounce(() => {
      forceUpdate();
      console.log('暂停');
    }, 100),
    [],
  );
  const [target, setTarget] = useState<any>();

  const fit = () => {
    setMv({ x: 0, y: 0 });
    setDragLock(utils.createID());
    setScaleDo(
      Math.min((width - paddingLeftRight) / editor.data.width, (height - paddingTopBottom) / editor.data.height) || 0.1,
    );
  };

  useEffect(() => {
    if (width && height) {
      fit();
      return;
    }
  }, [width, height]);

  useEffect(() => {
    setTarget(document.getElementById('h5dsCanvas'));

    // 点击空白部分取消元素的选择
    $(ref.current).on('click', e => {
      if ($(e.target).closest('#h5dsCanvas')[0]) {
        return;
      } else {
        editor.setSelectedElementIds([]);
        editor.movie?.updateControl('trigger', []);
      }
    });

    return () => {
      $(ref.current).off('click');
    };
  }, []);

  // 本地存储模式：当 movie 就绪后，将资源中的相对路径解析为 blob URL
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (editor.movie?.resourceManage) {
      // 设置本地存储模式标记
      editor.movie.resourceManage.useLocalStorage = editor.useLocalStorage;
      if (!hydratedRef.current && editor.useLocalStorage && editor.data?.resouces?.length) {
        hydratedRef.current = true;
        hydrateResourcePaths(editor.data.resouces, editor.movie.resourceManage);
      }
    }
  });

  useEffect(() => {
    // 鼠标在h5dsCanvasOuter元素上，按住ctrl滚动缩放
    $(ref.current).on('wheel.canvasDrag', (e: any) => {
      e.preventDefault();
      if (e.ctrlKey) {
        if (e.originalEvent.deltaY > 0) {
          setScaleDo(Math.max(scale - 0.1, 0.1));
        } else {
          setScaleDo(Math.min(scale + 0.1, 2));
        }
      }
    });
    return () => {
      $(ref.current).off('wheel.canvasDrag');
    };
  }, [scale]);

  const mouseDown = useCallback(
    e => {
      console.log(e, e.ctrlKey);
      if (e.ctrlKey && !editor.canvasDragEnable) {
        $('.selecto-selection')[0].style.opacity = '0';
        editor.canvasDragEnable = true;
        editor.movie.controlModeType = 'editMask';
        editor.setContorlAndSelectedElemenent([]);
        forceUpdate();
      }

      if (!editor.canvasDragEnable) {
        return;
      }
      // setMv({ x: e.clientX, y: e.clientY });
      let startX = mv.x;
      let startY = mv.y;

      const mouseMove = em => {
        console.log(em.clientX, em.clientY);
        setMv({ x: startX + em.clientX - e.clientX, y: startY + em.clientY - e.clientY });
      };

      $(document).on('mousemove.h5dsCanvasDragEnable', mouseMove);
      $(document).on('mouseup.h5dsCanvasDragEnable', e => {
        if (e.ctrlKey) {
          $('.selecto-selection')[0].style.opacity = '1';
          editor.canvasDragEnable = false;
          editor.movie.controlModeType = 'editElement';
          editor.setContorlAndSelectedElemenent([]);
          forceUpdate();
        }
        setDragLock(utils.createID());
        $(document).off('mousemove.h5dsCanvasDragEnable', mouseMove);
        $(document).off('mouseup.h5dsCanvasDragEnable');
      });
    },
    [dragLock, editor.canvasDragEnable],
  );

  return (
    <>
      <div
        className={styles.canvas}
        ref={ref}
        id="h5dsCanvasOuter"
        onMouseDown={mouseDown}
        onContextMenu={async e => {
          // 禁用默认的鼠标右键事件
          e.preventDefault();
          const target = e.target as HTMLDivElement;
          const { elementid } = target.dataset;
          if (target.className !== 'moveable-area' && !elementid) {
            return;
          }
          // console.log(elementid, editor.selectedElementIds.length);
          // console.dir(e.target);
          if (elementid && editor.selectedElementIds.length <= 1) {
            editor.setContorlAndSelectedElemenent([elementid]);
            // editor.contextMenuType = 'single';
            editor.contextMenuInstance.show({ event: e, props: { group: false, elementId: elementid } });
          }
          if (editor.selectedElementIds.length > 1) {
            // 选择了组
            // editor.contextMenuType = 'group';
            editor.contextMenuInstance.show({ event: e, props: { group: true } });
          }
        }}
      >
        <div
          className={classNames(styles.canvasInner, { [styles.canvasInnerDrag]: editor.canvasDragEnable })}
          style={{ transform: `translate(${mv.x}px, ${mv.y}px)` }}
          id="h5dsCanvas"
        >
          {/* {!!editor.customAnimationId && <CustomAnimationPath scale={scale} />} */}
          {target && (
            <Movie
              scale={scale}
              movieId={'editorMovie'}
              ref={(c: any) => {
                editor.movie = c;
              }}
              // 水印配置
              watermark={editor.watermark}
              resourceHost={editor.resourcesHost}
              fetchSourceBeforeRender={false}
              data={editor.data}
              plugins={editor.pluginsConfig}
              env={'editor'}
              EModuleEffectSourcePath={config.EModuleEffectSourcePath}
              registerId="H5DS_VIDEO_@#PxAz"
              getMaterialFileUrl={getMaterialFileUrl} // 本地资源处理
              stopControl={editor.editMode === 'template'}
              workerPath={config.workerPath + '/decode.worker.js'}
              target={target}
              currentTime={editor.currentTime}
              triggerCurrentTime={(t: number) => {
                editor.currentTime = t;
              }}
              onControlChangeStart={elementIds => {
                console.log('控制器变化前', elementIds);
                // 记录第一帧的初始位置
                if (elementIds.length === 1) {
                  const [elem] = editor.movie.getElementDataByIds(elementIds) as any[];
                  if (editor.frameControlSync.xy) {
                    editor.frameControlSyncStart.x = elem.style.x;
                    editor.frameControlSyncStart.y = elem.style.y;
                  }
                  if (editor.frameControlSync.rotation) {
                    editor.frameControlSyncStart.rotation = elem.style.rotation;
                  }
                  if (editor.frameControlSync.width_height) {
                    editor.frameControlSyncStart.width = elem.style.width;
                    editor.frameControlSyncStart.height = elem.style.height;
                  }
                }
              }}
              onSelectElements={elementIds => {
                console.log('触发选中事件', elementIds);
                if (elementIds.length === 0) {
                  editor.frameSelectedId = '';
                }
                editor.setSelectedElementIds(elementIds);
              }}
              onControlChangeEnd={elementIds => {
                console.log('控制器结束', elementIds);
                if (
                  elementIds.length === 1 &&
                  (editor.frameControlSync.xy ||
                    editor.frameControlSync.rotation ||
                    editor.frameControlSync.width_height)
                ) {
                  const [elem] = editor.movie.getElementDataByIds(elementIds) as any[];
                  if (!elem.frames) {
                    elem.frames = [];
                  }
                  // 计算帧变化值
                  if (editor.frameControlSync.xy) {
                    const fc = [
                      elem.style.x - editor.frameControlSyncStart.x,
                      elem.style.y - editor.frameControlSyncStart.y,
                    ];
                    elem.frames.forEach(d => {
                      // 时间节点的帧不移动，因为已经被拖动了
                      if (d.x !== undefined && d.startTime + elem.startTime - editor.currentTime !== 0) {
                        d.x = d.x + fc[0];
                        d.y = d.y + fc[1];
                      }
                    });
                  }
                  if (editor.frameControlSync.rotation) {
                    const v = elem.style.rotation - editor.frameControlSyncStart.rotation;
                    elem.frames.forEach(d => {
                      // 时间节点的帧不移动，因为已经被拖动了
                      if (d.rotation !== undefined && d.startTime + elem.startTime - editor.currentTime !== 0) {
                        d.rotation = d.rotation + v;
                      }
                    });
                  }
                  if (editor.frameControlSync.width_height) {
                    const fc = [
                      elem.style.width - editor.frameControlSyncStart.width,
                      elem.style.height - editor.frameControlSyncStart.height,
                    ];
                    elem.frames.forEach(d => {
                      // 时间节点的帧不移动，因为已经被拖动了
                      if (d.width !== undefined && d.startTime + elem.startTime - editor.currentTime !== 0) {
                        d.width = d.width + fc[0];
                        d.height = d.height + fc[1];
                      }
                    });
                  }
                }
                editor.updateComponent('options');
                editor.updateTimeline();
                editor.recordUpdateTestKey = +new Date();
                // 添加&更新 关键帧
                if (editor.frameSelectedId) {
                  pubsub.publish('keyboardUpdateFrame');
                }
              }}
              onPause={() => {
                editor.playing = false;
                // 修改播放按钮状态
                debounceForceUpdate();
              }}
              triggerRecordSelectElements={ids => {
                console.log('redo, undo恢复', ids);
                editor.setContorlAndSelectedElemenent([...ids]);
              }}
              callback={() => {
                editor.movieCreateSuccess = true;
                if (editor.callback) {
                  editor.callback({ editor });
                }
                // 实例完成后回调
                // const t = editor.movie.getTotalTime() || 0;
                // forceUpdate();
                // 历史记录
                editor.record({
                  desc: '原始数据',
                  type: 'global',
                  data: editor.data,
                  selecteds: [],
                });
                editor.updateTimeline();
              }}
            />
          )}
          {editor.editMode === 'template' && <TemplatePlayer />}
        </div>
      </div>
      <Space className={styles.move}>
        <Tooltip content={!editor.canvasDragEnable ? '拖动画布' : '元素选择'}>
          <a
            onClick={() => {
              if (!editor.canvasDragEnable) {
                editor.canvasDragEnable = true;
                editor.movie.controlModeType = 'editMask';
              } else {
                editor.canvasDragEnable = false;
                editor.movie.controlModeType = 'editElement';
              }
              editor.setContorlAndSelectedElemenent([]);
            }}
          >
            {editor.canvasDragEnable ? (
              <MoveOne theme="outline" size="20" fill="var(--theme-icon)" strokeWidth={3} />
            ) : (
              <Move theme="outline" size="20" fill="var(--theme-icon)" strokeWidth={3} />
            )}
          </a>
        </Tooltip>
        <a
          onClick={() => {
            setScaleDo(Math.max(scale - 0.1, 0.1));
          }}
        >
          <Minus theme="outline" size="20" fill="var(--theme-icon)" strokeWidth={3} />
        </a>
        {/* <span>{scale.toFixed(1)}</span> */}
        <a
          onClick={() => {
            setScaleDo(Math.min(scale + 0.1, 2));
          }}
        >
          <Plus theme="outline" size="20" fill="var(--theme-icon)" strokeWidth={3} />
        </a>
        <Tooltip content="自适应">
          <a
            onClick={() => {
              fit();
            }}
          >
            <OffScreen theme="outline" size="20" fill="var(--theme-icon)" strokeWidth={3} />
          </a>
        </Tooltip>
      </Space>
      {editor.movieCreateSuccess && editor.editMode === 'auto' && <Player />}
    </>
  );
}

export default observer(Canvas);
