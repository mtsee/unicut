import styles from './startFrameNumber.module.less';
import Item from '../item';
import { InputNumber, Radio, RadioGroup, Slider, Switch } from '@douyinfe/semi-ui';
import { useReducer } from 'react';
import { observer } from 'mobx-react';
import { stores } from '@stores/index';
import { language } from '@language/language';
import type { ImageElement } from 'video-core-sdk';

export interface IProps {}

function StartFrameNumber(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as ImageElement;
  const resource = editor.movie.resourceManage.getResouceById(elementData.resourceId);

  if (!elementData.playFrameDuration) {
    elementData.playFrameDuration = resource.duration;
  }

  return (
    <>
      {elementData.isApng && (
        <Item
          title={
            <>
              循环
              <span
                style={{ fontSize: 12, marginLeft: 5, opacity: 0.6, fontWeight: 'normal' }}
              >{`${elementData.startFrameDuration || 0}~${(elementData.playFrameDuration || resource.duration || 0).toFixed(1)}s 
              [${(elementData.playFrameDuration - elementData.startFrameDuration || resource.duration || 0).toFixed(1)}s]`}</span>
            </>
          }
        >
          <div className={styles.startFrameNumber}>
            <Slider
              defaultValue={[
                elementData.startFrameDuration || 0,
                elementData.playFrameDuration || resource.duration || 0,
              ]}
              step={0.01}
              min={0}
              style={{ width: 250 }}
              max={resource.duration || 0}
              range
              handleDot={[
                { size: '4px', color: 'blue' },
                { size: '4px', color: 'pink' },
              ]}
              onChange={(v: any) => {
                elementData.startFrameDuration = v[0];
                elementData.playFrameDuration = v[1];
                forceUpdate();
                editor.updateMovie();
              }}
            ></Slider>
          </div>
        </Item>
      )}
    </>
  );
}

export default observer(StartFrameNumber);
