import React, { useState } from 'react';
import styles from './styles.module.less';
import { InputNumber } from '@douyinfe/semi-ui';
import { utils } from 'video-core-sdk';
import Item from '../item';
import { Square, Extend } from '@icon-park/react';
import classNames from 'classnames';

export interface IProps {
  title: string;
  value: [number, number, number, number];
  onChange: (d: [number, number, number, number]) => void;
}

export default function InputNumber4(props: IProps) {
  const [values, setValues] = useState(props.value);
  const [v1, v2, v3, v4] = values;
  const changeNumber = (v, n) => {
    if (n === 4) {
      values[0] = v;
      values[1] = v;
      values[2] = v;
      values[3] = v;
    } else {
      values[n] = v;
    }
    setValues([...values]);
  };
  const [radiusType, setRadiusType] = useState(1);

  return (
    <Item
      title={props.title}
      extra={
        <div className={styles.radiuType}>
          <>
            <a
              onClick={() => {
                setRadiusType(1);
              }}
              className={classNames({
                [styles.active]: radiusType === 1,
              })}
            >
              <Square theme="outline" size="16" fill="var(--theme-icon)" />
            </a>
            <a
              className={classNames({
                [styles.active]: radiusType === 2,
              })}
              style={{ marginRight: 10 }}
              onClick={() => {
                setRadiusType(2);
              }}
            >
              <Extend theme="outline" size="16" fill="var(--theme-icon)" />
            </a>
          </>
        </div>
      }
    >
      {radiusType === 1 && (
        <InputNumber
          style={{ width: '100%' }}
          onChange={e => changeNumber(utils.toNum(Number(e)), 4)}
          value={utils.toNum(v1)}
          innerButtons
          onBlur={() => {
            props.onChange(values);
          }}
        />
      )}
      {radiusType === 2 && (
        <div className={styles.boxs}>
          <div className={styles.box1}>
            <InputNumber
              onChange={e => changeNumber(utils.toNum(Number(e)), 0)}
              value={utils.toNum(v1)}
              innerButtons
              onBlur={() => {
                props.onChange(values);
              }}
            />
          </div>
          <div className={styles.box2}>
            <InputNumber
              onChange={e => changeNumber(utils.toNum(Number(e)), 1)}
              value={utils.toNum(v2)}
              innerButtons
              onBlur={() => {
                props.onChange(values);
              }}
            />
          </div>
          <div className={styles.box3}>
            <InputNumber
              onChange={e => changeNumber(utils.toNum(Number(e)), 2)}
              value={utils.toNum(v3)}
              innerButtons
              onBlur={() => {
                props.onChange(values);
              }}
            />
          </div>
          <div className={styles.box4}>
            <InputNumber
              onChange={e => changeNumber(utils.toNum(Number(e)), 3)}
              value={utils.toNum(v4)}
              innerButtons
              onBlur={() => {
                props.onChange(values);
              }}
            />
          </div>
          <div className={styles.linebox}></div>
        </div>
      )}
    </Item>
  );
}
