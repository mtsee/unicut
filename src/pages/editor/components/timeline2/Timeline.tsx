import React, { useEffect, useRef } from 'react';
import styles from './timeline.module.less';
import Toolbar from './toolbar/Toolbar';
import Tracks from './tracks/Tracks';
import { config } from './config';
import $ from 'jquery';

type Props = {};

const Timeline = (props: Props) => {
  const ref = useRef<HTMLDivElement>();
  useEffect(() => {
    // 主题样式
    $(ref.current).css({
      '--theme-videoTrack': config.videoTrack + 'px',
      '--theme-imageTrack': config.imageTrack + 'px',
      '--theme-audioTrack': config.audioTrack + 'px',
      '--theme-effectTrack': config.effectTrack + 'px',
      '--theme-filterTrack': config.filterTrack + 'px',
      '--theme-textTrack': config.textTrack + 'px',
      '--theme-textColor': config.textColor,
      '--theme-audioColor': config.audioColor,
      '--theme-echartColor': config.echartColor,
      '--theme-effectColor': config.effectColor,
      '--theme-filterColor': config.filterColor,
      '--theme-imageColor': config.imageColor,
      '--theme-videoColor': config.videoColor,
      '--theme-borderColor': config.borderColor,
      '--theme-magnetLineColor': config.magnetLineColor,
    } as any);
  }, []);

  return (
    <div ref={ref} className={styles.timeline}>
      <Toolbar />
      <Tracks />
    </div>
  );
};

export default Timeline;
