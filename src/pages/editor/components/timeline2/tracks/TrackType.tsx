import React, { useReducer } from 'react';
import styles from './tracks.module.less';
import { utils } from 'video-core-sdk';
import type {
  BaseElement,
  // AudioElement,
  CameraElement,
  CaptionElement,
  // ImageElement,
  // VideoElement,
} from 'video-core-sdk';
// import classNames from 'classnames';
import { config } from '../config';
// import Element from './Element';
import { observer } from 'mobx-react';
import { PreviewOpen, Unlock, Lock, PreviewCloseOne, Components, Magnet } from '@icon-park/react';
import { Tooltip } from '@douyinfe/semi-ui';
import { language } from '@language/language';
import { stores } from '@stores/index';
import { config as globalConfig } from '@config/index';

type Props = {
  groups: BaseElement[][];
  captionTracks: CaptionElement[][];
  cameraTracks: CameraElement[][];
  // mainTracks: (VideoElement | ImageElement)[][];
};

const ViewHide = props => {
  const { forceUpdate, elem0 } = props;
  const { editor } = stores;

  if (!elem0) {
    return (
      <>
        <a></a>
        <a></a>
      </>
    );
  }

  const trackIndex = elem0.trackIndex;
  if (!editor.data._hideLock[trackIndex]) {
    editor.data._hideLock[trackIndex] = { hide: false, lock: false };
  }
  const hideLockOption = editor.data._hideLock[trackIndex];

  return (
    <>
      <a
        title="锁定"
        onClick={() => {
          hideLockOption.lock = !hideLockOption.lock;
          editor.movie.updateControl('trigger', []);
          editor.updateTimeline();
          editor.updateMovie();
          forceUpdate();
        }}
      >
        {hideLockOption.lock ? (
          <Lock style={{ opacity: 0.5 }} theme="outline" size="14" fill="var(--theme-icon)" />
        ) : (
          <Unlock theme="outline" size="14" fill="var(--theme-icon)" />
        )}
      </a>
      <a
        title="隐藏/可见"
        onClick={() => {
          hideLockOption.hide = !hideLockOption.hide;
          editor.movie.updateControl('trigger', []);
          editor.updateTimeline();
          editor.updateMovie();
          forceUpdate();
        }}
      >
        {hideLockOption.hide ? (
          <PreviewCloseOne style={{ opacity: 0.5 }} theme="outline" size="14" fill="var(--theme-icon)" />
        ) : (
          <PreviewOpen theme="outline" size="14" fill="var(--theme-icon)" />
        )}
      </a>
    </>
  );
};

const TrackType = (props: Props) => {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const { groups, captionTracks, cameraTracks } = props;
  return (
    <div className={styles.trackType} style={{ width: config.sideWidth }}>
      <div className={styles.trackTypeInner} style={{ transform: `translateY(${-editor.timelineTrackScrollTop}px)` }}>
        {cameraTracks.map((track, index) => {
          return (
            <div key={index} className={styles.trackTypeItem} style={{ height: config.cameraTrack }}>
              <Tooltip content={language.val('timeline_cameraTrack')}>
                <a>{config.cameraIcon}</a>
              </Tooltip>
              <ViewHide elem0={track[0]} forceUpdate={forceUpdate} />
            </div>
          );
        })}
        {captionTracks.map((track, index) => {
          return (
            <div key={index} className={styles.trackTypeItem} style={{ height: config.captionTrack }}>
              <Tooltip content={language.val('timeline_captionTrack')}>
                <a>{config.captionIcon}</a>
              </Tooltip>
              <ViewHide elem0={track[0]} forceUpdate={forceUpdate} />
            </div>
          );
        })}
        {groups.map((track, index) => {
          const elem0 = track[0];
          const height = elem0 ? config[`${elem0?.type}Track`] || 24 : 24;
          return (
            <div
              className={styles.trackTypeItem}
              style={{ height }}
              key={utils.betterHash(track.map(d => d.id).join('-'))}
            >
              <a
                title="吸附"
                onClick={() => {
                  // 点击磁铁图标，将该轨道元素的间隙去掉
                  let nextStartTime = track[0].startTime || 0;
                  track.forEach((d, i) => {
                    d.startTime = nextStartTime;
                    const speed = (d as any).speed || 1;
                    nextStartTime = utils.timeToNum(d.startTime + d.duration / speed) + 0.01; // 0.01精度
                  });
                  editor.updateTimeline();
                  editor.updateMovie();
                  forceUpdate();
                }}
              >
                <Magnet theme="outline" size="16" fill="var(--theme-icon)" />
              </a>
              {/* <a>{config[`${elem0.type}Icon`] || <Components theme="outline" size="16" fill="var(--theme-icon)" />}</a> */}
              <ViewHide elem0={track[0]} forceUpdate={forceUpdate} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default observer(TrackType);
