import styles from './colour.module.less';
import { useCallback, useState } from 'react';
import { useReducer } from 'react';
import { observer } from 'mobx-react';
import { utils } from 'video-core-sdk';
import type { ImageElement } from 'video-core-sdk';
import { RadioGroup, Radio } from '@douyinfe/semi-ui';
import { stores } from '@stores/index';
import BasicFilter from './BasicFilter';
import LutFilter from './LutFilter';

export interface IProps {}
function Colour(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as ImageElement;
  const [filterType, setFilterType] = useState<string>('basic');

  const getValue = useCallback(
    (name: string): number => {
      if (!elementData.filters) {
        elementData.filters = [];
      }
      const filter = elementData.filters.find(d => d.name === name);
      if (filter) {
        return filter.params.value;
      }
      return 0;
    },
    [elementData.filters],
  );

  const changeValue = useCallback(
    (v: number, name: string, defaultValue?: number) => {
      if (!elementData.filters) {
        elementData.filters = [];
      }
      if (defaultValue === undefined) {
        defaultValue = 0;
      }
      v = Number(v);
      const filter = elementData.filters.find(d => d.name === name);
      if (filter) {
        filter.params.value = v;
        filter.enabled = v === defaultValue ? false : true;
      } else {
        elementData.filters.push({
          name,
          enabled: v === defaultValue ? false : true,
          params: { value: v },
        });
      }
      elementData._filtersDirty = utils.createID();
      editor.updateMovie();
      forceUpdate();
    },
    [elementData.filters],
  );

  return (
    <div className={styles.colour + ' scroll'}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <RadioGroup
          type="button"
          buttonSize="small"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ justifyContent: 'center', marginBottom: 8 }}
        >
          <Radio value="basic">基础滤镜</Radio>
          <Radio value="lut">lut滤镜</Radio>
        </RadioGroup>
      </div>
      {filterType === 'basic' ? (
        <BasicFilter elementData={elementData} getValue={getValue} changeValue={changeValue} />
      ) : (
        <LutFilter editor={editor} elementData={elementData} forceUpdate={forceUpdate} />
      )}
    </div>
  );
}

export default observer(Colour);
