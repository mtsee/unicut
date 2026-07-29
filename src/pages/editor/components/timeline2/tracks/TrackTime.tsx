import React from 'react';
import styles from './tracks.module.less';
import Ruler from './Ruler';
import { stores } from '@stores/index';

type Props = {};

const TrackTime = (props: Props) => {
  const { editor } = stores;
  const captions = editor.data.captions;
  const noElement = captions.length === 0 && editor.data.elements.length === 0;
  return (
    <div className={styles.trackTime}>
      <Ruler scrollx={0} noElement={noElement} />
    </div>
  );
};

export default TrackTime;
