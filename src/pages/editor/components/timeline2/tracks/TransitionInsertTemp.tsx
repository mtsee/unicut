import { speedHelper } from 'video-core-sdk';
import type { BaseElement } from 'video-core-sdk';
import { observer } from 'mobx-react';
import React from 'react';
import styles from './element.module.less';
import { transitionIcon } from './icon';
import { stores } from '@stores/index';

type Props = {
  element: BaseElement;
  scale: number;
  hasTranstion: boolean;
};

const TransitionInsertTemp = (props: Props) => {
  const { editor } = stores;
  const { element, scale, hasTranstion } = props;
  const speed = speedHelper.videoAvgSpeed(element as any);
  const transitionElementDuration = 1;
  if (hasTranstion) {
    return null;
  }
  if (editor.transitionCanInsertTemp.includes(element.id)) {
    return (
      <div
        data-inserttransition={1}
        data-elementid={element.id}
        className={styles.transitionInsertTemp}
        style={{
          left: (element.startTime + element.duration / speed) * scale - (scale * transitionElementDuration) / 2,
          width: scale * transitionElementDuration,
        }}
      >
        {transitionIcon}
      </div>
    );
  }
  return null;
};

export default observer(TransitionInsertTemp);
