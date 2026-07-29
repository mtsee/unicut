import Source from '@pages/editor/common/source';
import styles from './effect.module.less';
import { util } from '@utils/index';
import { stores } from '@stores/index';
// import { editor } from '@stores/index';
// import { addEffectItem } from '../addItem';

export interface IProps {
  show: boolean;
}

export default function Effect(props: IProps) {
  const { editor } = stores;
  if (!props.show) {
    return null;
  }

  return (
    <Source
      type="effect"
      item={d => {
        return (
          <>
            <img style={{ width: '100%', height: '100%' }} src={editor.movie.reURL(d.urls?.thumb)} />
            <span className={styles.name}>{d.name}</span>
          </>
        );
      }}
      itemClassName={styles.imgItem}
      // addItem={addEffectItem}
    />
  );
}
