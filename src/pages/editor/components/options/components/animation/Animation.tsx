import styles from './animation.module.less';
import { Button, Modal, Toast, Select } from '@douyinfe/semi-ui';
import WaterFull from '@components/water-full';
import Item from '../item';
import { useState } from 'react';
import classNames from 'classnames';
import SliderInput from '../slider-input';
import { observer } from 'mobx-react';
import type { AnimationType, ImageElement, VideoElement } from 'video-core-sdk';
import { data } from './mock';
import { useReducer } from 'react';
import { utils } from 'video-core-sdk';
import { remove } from 'lodash';
// import CustomAnimation from './CustomAnimation';
import AnimateItem from './AnimateItem';
import { eases } from './eases';
import { Help } from '@icon-park/react';
import { language, Intl } from '@language/index';
import { stores } from '@stores/index';
import { util } from '@utils/index';

export interface IProps {}

function Animation(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as VideoElement;
  const [durationKey, setDurationKey] = useState('1');

  const animates = elementData.animates || [];
  const enterAnimation = animates.find(d => d.type === 'enter');
  const leaveAnimation = animates.find(d => d.type === 'leave');
  // 为了方便，强调动画只可以加一个
  const emphasizeAnimation = animates.find(d => d.type === 'emphasize');
  const [animationType, setAnimationType] = useState<AnimationType>('enter');

  // console.log('enterAnimation', enterAnimation);
  // console.log('leaveAnimation', leaveAnimation);
  // console.log('emphasizeAnimation', emphasizeAnimation);
  const languageType = language.getLanguage();

  const getSelectAnimation = () => {
    switch (animationType) {
      case 'enter':
        return enterAnimation;
      case 'leave':
        return leaveAnimation;
      case 'emphasize':
        return emphasizeAnimation;
      default:
        throw new Error('未知类型');
    }
  };

  const getList = () => {
    const arr = [];
    data.forEach(d => {
      //@ts-ignore
      if (d.type === animationType) {
        arr.push(d);
      }
    });
    return arr;
  };

  // 获取强调动画的开始和duration
  const emphasizeDurationAndStart = () => {
    let start = 0;
    let duration = 1;
    // 判断是否可以插入动画
    if (leaveAnimation && enterAnimation) {
      if (leaveAnimation.start - enterAnimation.duration > 0.1) {
        duration = Math.min(util.timeToNum(leaveAnimation.start - enterAnimation.duration), 1);
        start = enterAnimation.duration;
      } else {
        Toast.error(language.val('option_animation_insert_animation'));
        return;
      }
    } else {
      if (enterAnimation) {
        start = enterAnimation.duration;
        duration = Math.min(1, elementData.duration - enterAnimation.duration);
      } else if (leaveAnimation) {
        start = 0;
        duration = Math.min(1, elementData.duration - leaveAnimation.duration);
      } else {
        start = 0;
        duration = Math.min(1, elementData.duration);
      }
    }

    return { duration, start };
  };

  // 添加自定义动画
  // const insertCustomAnimation = () => {
  //   // 有了自定义动画，就会去掉其他动画
  //   elementData.animates = [];
  //   setAnimate({
  //     type: 'custom',
  //     name: '自定义动画',
  //     ename: 'custom animation',
  //     id: utils.createID(),
  //     frames: [
  //       {
  //         id: utils.createID(),
  //         progress: 0,
  //         alpha: 1,
  //         transform: {
  //           translateX: 0,
  //           translateY: 0,
  //           rotation: 0,
  //           scaleX: 1,
  //           scaleY: 1,
  //           skewX: 0,
  //           skewY: 0,
  //         },
  //       },
  //       {
  //         id: utils.createID(),
  //         progress: 1,
  //         alpha: 1,
  //         transform: {
  //           translateX: 0,
  //           translateY: 0,
  //           rotation: 0,
  //           scaleX: 1,
  //           scaleY: 1,
  //           skewX: 0,
  //           skewY: 0,
  //         },
  //       },
  //     ],
  //   });
  // };

  // 添加动画，修改动画
  const setAnimate = item => {
    // 替换元素
    const replaceAnimate = animation => {
      animation.frames = utils.toJS(item.frames).map(d => {
        d.id = utils.createID();
        d._dirty = utils.createID();
        return d;
      });
      animation.name = item.name;
      animation.ename = item.ename;
      animation.oid = item.id;
      animation._animationDirty = utils.createID();
    };

    if (item.id === 'null') {
      // 取消动画
      remove(elementData.animates, d => {
        return d.type === animationType;
      });
    }

    const setAnimation = () => {
      switch (animationType) {
        case 'enter':
          {
            if (enterAnimation) {
              replaceAnimate(enterAnimation);
            } else {
              if (emphasizeAnimation && emphasizeAnimation.start === 0) {
                Toast.error(language.val('option_animation_process_start_time'));
                return;
              }
              if (!elementData.animates) {
                elementData.animates = [];
              }
              elementData.animates.push({
                id: utils.createID(),
                oid: item.id,
                duration: Math.min(util.timeToNum(elementData.duration / 2), 1),
                frames: utils.toJS(item.frames).map(d => {
                  d.id = utils.createID();
                  d._dirty = utils.createID();
                  return d;
                }),
                type: animationType,
                name: item.name,
                ename: item.ename,
                start: 0,
                _dirty: '0',
              });
            }
          }
          break;
        case 'leave':
          {
            if (leaveAnimation) {
              replaceAnimate(leaveAnimation);
            } else {
              if (
                emphasizeAnimation &&
                emphasizeAnimation.start + emphasizeAnimation.duration === elementData.duration
              ) {
                Toast.error(language.val('option_animation_process_duration'));
                return;
              }
              if (!elementData.animates) {
                elementData.animates = [];
              }
              const duration = Math.min(util.timeToNum(elementData.duration / 2), 1);
              elementData.animates.push({
                id: utils.createID(),
                oid: item.id,
                duration,
                frames: utils.toJS(item.frames).map(d => {
                  d.id = utils.createID();
                  d._dirty = utils.createID();
                  return d;
                }),
                type: animationType,
                name: item.name,
                ename: item.ename,
                start: elementData.duration - duration,
                _dirty: '0',
              });
            }
          }
          break;
        case 'emphasize':
          {
            if (emphasizeAnimation) {
              replaceAnimate(emphasizeAnimation);
            } else {
              if (!elementData.animates) {
                elementData.animates = [];
              }
              const { duration, start } = emphasizeDurationAndStart();
              elementData.animates.push({
                id: utils.createID(),
                oid: item.id,
                duration,
                frames: utils.toJS(item.frames).map(d => {
                  d.id = utils.createID();
                  d._dirty = utils.createID();
                  return d;
                }),
                type: animationType,
                name: item.name,
                ename: item.ename,
                start,
                _dirty: '0',
              });
            }
          }
          break;
        default:
          throw new Error('类型错误');
      }
      elementData._animationDirty = utils.createID();
      forceUpdate();
      editor.updateTimelineElement();
      editor.updateMovie();
      editor.record({
        type: 'elements_update',
        desc: '设置动画',
        data: [elementData],
      });
    };

    // 如果有自定义动画的情况下，其他动画会覆盖自定义动画
    setAnimation();
  };

  // 获取时长范围
  const getSliderRange = () => {
    const range = [0, elementData.duration];
    switch (animationType) {
      case 'enter': {
        if (emphasizeAnimation) {
          range[1] = emphasizeAnimation.start;
          return range;
        }
        if (leaveAnimation) {
          range[1] = leaveAnimation.start;
          return range;
        }
        return range;
      }
      case 'emphasize':
        if (enterAnimation) {
          range[0] = enterAnimation.duration;
        }
        if (leaveAnimation) {
          range[1] = leaveAnimation.start;
        }
        break;
      case 'leave':
        if (emphasizeAnimation) {
          range[0] = emphasizeAnimation.start + emphasizeAnimation.duration;
          return range;
        }
        if (enterAnimation) {
          range[0] = enterAnimation.start + enterAnimation.duration;
          return range;
        }
    }
    return range;
  };

  const thisAnimation = getSelectAnimation();
  const [durationMin, durationMax] = getSliderRange();
  const size = 80;

  // const speed = elementData.speed || 1;

  return (
    <div className={styles.animation} key={animationType}>
      <div className={styles.types}>
        <a
          onClick={() => setAnimationType('enter')}
          className={classNames({
            [styles.active]: animationType === 'enter',
          })}
        >
          <Intl name={'option_animation_in'} />
        </a>
        <a
          className={classNames({
            [styles.active]: animationType === 'emphasize',
          })}
          onClick={() => setAnimationType('emphasize')}
        >
          <Intl name={'option_animation_process'} />
        </a>
        <a
          className={classNames({
            [styles.active]: animationType === 'leave',
          })}
          onClick={() => setAnimationType('leave')}
        >
          <Intl name={'option_animation_out'} />
        </a>
        {/* <a
          className={classNames({
            [styles.active]: animationType === 'custom',
          })}
          onClick={() => setAnimationType('custom')}
        >
          自定义动画
        </a> */}
      </div>
      <div className={styles.contents + ' scroll'}>
        <Item title={language.val('option_animation_duration')} className={styles.duration}>
          <SliderInput
            disabled={!thisAnimation}
            step={0.1}
            value={thisAnimation ? thisAnimation.duration : 0}
            min={0}
            key={durationKey}
            max={durationMax - durationMin}
            onAfterChange={v => {
              setDurationKey(utils.createID());
            }}
            onChange={v => {
              if (thisAnimation) {
                if (animationType === 'leave') {
                  thisAnimation.duration = v;
                  thisAnimation.start = elementData.duration - v;
                } else {
                  thisAnimation.duration = v;
                }
                elementData._animationDirty = utils.createID();

                forceUpdate();
                editor.updateMovie();
                editor.updateTimelineElement();
              }
            }}
            suffix="s"
          />
        </Item>
        {['emphasize', 'custom'].includes(animationType) && (
          <Item title={language.val('option_animation_start_time')} className={styles.duration}>
            <SliderInput
              suffix="s"
              min={0}
              key={durationMax - (thisAnimation ? thisAnimation.duration : 0)}
              max={durationMax - (thisAnimation ? thisAnimation.duration : 0)}
              value={thisAnimation?.start}
              onChange={v => {
                if (thisAnimation) {
                  elementData._animationDirty = utils.createID();
                  thisAnimation.start = v;
                  forceUpdate();
                  editor.updateMovie();
                  editor.updateTimelineElement();
                }
              }}
              step={0.1}
            />
          </Item>
        )}
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
              thisAnimation.ease = e as string;
              elementData._animationDirty = utils.createID();
              forceUpdate();
              editor.updateTimelineElement();
              editor.updateMovie();
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
        <div
          className={classNames(styles.list, {
            [styles.emphasizeAnimationList]: animationType === 'emphasize',
          })}
        >
          <WaterFull
            itemWidth={50}
            item={item => (
              <div
                data-id={item.id}
                data-eid={enterAnimation?.oid || 0}
                onClick={() => setAnimate(item)}
                style={{ backgroundImage: `url(/assets/editor-images/animation.png)` }}
                className={classNames(styles.item, {
                  [styles.nullItem]: item.id === 'null',
                  [styles.active]: (() => {
                    switch (animationType) {
                      case 'enter':
                        return enterAnimation ? item.id === enterAnimation.oid : false;
                      case 'leave':
                        return leaveAnimation ? item.id === leaveAnimation.oid : false;
                      case 'emphasize':
                        return emphasizeAnimation ? item.id === emphasizeAnimation.oid : false;
                      default:
                        return false;
                    }
                  })(),
                })}
              >
                <h5 className={styles.name}>{languageType === 'zh-CN' ? item.name : item.ename}</h5>
                <AnimateItem item={item} />
              </div>
            )}
            list={[
              {
                ename: 'null',
                frames: [],
                id: 'null',
                name: '无动画',
                type: animationType,
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
