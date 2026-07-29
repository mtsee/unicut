import styles from './audio.module.less';
import Item from '../item';
import SliderInput from '../slider-input';
import type { AudioElement } from 'video-core-sdk';
import { useReducer } from 'react';
import { utils } from 'video-core-sdk';
import { observer } from 'mobx-react';
import { Space, Switch } from '@douyinfe/semi-ui';
import { language } from '@language/language';
import { stores } from '@stores/index';
import { util } from '@utils/index';

/**
 * 根据音波数据生成说话检测数组
 * @param wave - 音波数据数组，每个值为对应时间段的振幅峰值
 * @param resourceDuration - 原始音频总时长（秒）
 * @param duration - 时间轴上的有效播放时长（秒）
 * @param clipTime - 音频裁剪起始时间（秒），默认0
 * @param speed - 音频播放速度（倍速），默认1
 * @param interval - 采样间隔（秒），默认0.2
 * @returns boolean[] - true表示说话（振幅不为0），false表示不说话（振幅为0）
 */
function getSpeechArray(
  wave: number[],
  resourceDuration: number,
  duration: number,
  clipTime: number,
  speed: number,
  interval = 0.2,
): boolean[] {
  if (!wave || !wave.length || !resourceDuration || !duration) return [];

  const result: boolean[] = [];
  const waveLen = wave.length;

  for (let t = 0; t < duration; t += interval) {
    // 播放时间 t → 原始音频位置 = clipTime + t * speed
    const originalTime = clipTime + t * speed;
    const index = Math.floor((originalTime / resourceDuration) * waveLen);
    const clamped = Math.min(Math.max(index, 0), waveLen - 1);
    result.push(wave[clamped] !== 0);
  }

  return result;
}

export interface IProps {}

function Audio(props: IProps) {
  const { editor } = stores;
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const elementData = editor.getElementData() as AudioElement;
  const { fadeInTime = 0, fadeOutTime = 0, muted } = elementData;
  const resouce = editor.movie.resourceManage.getResouceById(elementData.resourceId);
  return (
    <div className={styles.audios + ' scroll'}>
      <Item title={language.val('option_audio_volume')}>
        <SliderInput
          value={utils.toNum(elementData.volume * 100)}
          step={1}
          max={100}
          disabled={muted}
          onChange={v => {
            elementData.volume = Math.min(v / 100, 1);
            editor.updateMovie();
            forceUpdate();
          }}
          onAfterChange={() => {
            editor.record({
              type: 'elements_update',
              desc: '设置音量',
              data: [elementData],
            });
          }}
        />
      </Item>
      <Item title={language.val('option_audio_fadein')}>
        <SliderInput
          step={0.1}
          disabled={muted}
          min={0}
          max={elementData.duration / 2}
          value={fadeInTime}
          onChange={v => {
            elementData.fadeInTime = v;
            editor.updateMovie();
            forceUpdate();
          }}
          onAfterChange={() => {
            editor.record({
              type: 'elements_update',
              desc: '淡入声音',
              data: [elementData],
            });
          }}
        />
      </Item>
      <Item title={language.val('option_audio_fadeout')}>
        <SliderInput
          step={0.1}
          disabled={muted}
          min={0}
          max={elementData.duration / 2}
          value={fadeOutTime}
          onChange={v => {
            elementData.fadeOutTime = v;
            editor.updateMovie();
            forceUpdate();
          }}
          onAfterChange={() => {
            editor.record({
              type: 'elements_update',
              desc: '淡出声音',
              data: [elementData],
            });
          }}
        />
      </Item>
      <Item
        title={language.val('option_audio_mute')}
        extra={
          <Switch
            checked={muted}
            onChange={e => {
              elementData.muted = e;
              editor.updateMovie();
              forceUpdate();
            }}
          />
        }
      ></Item>
      {resouce && (
        <a style={{ fontSize: 12, margin: '0 20px', color: '#ccc' }} href={resouce.url} target="_blank">
          Download MP3 {resouce.attrs.voice}
        </a>
      )}
    </div>
  );
}
export default observer(Audio);
