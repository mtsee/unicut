import styles from './background.module.less';
import Source from '@pages/editor/common/source';
import classNames from 'classnames';
import { useReducer } from 'react';
import { colors } from './colors';
import { splitArray } from '@utils/util';
// import { Sketch } from '@uiw/react-color';
import { Close } from '@icon-park/react';
import { stores } from '@stores/index';
import { observer } from 'mobx-react';
import Color from '../color';
// import ErrorBoundary from '@components/error-boundary';

export interface IProps {}

function Background(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  if (!editor.data.background.color) {
    editor.data.background.color = '#000000';
  }
  return (
    <div className={styles.background + ' scroll'}>
      <h1>
        背景颜色
        <a
          onClick={() => {
            editor.optionPanelCustom = '';
          }}
          className={styles.close}
        >
          <Close theme="outline" size="20" fill="var(--theme-icon)" />
        </a>
      </h1>
      <div className={styles.colorInput}>
        {/* <SketchPicker
          color={editor.data.background.color.toString()}
          onChange={v => {
            editor.data.background.color = v.hex;
            forceUpdate();
            editor.movie.update();
          }}
        /> */}
        <Color
          enableAlpha={true}
          value={editor.data.background.color}
          onChange={v => {
            editor.data.background.color = v.hexa || v.hex;
            forceUpdate();
            editor.movie.update();
          }}
        />
      </div>
      <div className={styles.colors}>
        {colors.map(item => {
          const colorsGroup = splitArray(item.colors, 7);
          return (
            <div key={item.name} className={styles.item}>
              <h2>{item.cname}</h2>
              {colorsGroup.map((arr, i) => {
                return (
                  <ul key={i}>
                    {arr.map(c => {
                      return (
                        <li
                          onClick={() => {
                            editor.data.background.color = c;
                            editor.movie.update();
                            forceUpdate();
                          }}
                          className={classNames(styles.colorItem, {
                            [styles.active]: c === editor.data.background.color,
                          })}
                          key={c}
                          style={{ background: c }}
                        ></li>
                      );
                    })}
                  </ul>
                );
              })}
            </div>
          );
        })}
        {/* {colors.map((arr, i) => {
          return (
            <ul key={i}>
              {arr.map(c => {
                return (
                  <li
                    onClick={() => {
                      editor.data.background.color = c;
                      editor.movie.update();
                      forceUpdate();
                    }}
                    className={classNames(styles.colorItem, {
                      [styles.active]: c === editor.data.background.color,
                    })}
                    key={c}
                    style={{ background: c }}
                  ></li>
                );
              })}
            </ul>
          );
        })} */}
      </div>
      {/* <div className={styles.sources}>
        <Source type="background" />
      </div> */}
    </div>
  );
}

export default observer(Background);
