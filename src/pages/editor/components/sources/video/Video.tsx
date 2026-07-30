import Source from '@pages/editor/common/source';
import styles from './video.module.less';
import { utils } from 'video-core-sdk';
import { addImageVideoAudioItem } from '../addItem';
import { util } from '@utils/index';
import { stores } from '@stores/index';

export default function Video() {
  const { editor } = stores;

  return (
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
  );
}
