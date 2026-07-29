import styles from './filter.module.less';
import Item from '../item';

import { observer } from 'mobx-react';

export interface IProps {}
export default function Filter(props: IProps) {
  return (
    <Item title="滤镜">
      <div className={styles.opacity}>Filter</div>
    </Item>
  );
}
