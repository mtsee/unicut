import React, { useState } from 'react';
import { Button, Popover, Popconfirm, Toast, Modal } from '@douyinfe/semi-ui';
import { Diamond } from '@icon-park/react';
import styles from './captions.module.less';
import { pubsub } from '@utils/pubsub';
import { sleep } from '@utils/util';
import { AudioEncoding } from 'video-core-sdk';
import { util } from '@utils/index';
import { language } from '@language/language';
import { stores } from '@stores/index';

type Props = {};

const AiCaption = (props: Props) => {
  const { editor } = stores;
  const [loading, setLoading] = useState(false);

  const hideLoading = () => {
    setLoading(false);
    pubsub.publish('timelineLoading', false);
  };

  const seekTask = async taskId => {
    const [res, err] = await editor.apiServer.seekCaptionTask(taskId);
    if (err) {
      return Toast.error(err);
    }
    // 字幕任务状态码
    // 20000000 成功
    // 20000001 正在处理中
    // 20000002 任务在队列中
    // 20000003 静音音频 返回该错误码无需重新query，直接重新submit
    // 45000001 请求参数无效
    // 45000002 空音频
    // 45000151 音频格式不正确
    // 550xxxx 服务内部处理错误
    // 55000031 服务器繁忙 服务过载，无法处理当前请求。
    if (res.StatusCode === '20000000') {
      const newSentences = processTextData(res.Sentences);
      // 批量新增字幕
      await editor.addCaptions(newSentences);
      hideLoading();
      editor.updateKey = util.randomID();
      return;
    }
    if (['20000001', '20000002'].includes(res.StatusCode)) {
      await util.sleep(1000);
      seekTask(taskId);
    } else {
      hideLoading();
      Toast.error(language.val('source_caption_ai_error'));
    }
  };

  const onConfirm = async () => {
    // 1、合成音频数据
    pubsub.publish('timelineLoading', true);
    const ac = new AudioEncoding({
      mdata: editor.data,
      movie: editor.movie,
      onProgress: p => {
        console.log('--->', p);
      },
    });
    setLoading(true);
    const audioRes = await ac.encoderAudio();
    if (!audioRes) {
      hideLoading();
      return Toast.error(language.val('source_caption_ai_no_audio'));
    }
    // 上传到服务端
    const formdata = new FormData();
    const name = `${util.formatDate(new Date(), 'YYYYMMDDHHmmss')}.mp3`;
    formdata.append('file', audioRes.blob, name);
    const [res, err] = await editor.apiServer.formUpdate(formdata);
    if (err) {
      hideLoading();
      return Toast.error(err);
    }
    const [res2, err2] = await editor.apiServer.createCaption(res.storage_path);
    if (err2) {
      hideLoading();
      return Toast.error(err2);
    }
    if (res2.TaskId) {
      seekTask(res2.TaskId);
    }
  };

  return (
    <a
      style={{ display: 'block', width: '100%' }}
      onClick={() => {
        if (loading) return;
        // VIP权限检查
        if (editor.userInfo?.vip_status !== 1) {
          pubsub.publish('showVipRecharge');
          return;
        }
        Modal.confirm({
          maskClosable: false,
          title: language.val('source_caption_system_tips'),
          content: language.val('source_caption_ai_tips'),
          onOk: onConfirm,
        });
      }}
      // loading={loading}
    >
      {language.val('source_caption_ai_button')}
      <Diamond theme="two-tone" size="12" fill={['#f8e71c', '#f5a623']} strokeWidth={3} style={{ marginLeft: 4 }} />
    </a>
  );
};

function processTextData(originalData) {
  const result = [];
  const maxLength = 15;

  // 匹配句中标点的正则表达式（不包括末尾标点）
  const innerPunctuationRegex = /[，。、；：,.!?;:"'()（）【】<>《》]/g;
  // 匹配末尾标点的正则表达式
  const endPunctuationRegex = /[，。、；：,.!?;:"'()（）【】<>《》]$/;

  originalData.forEach(item => {
    item.BeginTime = item.start_time;
    item.EndTime = item.end_time;

    let { text, ...rest } = item;

    // 处理文本：先将句中标点替换为空格，再去除末尾标点
    let processedText = text
      .replace(innerPunctuationRegex, ' ') // 句中标点换空格
      .replace(endPunctuationRegex, ''); // 去除末尾标点

    let currentText = processedText;
    let startIndex = 0;

    // 循环分割文本，直到所有内容都被处理
    while (currentText.length > 0) {
      // 截取不超过maxLength的子字符串
      let subText = currentText.slice(0, maxLength);

      // 计算当前片段在原始文本中的起始和结束位置
      const currentBegin = startIndex;
      const currentEnd = startIndex + subText.length;

      // 计算时间比例（按文本长度分配时间）
      const totalLength = processedText.length;
      // const timeRatio = totalLength > 0 ? (currentEnd - currentBegin) / totalLength : 0;
      // const segmentDuration = Math.round((item.EndTime - item.BeginTime) * timeRatio);
      // 创建新的条目
      console.log(
        'currentBegin, currentEnd',
        item.BeginTime,
        item.EndTime,
        currentBegin,
        currentEnd,
        totalLength,
        Math.round(item.BeginTime + (item.EndTime - item.BeginTime) * (currentBegin / totalLength)),
      );
      result.push({
        ...rest,
        Text: subText,
        BeginTime:
          currentBegin === 0
            ? item.BeginTime
            : Math.round(item.BeginTime + (item.EndTime - item.BeginTime) * (currentBegin / totalLength)),
        EndTime: Math.round(item.BeginTime + (item.EndTime - item.BeginTime) * (currentEnd / totalLength)),
      });

      // 更新剩余文本和起始索引
      currentText = currentText.slice(maxLength);
      startIndex = currentEnd;
    }
  });
  console.log('result', result);
  return result;
}

export default AiCaption;
