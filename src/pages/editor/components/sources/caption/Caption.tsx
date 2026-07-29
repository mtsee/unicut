import React from 'react';
import styles from './caption.module.less';
import Captions from './captions';

export interface IProps {
  show: boolean;
}

export default function Caption(props: IProps) {
  if (!props.show) {
    return null;
  }
  return (
    <div className={styles.caption}>
      <Captions />
    </div>
  );
}
