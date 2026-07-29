import styles from './styles.module.less';
import Item from '../item';
import SliderInput from '../slider-input';
import { utils } from '@video/core/src/react-pixi';
import { observer } from 'mobx-react';
import { useReducer, useState } from 'react';
// import type { EChartElement } from 'video-core-sdk';
import { Select, Popover, InputNumber, Upload, Switch, Button, Toast } from '@douyinfe/semi-ui';
// import { remove } from 'lodash';
import ColorEl from '../color';
import { colors } from './colors';
import { stores } from '@stores/index';
// import Editor from '@monaco-editor/react';
import { DownloadTwo, UploadOne } from '@icon-park/react';
import * as xlsx from 'xlsx';
// const f = await fetch(element.dataURL);
// const ab = await f.arrayBuffer();
// const wb = read(ab);
// const ws = wb.Sheets[wb.SheetNames[0]];
// const data: any[] = utils.sheet_to_json<any>(ws);
// console.log(JSON.stringify(data));

export interface OptionItemProps {
  title: string;
  option: any;
  name: string;
  update: () => void;
  noColor?: boolean;
}

function OptionItem(props: OptionItemProps) {
  const { title, option, name, update, noColor } = props;
  const { editor } = stores;
  
  return (
    <Item
      title={title}
      extra={
        <Switch
          checked={option[name].show}
          onChange={e => {
            option[name].show = e;
            update();
          }}
        />
      }
    >
      {option[name].show && (
        <div className={styles.legendGroup}>
          {!noColor && (
            <ColorEl
              value={option[name].color}
              onChange={e => {
                option[name].color = e.hex;
                update();
              }}
            />
          )}
          <InputNumber
            style={{ width: noColor ? '100%' : 'calc(50% - 3px)' }}
            onChange={e => {
              option[name].fontSize = utils.toNum(Number(e));
              update();
            }}
            value={utils.toNum(option[name].fontSize)}
            innerButtons
            suffix="px"
          />
        </div>
      )}
    </Item>
  );
}

export interface IProps {}

function EChart(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as any; // EChartElement;
  const { option } = elementData;
  const str = JSON.stringify(JSON.parse(elementData.data), null, 2);
  const [coding, setCoding] = useState(str);

  console.log('elementData', elementData);

  const update = () => {
    elementData._optionDirty = String(+new Date());
    editor.updateMovie();
    forceUpdate();
  };

  return (
    <div className={styles.content + ' scroll'}>
      <Item title="图表类型">
        <Select
          defaultValue={option.chartType}
          onChange={(e: any) => {
            option.chartType = e;
            console.log('e', e, option.ruler);
            option.ruler.show = e === 'bar';
            update();
          }}
          style={{ width: '100%' }}
        >
          <Select.Option value="bar">柱状图</Select.Option>
          <Select.Option value="pie">饼图</Select.Option>
        </Select>
      </Item>
      <Item title="切换动画时长">
        <SliderInput
          value={option.animateDuration}
          onChange={v => {
            option.animateDuration = v;
            forceUpdate();
          }}
          suffix="s"
          step={0.1}
          min={0.1}
          max={5}
          onAfterChange={() => {
            elementData._optionDirty = +new Date() + '';
            update();
            // editor.record({
            //   type: 'elements_update',
            //   desc: '修改滤镜强度',
            //   data: [elementData],
            // });
          }}
        />
      </Item>
      <Item title="图表颜色">
        <Popover
          content={
            <div className={styles.colorsGroup}>
              {colors.map(d => {
                return (
                  <section
                    key={d.name}
                    onClick={() => {
                      option.colors = [...d.colors];
                      update();
                    }}
                    className={styles.colorTheme}
                  >
                    {d.colors.slice(0, 6).map((c, i) => {
                      return <span key={i} style={{ background: c }} className={styles.colorItem}></span>;
                    })}
                  </section>
                );
              })}
            </div>
          }
        >
          <section className={styles.colorTheme}>
            {(() => {
              return (
                <>
                  {option.colors.slice(0, 6).map((c, i) => {
                    return <span key={i} style={{ background: c }} className={styles.colorItem}></span>;
                  })}
                </>
              );
            })()}
          </section>
        </Popover>
      </Item>
      <OptionItem title="标题配置" name="title" option={option} update={update} />
      <OptionItem title="刻度配置" name="ruler" option={option} update={update} />
      <OptionItem title="图例配置" name="legend" option={option} update={update} />
      <OptionItem title="数据文字" name="seriesName" noColor={true} option={option} update={update} />
      <Item title="数据配置">
        <div className={styles.dataOption}>
          <div className={styles.btns}>
            <Upload
              accept=".xlsx, .xls"
              // action={'/api/v1/common/upload/form'}
              uploadTrigger="auto"
              action=""
              customRequest={async obj => {
                const ab = await utils.readFileAsArrayBuffer(obj.fileInstance);
                const wb = xlsx.read(ab);
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data: any[] = xlsx.utils.sheet_to_json<any>(ws);
                elementData.data = JSON.stringify(data);
                setCoding(JSON.stringify(JSON.parse(elementData.data), null, 2));
                update();
              }}
              className={styles.uploadBtn}
              // headers={{
              //   Authorization: editor.token,
              // }}
              maxSize={50 * 1024}
              multiple={false}
              showUploadList={false}
            >
              <Button theme="solid" icon={<UploadOne theme="outline" size="20" fill="var(--theme-text)" />}>
                导入Excel
              </Button>{' '}
            </Upload>
            <Button
              icon={<DownloadTwo theme="outline" size="20" fill="var(--theme-text)" />}
              className={styles.downBtn}
            >
              <a href="/assets/demo.xlsx" download="模版.xlsx">
                样例数据
              </a>
            </Button>
          </div>
          {/* <div className={styles.coding}>
            <Editor
              height="400px"
              width="100%"
              theme={editor.themeUpdateKey === 'dark' ? 'vs-dark' : 'light'}
              language="json"
              value={coding}
              onChange={(v: string = '') => {
                setCoding(v);
              }}
              wrapperProps={{
                onBlur: () => {
                  try {
                    const code = JSON.parse(coding);
                    elementData._optionDirty = +new Date() + '';
                    elementData.data = JSON.stringify(code);
                    update();
                    Toast.error('数据更新成功！');
                  } catch (err) {
                    Toast.error('数据格式错误');
                    console.error('json格式错误', err);
                  }
                },
              }}
            />
          </div> */}
        </div>
      </Item>
    </div>
  );
}

export default observer(EChart);
