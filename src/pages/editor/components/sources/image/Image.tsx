import Source from '@pages/editor/common/source';
import styles from './image.module.less';
import { addImageVideoAudioItem } from '../addItem';
import { util } from '@utils/index';
import { stores } from '@stores/index';

export default function Image() {
  const { editor } = stores;

  return (
    <Source
      type="image"
      item={d => {
        if (d.urls.url.indexOf('.gif') !== -1) {
          return <img src={editor.movie.reURL(d.urls.url)} />;
        }
        return <img src={editor.movie.reURL(d.urls?.thumb)} />;
      }}
      itemClassName={styles.imgItem}
      // addItem={addImageVideoAudioItem}
    />
  );
}
