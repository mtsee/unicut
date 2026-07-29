import { observer } from 'mobx-react';
import styles from './audio.module.less';
import { useReducer, useRef, useState } from 'react';
import { Play, PauseOne } from '@icon-park/react';
import { utils } from 'video-core-sdk';
import $ from 'jquery';
import { stores } from '@stores/index';
import { config } from '@config/index';

export interface IProps {
  item: any; // {id, name, attrs: {duration}, urls: {url }}
}

function AudioItem(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const item = props.item;
  const ref = useRef();
  const [x, setX] = useState(0);
  editor.audioProgress;

  const isActive = editor.audioSelectedId === item.id;

  return (
    <div
      className={styles.item}
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        editor.setAudioProgress(x);
      }}
      onMouseEnter={(e: any) => {
        if (isActive) {
          const offset = $(ref.current).offset();
          const width = $(ref.current).width();
          setX((e.pageX - offset.left) / width);
          $(ref.current).off('mousemove').on('mousemove', em => {
            setX((em.pageX - offset.left) / width);
          });
        }
      }}
      onMouseLeave={e => {
        if (isActive) {
          $(ref.current).off('mousemove');
          setX(0);
        }
      }}
    >
      <a
        className={styles.btn}
        onClick={e => {
          e.stopPropagation();
          editor.duration = item.attrs.duration;
          if (editor.audioSelectedId === item.id) {
            if (!editor.audioSelectedId) {
              editor.audioSelectedId = item.id;
              editor.audioURL = utils.reURL(item.urls.url, config.resourcesHost);
              editor.audioPlay();
            } else {
              editor.audioStop();
            }
          } else {
            editor.audioPause();
            editor.audioSelectedId = item.id;
            editor.audioURL = utils.reURL(item.urls.url, config.resourcesHost);
            editor.audioPlay();
          }
          // 点击播放时手动绑定 mousemove 监听并设置初始位置
          if (ref.current) {
            const offset = $(ref.current).offset();
            const width = $(ref.current).width();
            setX((e.pageX - offset.left) / width);
            $(ref.current).off('mousemove').on('mousemove', em => {
              setX((em.pageX - offset.left) / width);
            });
          }
          forceUpdate();
        }}
      >
        {isActive ? (
          <PauseOne theme="outline" size="30" fill="var(--theme-icon)" />
        ) : (
          <Play theme="outline" size="30" fill="var(--theme-icon)" />
        )}
      </a>
      <div className={styles.right}>
        <span className={styles.name}>{item.name}</span>
        <span className={styles.time}>{utils.secToTime(item.attrs.duration, 'mm:ss')}</span>
      </div>
      {isActive && <span className={styles.progress} style={{ width: `${editor.audioProgress * 100}%` }}></span>}
      {isActive && !!x && <span className={styles.line} style={{ left: x * 100 + '%' }}></span>}
    </div>
  );
}
export default observer(AudioItem);
