import Source from '@pages/editor/common/source';
import styles from './transition.module.less';
import { addTransitionItem } from '../addItem';
import { util } from '@utils/index';
import { stores } from '@stores/index';

export interface IProps {
  show: boolean;
}
let hasRender = false;

export default function Transition(props: IProps) {
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
    </div>
  );
}
