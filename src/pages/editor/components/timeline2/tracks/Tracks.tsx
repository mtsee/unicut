import React from 'react';
import styles from './tracks.module.less';
import TrackTime from './TrackTime';
import TrackBodys from './TrackBodys';
import { observer } from 'mobx-react';
import { Spin } from '@douyinfe/semi-ui';
import { stores } from '@stores/index';

type Props = {};

const Tracks = (props: Props) => {
  const { editor } = stores;
  console.log('强制更新------>');
  return (
    <div className={styles.tracks}>
      {editor.globalLoading && (
        <div className={styles.spinning}>
          <Spin tip="loading..." />
        </div>
      )}
      <TrackTime />
      <TrackBodys key={editor.trackBodysKey} />
    </div>
  );
};

export default observer(Tracks);
