import styles from './textstyle.module.less';
import Item from '../item';
import { Select, InputNumber, Switch } from '@douyinfe/semi-ui';
import {
  TextBold,
  Ruler,
  TextItalic,
  RowHeight,
  AutoLineWidth,
  AlignTextLeft,
  AlignTextCenter,
  AlignTextRight,
  RotateOne,
  DividingLine,
  Erase,
} from '@icon-park/react';
import Color from '../color';
import GradualColor from '../gradual-color';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useReducer } from 'react';
import type { TextElement } from 'video-core-sdk';
// import { fontFamilys } from './mock';
import { utils } from 'video-core-sdk';
// import { config } from '@config/index';
import InputNumber4 from '../input-number4';
// import { fetchJSON } from '@pages/editor/tools/tools';
import FontImage from './FontImage';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {}
function TextStyle(props: IProps) {
  const { editor } = stores;
  // homochromy gradual
  const elementData = editor.getElementData() as TextElement;
  const [fillColorType, setFillColorType] = useState(
    typeof elementData.textStyle.fill === 'object' ? 'gradual' : 'normal',
  );
  const [fontFamilys, setFontFamilys] = useState([]);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  editor.updateKey;

  const changeAlign = (key: string) => {
    const { align } = elementData.textStyle;

    if (elementData.type === 'caption') {
      editor.data.captions.forEach(elem => {
        if (align !== key) {
          elem.textStyle.align = key;
        }
        elem._textStyleDirty = utils.createID();
      });
    } else {
      if (align !== key) {
        elementData.textStyle.align = key;
      }
      elementData._textStyleDirty = utils.createID();
    }

    editor.updateMovie();
    forceUpdate();
    editor.record({
      type: 'elements_update',
      desc: '文本对齐' + key,
      data: [elementData],
    });
  };

  const changeNumber = (key: string, val: number | string) => {
    const changeVal = el => {
      if (key.indexOf('shadow') !== -1) {
        if (!el.textStyle.shadow) {
          el.textStyle.shadow = {
            color: '#000000',
            blur: 4,
            angle: Math.PI / 6,
            distance: 6,
          };
        }
      }
      switch (key) {
        case 'strokeColor':
          el.textStyle.stroke.color = val;
          break;
        case 'shadow_color':
          el.textStyle.shadow.color = val;
          break;
        case 'shadow_blur':
          el.textStyle.shadow.blur = val;
          break;
        case 'shadow_angle':
          el.textStyle.shadow.angle = val;
          break;
        case 'shadow_distance':
          el.textStyle.shadow.distance = val;
          break;
        case 'strokeThickness':
          el.textStyle.stroke.lineWidth = val;
          break;
        default:
          el.textStyle[key] = val;
      }
      el._textStyleDirty = utils.createID();
    };

    if (elementData.type === 'caption') {
      editor.data.captions.forEach(elem => {
        changeVal(elem);
      });
    } else {
      changeVal(elementData);
    }

    editor.updateMovie();
    forceUpdate();
  };

  const getColor = () => {
    const fill = elementData.textStyle.fill;
    if (typeof fill === 'string') {
      return fill;
    } else {
      switch (fill.type) {
        case 'linear':
        case 'conic':
        case 'radial':
          return fill.value.colors.map(d => {
            return {
              color: d.color,
              p: d.offset,
            };
          });
        case 'image':
          break;
      }
    }
  };

  const changeDirection = () => {
    if (elementData.type === 'caption') {
      editor.data.captions.forEach(elem => {
        if (elem.textStyle.direction === 'vertical') {
          elem.textStyle.direction = 'horizontal';
        } else {
          elem.textStyle.direction = 'vertical';
        }
        elem._textStyleDirty = utils.createID();
      });
    } else {
      if (elementData.textStyle.direction === 'vertical') {
        elementData.textStyle.direction = 'horizontal';
      } else {
        elementData.textStyle.direction = 'vertical';
      }
      elementData._textStyleDirty = utils.createID();
    }
    editor.updateMovie();
    forceUpdate();
  };

  useEffect(() => {
    editor.apiServer
      .getMaterials({
        type: 'font',
        page: 1,
        page_size: 1000,
        keyword: '',
        category_id: '',
      })
      .then(([res, err]) => {
        console.log(res, err);
        // const uniqueArr = Array.from(new Map([...arr].map(item => [item.name, item])).values());
        // setFontFamilys(uniqueArr);
        if (!err) {
          setFontFamilys(res?.data || []);
        }
      });
    // fetchJSON('/assets/fontFamily.json').then(arr => {
    //   const uniqueArr = Array.from(new Map([...arr].map(item => [item.name, item])).values());
    //   setFontFamilys(uniqueArr);
    // });
  }, []);

  let disabeldShadow = true;
  if (elementData.type === 'caption') {
    disabeldShadow = editor.data.captions[0]?.textStyle.disabeldShadow;
  } else {
    disabeldShadow = elementData.textStyle.disabeldShadow;
  }

  console.log('elementData.textStyle', elementData.textStyle);
  // 兼容老数据 InputNumber4
  if (elementData.textStyle.fill instanceof Array) {
    const len = elementData.textStyle.fill.length;
    elementData.textStyle.fill = {
      type: 'linear',
      value: {
        angle: 0,
        colors: elementData.textStyle.fill.map((d, i) => ({
          color: d,
          offset: (i + 1) / len,
        })),
      },
    };
  }
  if (elementData.textStyle.fill instanceof String) {
    elementData.textStyle.fill = {
      type: 'solid',
      value: elementData.textStyle.fill,
    };
  }

  if (!elementData.textStyle.radius) {
    elementData.textStyle.radius = [0, 0, 0, 0];
  }
  if (!elementData.textStyle.padding) {
    elementData.textStyle.padding = [0, 0, 0, 0];
  }

  if(!elementData.textStyle.stroke) {
    elementData.textStyle.stroke = {
      color: '#fffffff',
      lineWidth: 0,
    }
  }

  return (
    <>
      <div className={styles.texts}>
        <div className={styles.fontSpace}>
          <Select
            filter={(sugInput, option) => {
              //@ts-ignore
              let label = option.value.toUpperCase();
              let sug = sugInput.toUpperCase();
              return label.includes(sug);
            }}
            searchPlaceholder={language.val('option_search_font')}
            searchPosition="dropdown"
            dropdownClassName={styles.dropdownCls}
            onChange={e => {
              const fontFamily = fontFamilys.find(d => d.name === e);

              console.log(fontFamily);
              if (elementData.type === 'caption') {
                editor.data.captions.forEach(elem => {
                  elem.textStyle.fontFamily = fontFamily.name;
                  elem.textStyle.fontFamilyURL = fontFamily.urls.url;
                });
              } else {
                elementData.textStyle.fontFamily = fontFamily.name;
                elementData.textStyle.fontFamilyURL = fontFamily.urls.url;
              }
              editor.updateMovie();
              forceUpdate();
              editor.record({
                type: 'elements_update',
                desc: '修改字体',
                data: [elementData],
              });
            }}
            className={styles.fontFamilyOption}
            key={elementData.textStyle.fontFamily}
            value={elementData.textStyle.fontFamily}
          >
            {fontFamilys.map(item => {
              return (
                <Select.Option className={styles.fontFamilyOption} key={item.name} value={item.name}>
                  <FontImage
                    name={item.name}
                    src={editor.movie.reURL(item.urls.thumb)}
                    // src={`/assets/font-thumbs/${item.name + (editor.themeUpdateKey === 'dark' ? '_2' : '')}.png`}
                  />
                </Select.Option>
              );
            })}
          </Select>
        </div>
        <div className={styles.styleSpace}>
          <a
            className={classNames({
              [styles.active]: elementData.textStyle.fontWeight === 'bolder',
            })}
            onClick={() => {
              const { fontWeight } = elementData.textStyle;

              if (elementData.type === 'caption') {
                editor.data.captions.forEach(elem => {
                  elem.textStyle.fontWeight = fontWeight === 'bolder' ? 'normal' : 'bolder';
                  elem._dirty = utils.createID();
                });
              } else {
                elementData.textStyle.fontWeight = fontWeight === 'bolder' ? 'normal' : 'bolder';
                elementData._dirty = utils.createID();
              }

              editor.updateMovie();
              forceUpdate();
              editor.record({
                type: 'elements_update',
                desc: '加粗&取消',
                data: [elementData],
              });
            }}
          >
            <TextBold theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
          <a
            className={classNames({
              [styles.active]: elementData.textStyle.fontStyle === 'italic',
            })}
            onClick={() => {
              const { fontStyle } = elementData.textStyle;

              if (elementData.type === 'caption') {
                editor.data.captions.forEach(elem => {
                  elem.textStyle.fontStyle = fontStyle === 'italic' ? 'normal' : 'italic';
                  elem._dirty = utils.createID();
                });
              } else {
                elementData.textStyle.fontStyle = fontStyle === 'italic' ? 'normal' : 'italic';
                elementData._dirty = utils.createID();
              }
              editor.updateMovie();
              forceUpdate();
              editor.record({
                type: 'elements_update',
                desc: '倾斜',
                data: [elementData],
              });
            }}
          >
            <TextItalic theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
          <a
            className={classNames({
              [styles.active]: elementData.textStyle.align === 'left' || !elementData.textStyle.align,
            })}
            onClick={() => changeAlign('left')}
          >
            <AlignTextLeft theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
          <a
            className={classNames({
              [styles.active]: elementData.textStyle.align === 'center',
            })}
            onClick={() => changeAlign('center')}
          >
            <AlignTextCenter theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
          <a
            className={classNames({
              [styles.active]: elementData.textStyle.align === 'right',
            })}
            onClick={() => changeAlign('right')}
          >
            <AlignTextRight theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
          <a
            className={classNames({
              [styles.active]: elementData.textStyle.direction === 'vertical',
            })}
            onClick={() => changeDirection()}
          >
            FX
          </a>
        </div>
        <div className={styles.textSpace}>
          <InputNumber
            onChange={e => changeNumber('lineHeight', utils.toNum(Number(e)))}
            value={utils.toNum(elementData.textStyle.lineHeight)}
            prefix={
              <span className={styles.prefixIco}>
                <RowHeight theme="filled" size="16" fill="var(--theme-icon)" />
              </span>
            }
            innerButtons
            onBlur={() => {
              editor.record({
                type: 'elements_update',
                desc: '修改文字行高',
                data: [elementData],
              });
            }}
          />
          <InputNumber
            onChange={e => changeNumber('letterSpacing', utils.toNum(Number(e)))}
            value={utils.toNum(elementData.textStyle.letterSpacing)}
            prefix={
              <span className={styles.prefixIco}>
                <AutoLineWidth theme="filled" size="16" fill="var(--theme-icon)" />
              </span>
            }
            innerButtons
            onBlur={() => {
              editor.record({
                type: 'elements_update',
                desc: '修改文字间距',
                data: [elementData],
              });
            }}
          />
        </div>
      </div>
      <Item title={language.val('option_color')}>
        <div className={styles.colors}>
          <Select
            value={fillColorType}
            onChange={(v: any) => {
              if (elementData.type === 'caption') {
                editor.data.captions.forEach(elem => {
                  elem.textStyle.fillType = v;
                  if (v === 'gradual') {
                    elem.textStyle.fill = {
                      type: 'linear',
                      value: {
                        angle: 0,
                        colors: [
                          { color: '#ffffff', offset: 0 },
                          { color: '#000000', offset: 1 },
                        ],
                      },
                    };
                  } else {
                    elem.textStyle.fill = '#ffffff';
                  }
                  elem._textStyleDirty = utils.createID();
                });
              } else {
                elementData.textStyle.fillType = v;
                if (v === 'gradual') {
                  elementData.textStyle.fill = {
                    type: 'linear',
                    value: {
                      angle: 0,
                      colors: [
                        { color: '#ffffff', offset: 0 },
                        { color: '#000000', offset: 1 },
                      ],
                    },
                  };
                } else {
                  elementData.textStyle.fill = '#ffffff';
                }
                elementData._textStyleDirty = utils.createID();
              }

              editor.updateMovie();
              setFillColorType(v);
              editor.record({
                type: 'elements_update',
                desc: '文字颜色类型',
                data: [elementData],
              });
            }}
          >
            <Select.Option value="normal">{language.val('option_text_color_single')}</Select.Option>
            <Select.Option value="gradual">{language.val('option_text_color_gradient')}</Select.Option>
          </Select>
          {fillColorType !== 'gradual' ? (
            <Color
              value={elementData.textStyle.fill}
              onChange={(e: any) => changeNumber('fill', `rgba(${e.rgba.r}, ${e.rgba.g}, ${e.rgba.b}, ${e.rgba.a})`)}
              onAfterChange={() => {
                editor.record({
                  type: 'elements_update',
                  desc: '文字颜色',
                  data: [elementData],
                });
              }}
            />
          ) : (
            <div className={styles.gradualDirc}>
              <InputNumber
                onChange={(e: number) => {
                  if (elementData.type === 'caption') {
                    editor.data.captions.forEach(elem => {
                      elem.textStyle.fill.value.angle = e;
                      elem._textStyleDirty = utils.createID();
                    });
                  } else {
                    elementData.textStyle.fill.value.angle = e;
                    elementData._textStyleDirty = utils.createID();
                  }

                  editor.updateMovie();
                  forceUpdate();
                }}
                value={utils.toNum(elementData.textStyle.fill.value.angle)}
                prefix={
                  <span className={styles.prefixIco}>
                    <RotateOne theme="filled" size="16" fill="var(--theme-icon)" />
                  </span>
                }
                innerButtons
                onBlur={() => {
                  editor.record({
                    type: 'elements_update',
                    desc: '修改文字渐变角度',
                    data: [elementData],
                  });
                }}
              />
            </div>
          )}
        </div>
        {fillColorType === 'gradual' && (
          <div className={styles.gradualColors}>
            <GradualColor
              onChange={colors => {
                if (elementData.type === 'caption') {
                  editor.data.captions.forEach(elem => {
                    elem.textStyle.fill.value.colors = colors.map(d => {
                      return { color: d.color, offset: d.p };
                    });
                    elem._textStyleDirty = utils.createID();
                  });
                } else {
                  elementData.textStyle.fill.value.colors = colors.map(d => {
                    return { color: d.color, offset: d.p };
                  });
                  elementData._textStyleDirty = utils.createID();
                }

                editor.updateMovie();
                forceUpdate();
              }}
              onAfterChange={() => {
                editor.record({
                  type: 'elements_update',
                  desc: '修改文字渐变色',
                  data: [elementData],
                });
              }}
              colors={getColor()}
            />
          </div>
        )}
      </Item>
      <Item
        title={language.val('option_text_shadow')}
        extra={
          <Switch
            checked={!disabeldShadow}
            onChange={v => {
              // v = !v;
              if (elementData.type === 'caption') {
                editor.data.captions.forEach(elem => {
                  elem._textStyleDirty = utils.createID();
                  elem.textStyle.disabeldShadow = !v;
                });
              } else {
                elementData._textStyleDirty = utils.createID();
                elementData.textStyle.disabeldShadow = !v;
              }
              forceUpdate();
              editor.updateMovie();
              editor.record({
                type: 'elements_update',
                desc: '修改文字渐变色',
                data: [elementData],
              });
            }}
          />
        }
      >
        <div className={styles.textSpace}>
          <Color
            value={elementData.textStyle.shadow?.color}
            onChange={(e: any) =>
              changeNumber(
                'shadow_color',
                `rgba(${e.rgb.r}, ${e.rgb.g}, ${e.rgb.b}, ${e.rgb.a === undefined ? 1 : e.rgb.a})`,
              )
            }
            onAfterChange={() => {
              editor.record({
                type: 'elements_update',
                desc: '修改文字描边颜色',
                data: [elementData],
              });
            }}
          />
          <InputNumber
            min={0}
            value={elementData.textStyle.shadow?.blur}
            onChange={e => changeNumber('shadow_blur', utils.toNum(Number(e)))}
            suffix="px"
            prefix={
              <span className={styles.prefixIco}>
                <DividingLine theme="filled" size="16" fill="var(--theme-icon)" />
              </span>
            }
            innerButtons
            onBlur={() => {
              editor.record({
                type: 'elements_update',
                desc: '修改文字阴影',
                data: [elementData],
              });
            }}
          />
        </div>
        <div className={styles.textSpace} style={{ marginTop: 5 }}>
          <InputNumber
            onChange={e => changeNumber('shadow_distance', utils.toNum(Number(e)))}
            value={utils.toNum(elementData.textStyle.shadow?.distance)}
            prefix={
              <span className={styles.prefixIco}>
                <Ruler theme="filled" size="16" fill="var(--theme-icon)" />
              </span>
            }
            innerButtons
            onBlur={() => {
              editor.record({
                type: 'elements_update',
                desc: '文字阴影距离',
                data: [elementData],
              });
            }}
          />
          <InputNumber
            onChange={e => changeNumber('shadow_angle', utils.toNum(Number(e)))}
            value={utils.toNum(elementData.textStyle.shadow?.angle)}
            prefix={
              <span className={styles.prefixIco}>
                <RotateOne theme="filled" size="16" fill="var(--theme-icon)" />
              </span>
            }
            innerButtons
            onBlur={() => {
              editor.record({
                type: 'elements_update',
                desc: '文字阴影角度',
                data: [elementData],
              });
            }}
          />
        </div>
      </Item>
      <Item title={language.val('option_text_stroke')}>
        <div className={styles.textSpace}>
          <Color
            value={elementData.textStyle.stroke.color}
            onChange={(e: any) =>
              changeNumber(
                'strokeColor',
                `rgba(${e.rgb.r}, ${e.rgb.g}, ${e.rgb.b}, ${e.rgb.a === undefined ? 1 : e.rgb.a})`,
              )
            }
            onAfterChange={() => {
              editor.record({
                type: 'elements_update',
                desc: '修改文字描边颜色',
                data: [elementData],
              });
            }}
          />
          <InputNumber
            min={0}
            value={elementData.textStyle.stroke.lineWidth}
            onChange={e => changeNumber('strokeThickness', utils.toNum(Number(e)))}
            suffix="px"
            prefix={
              <span className={styles.prefixIco}>
                <DividingLine theme="filled" size="16" fill="var(--theme-icon)" />
              </span>
            }
            innerButtons
            onBlur={() => {
              editor.record({
                type: 'elements_update',
                desc: '修改文字描边',
                data: [elementData],
              });
            }}
          />
        </div>
      </Item>
      <Item title={language.val('option_text_backgroundcolor')}>
        <div className={styles.backgrounds}>
          <Color
            value={elementData.textStyle.backgroundColor}
            onChange={(e: any) => {
              if (elementData.type === 'caption') {
                editor.data.captions.forEach(elem => {
                  elem.textStyle.backgroundColor = `rgba(${e.rgb.r}, ${e.rgb.g}, ${e.rgb.b}, ${e.rgb.a === undefined ? 1 : e.rgb.a})`;
                  elem.textStyle = { ...elem.textStyle };
                });
              } else {
                elementData.textStyle.backgroundColor = `rgba(${e.rgb.r}, ${e.rgb.g}, ${e.rgb.b}, ${e.rgb.a === undefined ? 1 : e.rgb.a})`;
                elementData.textStyle = { ...elementData.textStyle };
              }

              forceUpdate();
              editor.updateMovie();
            }}
            onAfterChange={() => {
              editor.record({
                type: 'elements_update',
                desc: '修改文字背景颜色',
                data: [elementData],
              });
            }}
          />
          <a
            className={styles.clearColor}
            onClick={() => {
              if (elementData.type === 'caption') {
                editor.data.captions.forEach(elem => {
                  delete elem.textStyle.backgroundColor;
                  elem.textStyle = { ...elem.textStyle };
                });
              } else {
                delete elementData.textStyle.backgroundColor;
                elementData.textStyle = { ...elementData.textStyle };
              }

              forceUpdate();
              editor.updateMovie();
              editor.record({
                type: 'elements_update',
                desc: '修改文字背景颜色',
                data: [elementData],
              });
            }}
          >
            <Erase theme="filled" size="20" fill="var(--theme-icon)" />
          </a>
        </div>
      </Item>
      <InputNumber4
        title={language.val('option_text_radius')}
        value={elementData.textStyle.radius}
        onChange={e => {
          if (elementData.type === 'caption') {
            editor.data.captions.forEach(elem => {
              elem.textStyle.radius = e;
              elem.textStyle = { ...elem.textStyle };
            });
          } else {
            elementData.textStyle.radius = e;
            elementData.textStyle = { ...elementData.textStyle };
          }

          editor.updateMovie();
          editor.record({
            type: 'elements_update',
            desc: '修改文字圆角',
            data: [elementData],
          });
        }}
      />
      <InputNumber4
        title={language.val('option_text_padding')}
        value={elementData.textStyle.padding}
        onChange={e => {
          if (elementData.type === 'caption') {
            editor.data.captions.forEach(elem => {
              elem.textStyle.padding = e;
              elem.textStyle = { ...elem.textStyle };
            });
          } else {
            elementData.textStyle.padding = e;
            elementData.textStyle = { ...elementData.textStyle };
          }

          editor.updateMovie();
          editor.record({
            type: 'elements_update',
            desc: '修改文字padding',
            data: [elementData],
          });
        }}
      />
    </>
  );
}

export default observer(TextStyle);
