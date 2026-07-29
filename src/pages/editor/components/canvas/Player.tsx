import styles from './player.module.less';
import { Play, PauseOne, Down, Help, FullScreen } from '@icon-park/react';
import { observer } from 'mobx-react';
import { useEffect, useReducer, useState } from 'react';
import { Popover } from '@douyinfe/semi-ui';
import { helper, utils } from 'video-core-sdk';
import { pubsub } from '@utils/pubsub';
import { stores } from '@stores/index';

export interface IProps {}

function Player(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  editor.playing;
  editor.totalTimeKey;

  useEffect(() => {
    pubsub.subscribe('keyboardPlayPasue', () => {
      if (editor.movie.playing) {
        editor.pause();
      } else {
        editor.play();
      }
    });
    return () => {
      pubsub.unsubscribe('keyboardPlayPasue');
    };
  }, []);

  return (
    <div className={styles.bottom}>
      <div className={styles.bottomInner}>
        <span className={styles.times}>
          <i>{utils.secToTime(editor.currentTime, 'hh:mm:ss')}</i> /{' '}
          <i className={styles.total}>{utils.secToTime(editor.movie.getTotalTime(), 'hh:mm:ss')}</i>
        </span>
        <span className={styles.player}>
          {editor.movie.playing ? (
            <a
              onClick={() => {
                editor.pause();
              }}
            >
              <PauseOne theme="filled" size="32" fill="var(--theme-main)" />
            </a>
          ) : (
            <a
              onClick={() => {
                const totalTime = editor.movie.getTotalTime();
                if (Math.abs(editor.currentTime - totalTime) <= 0.02) {
                  editor.currentTime = 0;
                }
                setTimeout(() => {
                  editor.play();
                }, 100);
              }}
            >
              <Play theme="filled" size="32" fill="var(--theme-main)" />
            </a>
          )}
        </span>
        <span className={styles.other}>
          <Popover
            content={
              <ul className={styles.menus}>
                {['16:9', '9:16', '1:1', '4:3', '3:4', '2:3', '3:2', '21:9'].map(d => {
                  return (
                    <li
                      onClick={() => {
                        // 默认按照1080p
                        const size = helper.geVideoSizeResolution('1080P', d as any);
                        if (size) {
                          const nsize = { width: size.width, height: size.height };
                          // 修改尺寸要自动适配
                          helper.fitVideoSize(editor.data, { ...nsize }, editor.movie.resourceManage);
                          editor.data.width = nsize.width;
                          editor.data.height = nsize.height;
                          editor.data.ratio = d;
                          editor.updateMovie();
                          forceUpdate();
                        }
                      }}
                      key={d}
                    >
                      {d}
                    </li>
                  );
                })}
              </ul>
            }
            position="top"
          >
            <a>
              {editor.data.ratio || '16:9'}&nbsp;&nbsp;
              <Down theme="outline" size="24" fill="var(--theme-icon)" />
            </a>
          </Popover>
          {/* <a href="#">
            <FullScreen theme="filled" size="20" fill="var(--theme-icon)" />
          </a> */}
          {/* <a href="#" className={styles.help}>
            <Help theme="filled" size="30" fill="var(--theme-main)" />
          </a> */}
        </span>
      </div>
    </div>
  );
}

export default observer(Player);
