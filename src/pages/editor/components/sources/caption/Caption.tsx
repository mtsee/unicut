import React from 'react';
import styles from './caption.module.less';
import Captions from './captions';

export default function Caption() {
  return (
    <div className={styles.caption}>
      <Captions />
    </div>
  );
}
