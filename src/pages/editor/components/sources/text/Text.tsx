import Source from '@pages/editor/common/source';
import styles from './text.module.less';
import { addTextItem } from '../addItem';
import { util } from '@utils/index';
import { stores } from '@stores/index';

export default function Text() {
  const { editor } = stores;

  return (
    <Source
      type="text"
      item={d => {
        return <img src={editor.movie.reURL(d.urls?.thumb)} />;
      }}
      itemClassName={styles.textItem}
      // addItem={addTextItem}
    />
  );
}
