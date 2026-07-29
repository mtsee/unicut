import Source from '@pages/editor/common/source';
import styles from './filter.module.less';
import { util } from '@utils/index';
import { stores } from '@stores/index';

// import { addFilterItem } from '../addItem';

export interface IProps {
  show: boolean;
}

export default function Filter(props: IProps) {
  const { editor } = stores;
  if (!props.show) {
    return null;
  }

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
