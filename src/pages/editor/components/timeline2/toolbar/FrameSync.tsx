import { Popover, Switch, Tooltip } from '@douyinfe/semi-ui';
import React, { useReducer, useEffect, useRef } from 'react';
import { stores } from '@stores/index';
import styles from './tools.module.less';
import { Sync } from '@icon-park/react';
import classNames from 'classnames';

type Props = {};

const FrameSync = (props: Props) => {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const ctrlPressedRef = useRef(false);
  const prevStateRef = useRef<{ xy: boolean; rotation: boolean; width_height: boolean } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && !ctrlPressedRef.current) {
        ctrlPressedRef.current = true;
        // 保存当前状态并全部开启
        prevStateRef.current = {
          xy: editor.frameControlSync.xy,
          rotation: editor.frameControlSync.rotation,
          width_height: editor.frameControlSync.width_height,
        };
        editor.frameControlSync.xy = true;
        editor.frameControlSync.rotation = true;
        editor.frameControlSync.width_height = true;
        forceUpdate();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        ctrlPressedRef.current = false;
        // 恢复之前的状态
        if (prevStateRef.current) {
          editor.frameControlSync.xy = prevStateRef.current.xy;
          editor.frameControlSync.rotation = prevStateRef.current.rotation;
          editor.frameControlSync.width_height = prevStateRef.current.width_height;
          prevStateRef.current = null;
          forceUpdate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <>
      <Popover
        position="top"
        content={
          <div className={styles.frameSyncContent}>
            <div className={styles.frameItem}>
              <span style={{ marginRight: 8, fontSize: 12 }}>XY帧同步</span>
              <Switch
                checked={editor.frameControlSync.xy}
                onChange={e => {
                  editor.frameControlSync.xy = e;
                  forceUpdate();
                }}
              />
            </div>
            <div className={styles.frameItem}>
              <span style={{ marginRight: 8, fontSize: 12 }}>Rotation帧同步</span>
              <Switch
                checked={editor.frameControlSync.rotation}
                onChange={e => {
                  editor.frameControlSync.rotation = e;
                  forceUpdate();
                }}
              />
            </div>
            <div className={styles.frameItem}>
              <span style={{ marginRight: 8, fontSize: 12 }}>Size帧同步</span>
              <Switch
                checked={editor.frameControlSync.width_height}
                onChange={e => {
                  editor.frameControlSync.width_height = e;
                  forceUpdate();
                }}
              />
            </div>
          </div>
        }
      >
        <a className={classNames(styles.btn, styles.enable)}>
          <Sync theme="outline" size="18" fill="var(--theme-icon)" />
        </a>
      </Popover>
      {/*  */}
    </>
  );
};

export default FrameSync;
