import { observer } from 'mobx-react';
import styles from './audio.module.less';
import { audios } from '@stores/audios';
import { useReducer, useRef, useState } from 'react';
import { Play, PauseOne } from '@icon-park/react';
import $ from 'jquery';
import { util } from '@utils/index';
import classNames from 'classnames';

export interface IProps {
  item: any;
  noName?: boolean;
}

function AudioItem(props: IProps) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const item = props.item;
  const ref = useRef();
  const [x, setX] = useState(0);
  audios.progress;

  const isActive = audios.selectedId === item.id;

  const [name, ext] = item.name.split('.');
  return (
    <div
      className={classNames(styles.item, styles.audioItem, 'audioSourceItem')}
      ref={ref}
      onClick={() => {
        audios.setProgress(x);
      }}
      onMouseEnter={(e: any) => {
        if (isActive) {
          const offset = $(ref.current).offset();
          const width = $(ref.current).width();
          setX((e.pageX - offset.left) / width);
          $(ref.current).on('mousemove', em => {
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
          audios.duration = item.attrs.duration;
          if (audios.selectedId === item.id) {
            if (!audios.selectedId) {
              audios.selectedId = item.id;
              audios.audioURL = item.urls.url;
              audios.play();
            } else {
              audios.stop();
            }
          } else {
            audios.pause();
            audios.selectedId = item.id;
            audios.audioURL = item.urls.url;
            audios.play();
          }
          forceUpdate();
        }}
      >
        {isActive ? (
          <PauseOne theme="filled" size="30" fill="#8B20FB" />
        ) : (
          <Play theme="filled" size="30" fill="#8B20FB" />
        )}
      </a>
      <div className={styles.right}>
        {!props.noName && (
          <span className={styles.name}>
            {name.length > 10 ? name.substr(0, 10) + '...' : name}
            <em className={styles.ext}>{ext}</em>
          </span>
        )}
      </div>
      {isActive && <span className={styles.progress} style={{ width: `${audios.progress * 100}%` }}></span>}
      {isActive && !!x && <span className={styles.line} style={{ left: x * 100 + '%' }}></span>}
    </div>
  );
}
export default observer(AudioItem);
