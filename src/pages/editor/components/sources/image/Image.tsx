import Source from '@pages/editor/common/source';
import styles from './image.module.less';
import { addImageVideoAudioItem } from '../addItem';
import { util } from '@utils/index';
import { stores } from '@stores/index';

export interface IProps {
  show: boolean;
}

// 判断是否加载了，只加载一次
let hasRender = false;

export default function Image(props: IProps) {
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
    </div>
  );
}
