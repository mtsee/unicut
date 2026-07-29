import styles from './styles.module.less';
import Item from '../item';
import { observer } from 'mobx-react';
import { effectImages } from './data';
import { InputNumber, Select, Slider, Switch } from '@douyinfe/semi-ui';
import { stores } from '@stores/index';
import type { ImageElement } from 'video-core-sdk';
import KeyFrameDot from '../keyframe-dot/KeyFrameDot';
import SliderInput from '../slider-input';
import { useReducer } from 'react';
import { pubsub, util } from '@utils/index';
import Color from '../color';
import { utils } from '@pages/editor/SDK';
import { removeEmptyFrames } from 'video-core-sdk';

export interface IProps {}

function Effects(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as ImageElement;

  // 初始化特效
  if (!elementData.effects) {
    elementData.effects = [];
  }

  editor.currentTime;
  // 如果有帧
  const frameStatus = editor.movie.getFrameStatusByCurrentTime(elementData);
  const frame = editor.movie.getFrameItem(elementData);

  // console.log('effect frame---->', elementData, frameStatus, frame);

  const getEffectItemByName = (name: string) => {
    return elementData.effects.find(d => d.name === name);
  };

  return (
    <Item title="特效">
      <div className={styles.effects}>
        {effectImages.map((item, index) => {
          let effectItem = getEffectItemByName(item.name);
          return (
            <div key={index} className={styles.effect}>
              <div className={styles.effectName}>{item.name}</div>
              <div className={styles.switch}>
                <Switch
                  checked={effectItem?.enabled}
                  onChange={checked => {
                    if (!effectItem) {
                      const params = {};
                      for (let key in item.params) {
                        if (key.indexOf('_') !== -1) {
                          const [key1, key2] = key.split('_');
                          if (!params[key1]) {
                            params[key1] = {};
                          }
                          params[key1][key2] = item.params[key].value;
                        } else {
                          params[key] = item.params[key].value;
                        }
                      }
                      effectItem = {
                        name: item.name,
                        params: params,
                        enabled: checked,
                      };
                      elementData.effects.push(effectItem);
                    }
                    effectItem.enabled = checked;

                    // 关闭特效的时候，去掉特效的帧动画
                    if (!checked) {
                      const effectName = item.name;
                      if (!elementData.frames) {
                        elementData.frames = [];
                      }
                      elementData.frames.forEach(fra => {
                        for (let key of Object.keys(fra)) {
                          if (key.indexOf(`effect_${effectName}`) !== -1) {
                            delete fra[key];
                          }
                        }
                      });
                      // 去掉空的帧
                      removeEmptyFrames(elementData.frames);
                    }

                    elementData._effectsDirty = util.randomID();
                    forceUpdate();
                    editor.updateOption();
                    editor.updateMovie();
                    editor.updateTimeline();
                  }}
                />
              </div>
              <img src={item.image} alt="" />
              {effectItem?.enabled && (
                <div className={styles.options}>
                  {Object.keys(item.params).map((key, index) => {
                    const param = item.params[key];
                    const { range, type, step } = param;

                    // console.log('key', item, key);
                    const keyFrameName = `effect_${item.name}_${key}`;

                    let val =
                      key.indexOf('_') !== -1
                        ? effectItem.params[key.split('_')[0]][key.split('_')[1]]
                        : effectItem.params[key];

                    if (frameStatus && frameStatus[keyFrameName] !== undefined) {
                      val = frameStatus[keyFrameName];
                    }

                    console.log('val', range, step, val);

                    return (
                      <div key={index} className={styles.optionItem}>
                        <span className={styles.optionName}>{key.replace('_', '.')}</span>
                        <div className={styles.valset}>
                          {range && (
                            <>
                              <Slider
                                style={{ width: 110 }}
                                min={range[0]}
                                max={range[1]}
                                step={step}
                                value={val}
                                onChange={value => {
                                  if (frameStatus && frameStatus[keyFrameName] !== undefined) {
                                    if (frame) {
                                      frame[keyFrameName] = value;
                                    } else {
                                      const anime = editor.movie.updateKeyFrame(elementData as any, [keyFrameName]);
                                      editor.frameSelectedId = anime.id;
                                      anime[keyFrameName] = value;
                                    }
                                  } else {
                                    if (key.indexOf('_') !== -1) {
                                      const [key1, key2] = key.split('_');
                                      if (!effectItem.params[key1]) {
                                        effectItem.params[key1] = {};
                                      }
                                      effectItem.params[key1][key2] = value;
                                    } else {
                                      effectItem.params[key] = value;
                                    }
                                  }
                                  forceUpdate();
                                  elementData._effectsDirty = util.randomID();
                                  editor.updateMovie();
                                }}
                                onMouseUp={() => {
                                  elementData._effectsDirty = util.randomID();
                                  editor.updateMovie();
                                  editor.updateOption();
                                  editor.updateTimeline();
                                }}
                              />
                              <InputNumber
                                value={val}
                                size="small"
                                style={{ width: 110 }}
                                min={range[0]}
                                max={range[1]}
                                step={step}
                                onChange={value => {
                                  if (frameStatus && frameStatus[keyFrameName] !== undefined) {
                                    if (frame) {
                                      frame[keyFrameName] = value;
                                    } else {
                                      const anime = editor.movie.updateKeyFrame(elementData as any, [keyFrameName]);
                                      editor.frameSelectedId = anime.id;
                                      anime[keyFrameName] = value;
                                    }
                                  } else {
                                    if (key.indexOf('_') !== -1) {
                                      const [key1, key2] = key.split('_');
                                      if (!effectItem.params[key1]) {
                                        effectItem.params[key1] = {};
                                      }
                                      effectItem.params[key1][key2] = value;
                                    } else {
                                      effectItem.params[key] = value;
                                    }
                                  }
                                  forceUpdate();
                                  elementData._effectsDirty = util.randomID();
                                  editor.updateMovie();
                                }}
                              />
                            </>
                          )}

                          {type === 'option' && (
                            <Select
                              value={val}
                              size="small"
                              onChange={value => {
                                effectItem.params[key] = value;
                                elementData._effectsDirty = util.randomID();
                                forceUpdate();
                                editor.updateMovie();
                                editor.updateTimeline();
                              }}
                            >
                              {param.options.map(d => {
                                return (
                                  <Select.Option key={d} value={d}>
                                    {d}
                                  </Select.Option>
                                );
                              })}
                            </Select>
                          )}
                          {type === 'color' && (
                            <Color
                              value={effectItem.params[key]}
                              onChange={value => {
                                effectItem.params[key] = value.hex;
                                forceUpdate();
                              }}
                              onAfterChange={() => {
                                elementData._effectsDirty = util.randomID();
                                editor.updateMovie();
                                editor.updateTimeline();
                              }}
                              style={{ minWidth: 40, width: 40, height: 20 }}
                            />
                          )}
                          {type === 'boolean' && (
                            <Switch
                              checked={effectItem.params[key]}
                              size="small"
                              onChange={(e: any) => {
                                console.log('---->', key, e);
                                effectItem.params[key] = e;
                                elementData._effectsDirty = util.randomID();
                                forceUpdate();
                                editor.updateMovie();
                                editor.updateTimeline();
                              }}
                            />
                          )}

                          {type === 'number' && (
                            <InputNumber
                              value={val}
                              size="small"
                              style={{ width: 100 }}
                              min={param.min ?? -Infinity}
                              max={param.max ?? Infinity}
                              step={param.step ?? 1}
                              onChange={value => {
                                if (frameStatus && frameStatus[keyFrameName] !== undefined) {
                                  if (frame) {
                                    frame[keyFrameName] = value;
                                  } else {
                                    const anime = editor.movie.updateKeyFrame(elementData as any, [keyFrameName]);
                                    editor.frameSelectedId = anime.id;
                                    anime[keyFrameName] = value;
                                  }
                                } else {
                                  if (key.indexOf('_') !== -1) {
                                    const [key1, key2] = key.split('_');
                                    if (!effectItem.params[key1]) {
                                      effectItem.params[key1] = {};
                                    }
                                    effectItem.params[key1][key2] = value;
                                  } else {
                                    effectItem.params[key] = value;
                                  }
                                }
                                forceUpdate();
                                elementData._effectsDirty = util.randomID();
                                editor.updateMovie();
                              }}
                            />
                          )}
                        </div>
                        {range || type === 'number' ? <KeyFrameDot keyFrameName={keyFrameName} /> : <a></a>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Item>
  );
}

export default observer(Effects);
