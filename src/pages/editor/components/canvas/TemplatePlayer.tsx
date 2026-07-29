import styles from './player.module.less';
import { Play, PauseOne, Down, Help, FullScreen } from '@icon-park/react';
import { observer } from 'mobx-react';
import { useEffect, useReducer, useState } from 'react';
import { Slider } from '@douyinfe/semi-ui';
import { helper, utils } from 'video-core-sdk';
import { pubsub } from '@utils/pubsub';
import { stores } from '@stores/index';
import { util } from '@utils/index';

export interface IProps {}

function TemplatePlayer(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  editor.playing;
  editor.totalTimeKey;

  useEffect(() => {
    pubsub.subscribe('keyboardPlayPasue', () => {
      if (editor.movie?.playing) {
        editor.pause();
      } else {
        editor.play();
      }
    });
    return () => {
      pubsub.unsubscribe('keyboardPlayPasue');
    };
  }, []);

  const totalTime = editor.movie.getTotalTime();

  return (
    <div className={styles.bottom + ' ' + styles.templatePlayer}>
      <div className={styles.bottomInner}>
        <span className={styles.times}>
          <i>{utils.secToTime(editor.currentTime, 'hh:mm:ss')}</i>
          <Slider
            key={totalTime}
            value={editor.currentTime}
            onChange={v => {
              editor.currentTime = v as number;
            }}
            step={0.1}
            max={totalTime}
            min={0}
            tooltipVisible={false}
            style={{ width: '100%' }}
          />
          <i className={styles.total}>{utils.secToTime(totalTime, 'hh:mm:ss')}</i>
        </span>
        <span className={styles.player}>
          {editor.movie.playing ? (
            <a
              onClick={() => {
                editor.pause();
              }}
            >
              <PauseOne theme="filled" size="24" fill="var(--theme-main)" />
            </a>
          ) : (
            <a
              onClick={() => {
                const totalTime = editor.movie.getTotalTime();
                if (util.timeToNum(editor.currentTime) >= util.timeToNum(totalTime)) {
                  editor.currentTime = 0;
                }
                setTimeout(() => {
                  editor.play();
                }, 100);
              }}
            >
              <Play theme="filled" size="24" fill="var(--theme-main)" />
            </a>
          )}
        </span>
      </div>
    </div>
  );
}

export default observer(TemplatePlayer);
