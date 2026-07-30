import Source from '@pages/editor/common/source';
import styles from './filter.module.less';
import { util } from '@utils/index';
import { stores } from '@stores/index';

// import { addFilterItem } from '../addItem';

export default function Filter() {
  const { editor } = stores;

  return (
    <Source
      type="filter"
      item={d => {
        return (
          <>
            <img src={editor.movie.reURL(d.urls?.thumb)} />
            <span className={styles.name}>{d.name}</span>
          </>
        );
      }}
      itemClassName={styles.imgItem}
      // addItem={addFilterItem}
    />
  );
}
