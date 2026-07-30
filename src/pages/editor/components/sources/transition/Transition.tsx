import Source from '@pages/editor/common/source';
import styles from './transition.module.less';
import { addTransitionItem } from '../addItem';
import { util } from '@utils/index';
import { stores } from '@stores/index';

export default function Transition() {
  const { editor } = stores;

  return (
    <Source
      type="transition"
      item={d => {
        return (
          <>
            <img src={editor.movie.reURL(d.urls?.thumb)} />
            <span className={styles.name}>{d.name}</span>
          </>
        );
      }}
      itemClassName={styles.imgItem}
      // addItem={addTransitionItem}
    />
  );
}
