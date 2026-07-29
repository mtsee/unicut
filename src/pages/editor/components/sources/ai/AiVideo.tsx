import React, { useEffect, useRef, useState } from 'react';
import styles from './styles.module.less';
import { Tag, TextArea, RadioGroup, Radio, Select, Image, Button, Slider, Toast } from '@douyinfe/semi-ui';
import { observer } from 'mobx-react';
import SourceList from './SourceList';
import { getClosestVideoRatioEnhanced } from '@pages/editor/tools/tools';
import { getImageToVideoParams } from './aiConfig';
import { stores } from '@stores/index';
// import { StarOne } from '@icon-park/react';

export interface IProps {}

function AiVideo(props: IProps) {
  const { editor } = stores;
  const [aiAction, setAiAction] = useState('image-to-video');
  const [duration, setDuration] = useState(10);
  const [description, setDescription] = useState('');

  const { ratio } = getClosestVideoRatioEnhanced(editor.data.width, editor.data.height);
  const [size, setSize] = useState(ratio);

  const [clarity, setClarity] = useState('720p');
  const [count, setCount] = useState(1);
  const sourceListRef = useRef<any>(null);

  const Icon = (props: { size?: number }) => {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 16}
        height={props.size || 16}
        focusable="false"
        aria-hidden="true"
      >
        <path
          d="M9.68 5.45c.22-1.1 1.8-1.1 2.02 0a8.79 8.79 0 0 0 6.85 6.85c1.1.22 1.1 1.8 0 2.02a8.79 8.79 0 0 0-6.85 6.85c-.22 1.1-1.8 1.1-2.02 0a8.79 8.79 0 0 0-6.85-6.85c-1.1-.22-1.1-1.8 0-2.02a8.79 8.79 0 0 0 6.85-6.85Zm8.48-3.85c.16-.8 1.31-.8 1.48 0a3.54 3.54 0 0 0 2.76 2.76c.8.17.8 1.32 0 1.48a3.54 3.54 0 0 0-2.76 2.76c-.17.8-1.32.8-1.48 0a3.54 3.54 0 0 0-2.76-2.76c-.8-.16-.8-1.31 0-1.48a3.54 3.54 0 0 0 2.76-2.76Z"
          fill="currentColor"
        ></path>
      </svg>
    );
  };

  // 处理表单提交
  const handleGenerate = async () => {
    // 获取参考元素数据
    const urls = sourceListRef.current?.getURLs() || [];

    // 整合所有表单数据
    const formData = {
      aiAction,
      description,
      size,
      clarity,
      duration,
      count,
      urls: urls.map(d => d.url),
    };
    console.log('表单数据:', formData);

    // 图生视频
    const params = await getImageToVideoParams(formData);
    if (!params) {
      return;
    }
    const [res, err] = await editor.apiServer.createAiTask(params);
    if (!err) {
      Toast.success('任务创建成功');
    } else {
      Toast.error(err);
    }
    // 这里可以添加后续的生成逻辑，比如调用API等
  };

  return (
    <div className={styles.ai + ' scroll'}>
      <h1>参数设置</h1>
      <div className={styles.model}>
        <Select value={aiAction} style={{ width: '100%' }} onChange={setAiAction} placeholder="选择AI类型">
          <Select.Option value="text-to-video">文生视频</Select.Option>
          <Select.Option value="image-to-video">图生视频</Select.Option>
          <Select.Option value="first-to-video">首帧生成视频</Select.Option>
          <Select.Option value="first-last-to-video">首尾帧过渡视频</Select.Option>
          <Select.Option value="action-to-video">动作模仿</Select.Option>
        </Select>
        {/* <div className={styles.desc}>根据输入的文本内容进行</div> */}
        {aiAction !== 'text-to-video' && (
          <div className={styles.inner}>
            <h2>参考元素</h2>
            <SourceList action={aiAction} ref={sourceListRef} />
          </div>
        )}
        <div className={styles.inner}>
          <h2>描述信息</h2>
          <div className={styles.inner}>
            <TextArea
              style={{ width: '100%' }}
              rows={4}
              placeholder="请输入描述信息"
              value={description}
              onChange={setDescription}
            />
          </div>
        </div>
        <div className={styles.inner}>
          <h2>尺寸设置</h2>
          <Select value={size} style={{ width: '100%' }} onChange={setSize} placeholder="选择尺寸">
            <Select.Option value="16:9">16:9</Select.Option>
            <Select.Option value="9:16">9:16</Select.Option>
            <Select.Option value="4:3">4:3</Select.Option>
            <Select.Option value="3:4">3:4</Select.Option>
            <Select.Option value="1:1">1:1</Select.Option>
            <Select.Option value="21:9">21:9</Select.Option>
          </Select>
        </div>
        <div className={styles.inner}>
          <h2>清晰度设置</h2>
          <RadioGroup
            value={clarity}
            style={{ width: '100%' }}
            type="button"
            buttonSize="middle"
            name="clarity"
            onChange={setClarity as any}
          >
            <Radio value={'480p'}>480p</Radio>
            <Radio value={'720p'}>720p</Radio>
            <Radio value={'1080p'}>1080p</Radio>
          </RadioGroup>
        </div>
        <div className={styles.inner}>
          <h2>时长: {duration}s</h2>
          {/*@ts-ignore*/}
          <Slider value={duration} min={2} max={12} onChange={setDuration}></Slider>
        </div>
        <div className={styles.inner}>
          <h2>生成数量</h2>
          <RadioGroup
            value={count}
            style={{ width: '100%' }}
            type="button"
            buttonSize="middle"
            name="count"
            onChange={setCount as any}
          >
            <Radio value={1}>1</Radio>
            <Radio value={2}>2</Radio>
            <Radio value={3}>3</Radio>
            <Radio value={4}>4</Radio>
          </RadioGroup>
        </div>
      </div>
      <div className={styles.model}>
        {/* <div className={styles.credit}>
          <span>
            预计消耗积分：<em>881</em>
          </span>
          <span>
            剩余：
            <i>
              <Icon size={12} />
              &nbsp; 9881
            </i>
          </span>
        </div> */}
        <Button icon={<Icon />} block className={styles.btn} theme="solid" type="primary" onClick={handleGenerate}>
          开始生成
        </Button>
      </div>
    </div>
  );
}

export default observer(AiVideo);
