import styles from './sliderinput.module.less';
import { InputNumber, Slider } from '@douyinfe/semi-ui';
import { SliderProps } from '@douyinfe/semi-foundation/lib/es/slider/foundation';

export interface IProps {
  suffix?: string;
  value?: number;
  step?: number;
  max?: number;
  min?: number;
  inputNumberNoMinMax?: boolean;
  disabled?: boolean;
  onChange?: (v: number) => void;
  onAfterChange?: (v: number) => void;
  sliderProps?: SliderProps;
}

export default function SliderInput(props: IProps) {
  const { suffix, sliderProps, value, onChange, onAfterChange, inputNumberNoMinMax, step, min, max, disabled } = props;
  return (
    <div className={styles.sliderinput}>
      <div className={styles.slider}>
        <Slider
          {...sliderProps}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onMouseUp={onAfterChange}
          step={step}
          max={max}
          min={min}
        />
      </div>
      <div className={styles.number}>
        <InputNumber
          disabled={disabled}
          innerButtons
          suffix={suffix}
          value={value}
          onChange={onChange}
          onBlur={e => {
            if (onAfterChange) {
              onAfterChange(Number(e.target.value));
            }
          }}
          step={step}
          {...(inputNumberNoMinMax ? {} : { min, max })}
        />
      </div>
    </div>
  );
}
