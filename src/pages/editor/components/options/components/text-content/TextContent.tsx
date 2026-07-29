import styles from './textcontent.module.less';
import Item from '../item';
import { TextArea } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import { useReducer } from 'react';
import type { TextElement } from 'video-core-sdk';
import { language } from '@language/language';
import { stores } from '@stores/index';
// import { utils } from 'video-core-sdk';

export interface IProps {}
function TextContent(props: IProps) {
  const { editor } = stores;
  editor.timelineUpdateElementKey;
  console.log("?????")
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as TextElement;
  return (
    <Item
      title={
        <span
          onClick={() => {
            console.log(JSON.stringify(elementData.textStyle));
          }}
        >
          {language.val('option_text')}
        </span>
      }
      style={{ margin: '6px 20px' }}
    >
      <div className={styles.texts}>
        <TextArea
          value={elementData.text}
          onChange={e => {
            elementData.text = e;
            editor.updateOption();
            editor.updateMovie();
            forceUpdate();
          }}
          autosize
          maxCount={100}
          onBlur={() => {
            editor.updateOption();
            editor.record({
              type: 'elements_update',
              desc: '修改文本内容',
              data: [elementData],
            });
          }}
        />
      </div>
    </Item>
  );
}

export default observer(TextContent);
