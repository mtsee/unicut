import { observer } from 'mobx-react';
import styles from './captions.module.less';
import { useCallback, useReducer, useRef, useState } from 'react';
import { utils } from 'video-core-sdk';
import { Button, Tooltip, Space, SplitButtonGroup, Dropdown, Modal, InputNumber, TextArea } from '@douyinfe/semi-ui';
import { Delete, Plus, Merge } from '@icon-park/react';
import classNames from 'classnames';
import { debounce } from 'lodash';
import { util } from '@utils/index';
// import $ from 'jquery';
import { Empty } from '@douyinfe/semi-ui';
import { IllustrationNoContent, IllustrationNoContentDark } from '@douyinfe/semi-illustrations';
import AiCaption from './AiCaption';
import type { CaptionElement } from 'video-core-sdk';
import Intl from '@language/Intl';
import { stores } from '@stores/index';
import { IconTreeTriangleDown } from '@douyinfe/semi-icons';

export interface IProps {}

function Captions(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const speedRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [texts, setTexts] = useState('');
  const captions = editor.data.captions.sort((a, b) => {
    return a.startTime - b.startTime;
  });
  const [tid] = editor.selectedElementIds;

  editor.updateKey;

  const update = useCallback(
    debounce((d: any) => {
      d._dirty = utils.createID();
      editor.updateMovie();
      editor.updateTimeline();
    }, 300),
    [],
  );

  return (
    <>
      <div className={styles.header}>
        <Space style={{ width: '100%' }}>
          <SplitButtonGroup style={{ width: '100%' }} aria-label="项目操作按钮组">
            <Button
              // theme="solid"
              // type="primary"
              style={{ width: 'calc(100% - 35px)' }}
              onClick={() => {
                editor.addCaption('input text');
              }}
              className={styles.button}
              block
            >
              <Intl name="source_add_caption" />
            </Button>
            <Dropdown
              menu={[
                //@ts-ignore
                { node: 'item', name: <AiCaption /> },
                {
                  node: 'item',
                  name: '批量修改字幕',
                  onClick: () => {
                    setTexts(captions.map((d, i) => d.text).join('\n'));
                    setVisible(true);
                  },
                },
                {
                  node: 'item',
                  name: '自动计算时间',
                  onClick: () => {
                    Modal.confirm({
                      maskClosable: false,
                      title: '自动计算字幕时长',
                      content: (
                        <Space style={{ padding: 20 }}>
                          <InputNumber
                            ref={speedRef}
                            placeholder="每秒说几个字"
                            min={0}
                            style={{ width: '200px' }}
                            max={20}
                            step={1}
                            defaultValue={4}
                          />
                          <Button
                            type="primary"
                            onClick={() => {
                              // 语速1.2
                              const captions = editor.data.captions;
                              // 通过字数计算字幕显示时间和开始时间，每秒4个字，单位秒
                              let startTime = 0;
                              captions.forEach((d, i) => {
                                d.duration = d.text.length / speedRef.current.value; // 每个字显示0.2秒
                                d.startTime = startTime; // 每个字幕间隔1秒
                                startTime += d.duration;
                              });
                              editor.record({
                                type: 'update',
                                desc: '自动计算字幕时长',
                              });
                              editor.updateMovie();
                              editor.updateTimeline();
                            }}
                          >
                            确定
                          </Button>
                        </Space>
                      ),
                      footer: null,
                    });
                    // 自动计算时间
                  },
                },
              ]}
              trigger="click"
              position="bottomRight"
            >
              <Button icon={<IconTreeTriangleDown />}></Button>
            </Dropdown>
          </SplitButtonGroup>
        </Space>
      </div>
      {captions.length === 0 && (
        <div className={styles.empty}>
          <Empty
            image={<IllustrationNoContent style={{ width: 150, height: 150 }} />}
            darkModeImage={<IllustrationNoContentDark style={{ width: 150, height: 150 }} />}
            // title="未选中任何元素"
            description="没有字幕"
          />
        </div>
      )}
      {captions.length !== 0 && (
        <div className={styles.captions + ' scroll'}>
          {captions.map((d, i) => {
            const targetId = `caption_input_${d.id}`;
            return (
              <section
                key={d.id}
                className={classNames({
                  [styles.active]: tid === d.id,
                })}
                onClick={e => {
                  editor.setContorlAndSelectedElemenent([d.id]);
                  editor.currentTime = d.startTime;
                }}
              >
                <div className={styles.top}>
                  <span className={styles.times}>
                    {util.secToTime(d.startTime, 'hhmmss', 0)}&nbsp;-&nbsp;
                    {util.secToTime(d.startTime + d.duration, 'hhmmss', 0)}
                  </span>
                  &nbsp;&nbsp;
                  <Tooltip content="删除">
                    <a
                      onClick={e => {
                        e.stopPropagation();
                        editor.deleteCaption(d.id);
                      }}
                    >
                      <Delete theme="outline" size="14" fill="var(--theme-icon)" />
                    </a>
                  </Tooltip>
                </div>
                {captions.length === i + 1 ? null : (
                  <div className={styles.btns}>
                    <Tooltip content="插入字幕">
                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          // 插入
                          editor.addCaption('字幕内容', i);
                        }}
                      >
                        <Plus theme="outline" size="14" fill="var(--theme-icon)" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="合并上下两个字幕">
                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          // 合并
                          editor.mergeCaption(d.id);
                        }}
                      >
                        <Merge theme="outline" size="14" fill="var(--theme-icon)" />
                      </Button>
                    </Tooltip>
                  </div>
                )}
                <div
                  id={targetId}
                  suppressContentEditableWarning={true}
                  className={styles.textarea + ' EVENT_STOP'}
                  contentEditable={true}
                  onKeyDown={function (e) {
                    if (e.key.toLowerCase() === 'enter') {
                      // 分割字幕
                      e.preventDefault(); // 阻止默认的换行行为
                      const text = d.text;
                      const selection = window.getSelection();
                      // 获取选择范围的第一个区域
                      const range = selection.getRangeAt(0);
                      // 获取光标在文本中的起始偏移量，即光标位置
                      const cursorPosition = range.startOffset;
                      const firstPart = text.slice(0, cursorPosition);
                      const secondPart = text.slice(cursorPosition);
                      // 分割位置计算
                      const per = firstPart.length / text.length;
                      const splitTime = per * d.duration + d.startTime;

                      if (per <= 0 || per >= 1) {
                        return;
                      }

                      const elem2 = util.toJS(d) as CaptionElement;
                      elem2.id = utils.createID();
                      elem2.duration = (1 - per) * d.duration - 0.01;
                      elem2.startTime = splitTime + 0.01;
                      elem2.text = secondPart;

                      d.duration = per * d.duration;
                      d.text = firstPart;

                      captions.push(elem2);
                      captions.sort((a, b) => {
                        return a.startTime - b.startTime;
                      });
                      editor.record({
                        type: 'add',
                        desc: '添加字幕',
                      });
                      editor.updateMovie();
                      editor.updateTimeline();
                      forceUpdate();
                    }
                  }}
                  onInput={(e: any) => {
                    e.stopPropagation();
                    d.text = e.target.innerText;
                    // editor.updateOption();
                    editor.updateTimelineElement();
                    // forceUpdate();
                    update(d);
                  }}
                >
                  {d.text}
                </div>
              </section>
            );
          })}
        </div>
      )}
      <Modal
        width={800}
        title="批量添加字幕"
        visible={visible}
        maskClosable={false}
        onCancel={() => setVisible(false)}
        onOk={async () => {
          Modal.confirm({
            title: '确认修改吗？',
            content: '确认后，所有字幕将被替换为新的字幕内容，原来的字幕时间将会被重新设置',
            cancelText: '取消',
            okText: '确认',
            okType: 'danger',
            onOk: async () => {
              editor.globalLoading = true;
              const lines = texts.split('\n').filter(line => line.trim() !== '');
              console.log(lines);
              // 构建新的字幕数组
              editor.data.captions = [];
              for (let i = 0; i < lines.length; i++) {
                await editor.addCaption(lines[i], i);
              }

              // 重新计算语速
              let startTime = 0;
              editor.data.captions.forEach((d, i) => {
                d.duration = d.text.length / 4; // 每个字显示0.2秒
                d.startTime = startTime; // 每个字幕间隔1秒
                startTime += d.duration;
              });

              editor.globalLoading = false;
              editor.record({
                type: 'add',
                desc: `批量添加字幕 × ${lines.length}`,
              });
              editor.updateMovie();
              editor.updateTimeline();
              setVisible(false);
            },
          });
        }}
      >
        {visible && (
          <div>
            <TextArea placeholder="每行代表一段字幕" value={texts} onChange={e => setTexts(e)} rows={10} />
          </div>
        )}
      </Modal>
    </>
  );
}

export default observer(Captions);
