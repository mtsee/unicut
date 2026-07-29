import styles from './transition.module.less';
import Item from '../item';
import { observer } from 'mobx-react';
import { useReducer } from 'react';
import type { TransitionItem } from 'video-core-sdk';
import SliderInput from '../slider-input';
import { utils } from 'video-core-sdk';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {}
function Transition(props: IProps) {
  const { editor } = stores;
  const [sid] = editor.selectedElementIds;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.movie.data.transitions.find(d => d.id === sid) as TransitionItem;
  const target = document.querySelector(`div[data-keyid="${elementData.id}"]`) as HTMLDivElement;
  const maxDuration = Number(target?.dataset.min || 5);
  editor.updateKey;
  return (
    <>
      <Item title={language.val('option_transition_name')}>
        <div className={styles.name}>{elementData.name}</div>
      </Item>
      <Item title={language.val('option_transition_duration')}>
        <SliderInput
          value={elementData.duration}
          onChange={v => {
            elementData.duration = v;
            editor.updateTimelineElement();
            forceUpdate();
          }}
          onAfterChange={() => {
            elementData._dirty = utils.createID();
            editor.updateMovie();
            editor.updateTimeline();
            editor.record({
              type: 'elements_update',
              desc: '修改转场时长',
              data: [elementData as any],
            });
          }}
          key={maxDuration}
          suffix="s"
          step={0.1}
          min={0.1}
          max={maxDuration}
        />
      </Item>
    </>
  );
}

export default observer(Transition);
