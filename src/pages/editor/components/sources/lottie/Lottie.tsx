import Source from '@pages/editor/common/source';
import styles from './lottie.module.less';
import { addLottieItem } from '../addItem';
import LottieItem from './LottieItem';

export interface IProps {
  show: boolean;
}

// 判断是否加载了，只加载一次
let hasRender = false;

export default function Lottie(props: IProps) {
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
        type="sticker"
        item={d => {
          // console.log(d);
          return <LottieItem item={d} />;
        }}
        itemClassName={styles.imgItem}
        // addItem={addLottieItem}
      />
    </div>
  );
}
