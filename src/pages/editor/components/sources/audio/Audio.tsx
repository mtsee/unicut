import Source from '@pages/editor/common/source';
import styles from './audio.module.less';
import { observer } from 'mobx-react';
import AudioItem from './AudioItem';
// import { addImageVideoAudioItem } from '../addItem';

function Audio() {

  return (
    <Source
      type="audio"
      item={d => {
        return <AudioItem item={d} />;
      }}
      itemClassName={styles.audioItem + ' audioSourceItem'}
      // addItem={addImageVideoAudioItem}
    />
  );
}

export default observer(Audio);
