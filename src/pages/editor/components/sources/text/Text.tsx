import Source from '@pages/editor/common/source';
import styles from './text.module.less';
import { addTextItem } from '../addItem';
import { util } from '@utils/index';
import { stores } from '@stores/index';

export interface IProps {
  show: boolean;
}

export default function Text(props: IProps) {
  const { editor } = stores;
  if (!props.show) {
    return null;
  }

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
