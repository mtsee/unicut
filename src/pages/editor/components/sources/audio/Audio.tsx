import Source from '@pages/editor/common/source';
import styles from './audio.module.less';
import { observer } from 'mobx-react';
import AudioItem from './AudioItem';
// import { addImageVideoAudioItem } from '../addItem';

export interface IProps {
  show: boolean;
}
let hasRender = false;

function Audio(props: IProps) {
  if (!hasRender) {
    if (props.show) {
      hasRender = true;
    } else {
      return null;
    }
  }

  return (
    <div style={{ height: '100%', display: props.show ? 'block' : 'none' }}>
      <Source
        type="audio"
        item={d => {
          return <AudioItem item={d} />;
        }}
        itemClassName={styles.audioItem + ' audioSourceItem'}
        // addItem={addImageVideoAudioItem}
      />
    </div>
  );
}

export default observer(Audio);
