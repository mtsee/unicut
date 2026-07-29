import Source from '@pages/editor/common/source';
import styles from './video.module.less';
import { utils } from 'video-core-sdk';
import { addImageVideoAudioItem } from '../addItem';
import { util } from '@utils/index';
import { stores } from '@stores/index';

export interface IProps {
  show: boolean;
}
let hasRender = false;

export default function Video(props: IProps) {
  const { editor } = stores;
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
        type="video"
        item={d => {
          return (
            <>
              <i className={styles.time}>{utils.secToTime(d.attrs?.duration || 0, 'mm:ss')}</i>
              <img src={editor.movie.reURL(d.urls?.thumb)} />
            </>
          );
        }}
        itemClassName={styles.videoItem}
        // addItem={addImageVideoAudioItem}
      />
    </div>
  );
}
