import React from 'react';
import { curveSpeedMock } from './curveSpeedMock';
import { util } from '@utils/index';
import styles from './curveSpeed.module.less';

type Props = {
  onChange: (d: { name: string; points: { x: number; y: number; id: string }[] }) => void;
};

const CurveSpeedItems = (props: Props) => {
  return (
    <div className={styles.curveSpeedItems}>
      {curveSpeedMock.map((d: any) => {
        return (
          <section
            key={d.name}
            onClick={() => {
              props.onChange(util.toJS(d));
            }}
          >
            {d.name}
          </section>
        );
      })}
    </div>
  );
};

export default CurveSpeedItems;
