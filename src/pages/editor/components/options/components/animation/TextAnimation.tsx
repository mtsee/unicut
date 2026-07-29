import styles from './animation.module.less';
import { Select } from '@douyinfe/semi-ui';
import WaterFull from '@components/water-full';
import Item from '../item';
import { useState } from 'react';
import classNames from 'classnames';
import SliderInput from '../slider-input';
import { observer } from 'mobx-react';
import type { AnimationType, ImageElement, TextElement, VideoElement } from 'video-core-sdk';
import { data } from './mock';
import { useReducer } from 'react';
import { utils } from 'video-core-sdk';
import { remove } from 'lodash';
// import CustomAnimation from './CustomAnimation';
import AnimateItemText from './AnimateItemText';
import { eases } from './eases';
import { Help } from '@icon-park/react';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {}

function Animation(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as TextElement;
  const [durationKey, setDurationKey] = useState('1');
  const animationType = 'enter';
  const languageType = language.getLanguage();

  const enterAnimation = elementData.textEnterAnimate;

  // 添加动画，修改动画
  const setAnimate = item => {
    // console.log('item', item);
    if (item.id === 'null') {
      if (elementData.type === 'caption') {
        editor.data.captions.forEach(elem => {
          if (elem.textEnterAnimate) {
            delete elem.textEnterAnimate;
          }
        });
      } else {
        if (elementData.textEnterAnimate) {
          delete elementData.textEnterAnimate;
        }
      }

      forceUpdate();
      elementData._textStyleDirty = utils.createID();
      editor.updateMovie();
      return;
    }

    if (elementData.type === 'caption') {
      editor.data.captions.forEach(elem => {
        if (elem.textEnterAnimate && item.id === elem.textEnterAnimate.oid) {
          if (elem.textEnterAnimate) {
            delete elem.textEnterAnimate;
          }
          forceUpdate();
          elementData._textStyleDirty = utils.createID();
          editor.updateMovie();
          return;
        }
      });
    } else {
      if (elementData.textEnterAnimate && item.id === elementData.textEnterAnimate.oid) {
        if (elementData.textEnterAnimate) {
          delete elementData.textEnterAnimate;
        }
        forceUpdate();
        elementData._textStyleDirty = utils.createID();
        editor.updateMovie();
        return;
      }
    }

    if (elementData.type === 'caption') {
      editor.data.captions.forEach(elem => {
        elem.textEnterAnimate = {
          id: utils.createID(),
          oid: item.id, // 原始数据ID
          type: item.type,
          name: item.name,
          ename: item.ename,
          start: 0, // 动画开始时间
          duration: Math.min(elem.duration, 0.1 * elem.text.length), // 动画总时间
          frames: utils.toJS(item.frames).map(d => {
            // 帧数据
            d.id = utils.createID();
            d._dirty = utils.createID();
            return d;
          }),
        };
      });
    } else {
      elementData.textEnterAnimate = {
        id: utils.createID(),
        oid: item.id, // 原始数据ID
        type: item.type,
        name: item.name,
        ename: item.ename,
        start: 0, // 动画开始时间
        duration: Math.min(elementData.duration, 0.1 * elementData.text.length), // 动画总时间
        frames: utils.toJS(item.frames).map(d => {
          // 帧数据
          d.id = utils.createID();
          d._dirty = utils.createID();
          return d;
        }),
      };
    }
    forceUpdate();
    elementData._textStyleDirty = utils.createID();
    editor.updateMovie();
  };

  const getList = () => {
    const arr = [];
    data.forEach(d => {
      //@ts-ignore
      if (d.type === 'enter') {
        arr.push(d);
      }
    });
    return arr.filter(d => !d.noText);
  };
  const size = 80;

  console.log('elementData', elementData, enterAnimation);

  const thisAnimation = elementData.textEnterAnimate;

  return (
    <div className={styles.animation}>
      <div className={styles.contents + ' scroll'} style={{ height: '100%' }}>
        <Item title={language.val('option_animation_duration')} className={styles.duration}>
          <SliderInput
            step={0.01}
            value={thisAnimation?.duration}
            disabled={!thisAnimation}
            min={0}
            key={durationKey}
            max={elementData.duration}
            onAfterChange={v => {
              setDurationKey(utils.createID());
            }}
            onChange={v => {
              elementData.textEnterAnimate.duration = v;
              elementData.textEnterAnimate = { ...elementData.textEnterAnimate };
              forceUpdate();
              editor.updateMovie();
              editor.updateTimelineElement();
              editor.record({
                type: 'elements_update',
                desc: '设置动画',
                data: [elementData],
              });
            }}
            suffix="s"
          />
        </Item>
        <Item
          title={language.val('option_animation_ease')}
          className={styles.duration}
          extra={
            <a href="https://easings.net/zh-cn" target="_blank">
              <Help theme="outline" size="18" fill="var(--theme-icon)" strokeWidth={3} />
            </a>
          }
        >
          <Select
            disabled={!thisAnimation}
            value={thisAnimation?.ease || 'linear'}
            style={{ width: '100%' }}
            onChange={e => {
              if (elementData.type === 'caption') {
                editor.data.captions.forEach(elem => {
                  elem.textEnterAnimate.ease = e as string;
                  elem.textEnterAnimate = { ...elementData.textEnterAnimate };
                });
              } else {
                elementData.textEnterAnimate.ease = e as string;
                elementData.textEnterAnimate = { ...elementData.textEnterAnimate };
              }

              forceUpdate();
              editor.updateMovie();
              editor.updateTimelineElement();
              editor.record({
                type: 'elements_update',
                desc: '设置动画',
                data: [elementData],
              });
            }}
          >
            {eases.map(n => {
              return (
                <Select.Option key={n} value={n}>
                  {n}
                </Select.Option>
              );
            })}
          </Select>
        </Item>
        <div className={classNames(styles.list, 'scroll')}>
          <WaterFull
            itemWidth={50}
            item={item => (
              <div
                data-id={item.id}
                data-eid={enterAnimation?.oid || 0}
                onClick={() => setAnimate(item)}
                className={classNames(styles.itemText, {
                  [styles.nullItem]: item.id === 'null',
                  [styles.active]: (() => {
                    switch (animationType) {
                      case 'enter':
                        return enterAnimation ? item.id === enterAnimation.oid : false;
                    }
                  })(),
                })}
              >
                <h5 className={styles.name}>{languageType === 'zh-CN' ? item.name : item.ename}</h5>
                {item.id !== 'null' && (
                  <span className={styles.abcText}>
                    <i>A</i>
                    <i>B</i>
                    <i>C</i>
                  </span>
                )}
                <AnimateItemText item={item} />
              </div>
            )}
            list={[
              {
                ename: 'null',
                frames: [],
                id: 'null',
                name: '无动画',
                type: 'enter',
                width: size,
                height: size,
              },
              ...getList().map((d, i) => {
                return {
                  ...d,
                  width: size,
                  height: size,
                };
              }),
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default observer(Animation);
