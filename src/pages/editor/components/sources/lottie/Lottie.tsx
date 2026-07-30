import Source from '@pages/editor/common/source';
import styles from './lottie.module.less';
import { addLottieItem } from '../addItem';
import LottieItem from './LottieItem';

export default function Lottie() {

  return (
    <Source
      type="sticker"
      item={d => {
        // console.log(d);
        return <LottieItem item={d} />;
      }}
      itemClassName={styles.imgItem}
      // addItem={addLottieItem}
    />
  );
}
