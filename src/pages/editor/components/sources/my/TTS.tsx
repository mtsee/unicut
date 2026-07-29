import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import styles from './tts.module.less';
import classNames from 'classnames';
import {
  TextArea,
  Button,
  Toast,
  Popover,
  Slider,
  Space,
  InputNumber,
  Tag,
  Select,
  Input,
  Pagination,
  Avatar,
} from '@douyinfe/semi-ui';
import { VolumeNotice, Vip, SettingConfig, SettingTwo, Diamond } from '@icon-park/react';
import { Howl } from 'howler';
import { getUploadBeforeData } from '@pages/editor/tools/uploadBeforeData';
import { addImageVideoAudioItem } from '../addItem';
import { language } from '@language/language';
import { config } from '@config/index';
import { stores } from '@stores/index';
import type { TextElement } from 'video-core-sdk';
import { IconSearch } from '@douyinfe/semi-icons';
// import { audios } from './tts.mock';
import { pubsub, util } from '@utils/index';

const audios = [];

export interface IProps {
  addItem: (item: any) => void;
  onCancel?: () => void;
  style?: React.CSSProperties;
  element?: TextElement[];
  ttsStyle?: React.CSSProperties;
}

function fetchJSON(url: string) {
  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
}

const TTS = (props: IProps) => {
  const { editor } = stores;
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [voice, setVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const [setting, setSetting] = useState<any>({});
  const [searchKey, setSearchKey] = useState('');
  const resObj = useRef<any>({});
  const [page, setPage] = useState(1);
  const pageSize = 40;
  // const MISSING_SPEAKERS = [
  //   'zh_female_sajiaxuemei_uranus_bigtts',
  //   'zh_female_meiliinvyou_uranus_bigtts',
  //   'zh_male_baqingshu_uranus_bigtts',
  //   'zh_female_tiexinvsheng_uranus_bigtts',
  // ];

  const audio = useRef<Howl | null>(null);

  useEffect(() => {
    pubsub.subscribe('stopTTSPlay', () => {
      audio.current?.stop();
    });
    return () => {
      audio.current?.stop();
      pubsub.unsubscribe('stopTTSPlay');
    };
  }, []);

  useEffect(() => {
    const t = Date.now();
    Promise.all([fetchJSON('/assets/zijie1.json?t=' + t), fetchJSON('/assets/zijie2.json?t=' + t)])
      .then((data: any[]) => {
        const [a1, a2] = data;
        // console.log(data);
        setVoices([
          ...a2,
          ...a1.filter(d => {
            return !d.ecov2;
          }),
        ]);
      })
      .catch(error => {
        console.error('Fetch error:', error);
      });
  }, []);

  const filteredVoices = useMemo(() => {
    return voices
      .filter(v => {
        if (!searchKey) return true;
        const key = searchKey.toLowerCase();
        return v['name']?.toLowerCase().includes(key) || v['info']?.toLowerCase().includes(key);
      })
      .sort((a, b) => {
        return (a.sort || 0) - (b.sort || 0);
      });
  }, [voices, searchKey]);

  const totalPages = Math.ceil(filteredVoices.length / pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchKey]);

  const paginatedVoices = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredVoices.slice(start, end);
  }, [filteredVoices, page, pageSize]);

  const createTTS = async (voice: any, arr: any[]): Promise<any> => {
    if (!voice) {
      return Toast.error(language.val('source_tts_please_select'));
    }
    setLoading(true);
    const obj = {};

    for (const item of arr) {
      const t = item.text || text;

      if (!t) continue;

      let res = null;
      let err = null;
      if (
        resObj.current[item.id] &&
        resObj.current[item.id].emotion === setting[voice.voice_type].emotion &&
        resObj.current[item.id].desc === setting[voice.voice_type].desc &&
        resObj.current[item.id].text === t &&
        Object.values(resObj.current)
          .map((d: any) => d.voice_type)
          .includes(voice.voice_type)
      ) {
        res = resObj.current[item.id];
      } else {
        [res, err] = await editor.apiServer.createTTS({
          version: !!voice.emotions ? 'v1' : 'v2',
          emotion: setting[voice.voice_type].emotion,
          text: t,
          config: {
            speaker: voice.voice_type,
            audio_params: {
              format: 'mp3',
              sample_rate: 24000,
            },
            additions: {
              context_texts: [setting[voice.voice_type].desc],
            },
          },
        });
      }
      if (err) {
        return Toast.error(err);
      }
      obj[item.id] = { ...res, text: t, voice_type: voice.voice_type, desc: setting[voice.voice_type].desc };
    }
    const elements = editor.getGroupElementData();
    if (elements?.length >= 1) {
      const item = elements[0];
      playAudio(obj[item.id].storage_path, voice.voice_type);
    }
    resObj.current = { ...resObj.current, ...obj };
    setLoading(false);

    return Object.values(obj)[0];
  };

  const startRead = async () => {
    // console.log('voice', voice);
    // 会员权限
    if (editor.userInfo?.vip_status !== 1 && voice?.vip) {
      // 弹窗会员充值
      pubsub.publish('showVipRecharge');
      return;
    }

    // 停止播放
    audio.current?.stop();
    setLoading(true);
    editor.globalLoading = true;
    const elements = editor.getGroupElementData();
    await createTTS(voice, elements);

    // 缓存本批次内已排入的轨道区间，避免多个 TTS 元素冲突
    const pendingPlacements = new Map<number, { start: number; end: number }[]>();

    const findAvailableAudioTrack = (startTime: number, duration: number, speed: number): number | undefined => {
      const actualDuration = duration / (speed || 1);
      const endTime = startTime + actualDuration;

      // 收集各轨道已有的区间
      const trackMap = new Map<number, Array<{ start: number; end: number }>>();

      for (const e of editor.data.elements) {
        if (e.type !== 'audio') continue;
        const eSpeed = (e as any).speed || 1;
        const eEnd = e.startTime + e.duration / eSpeed;
        if (!trackMap.has(e.trackIndex)) trackMap.set(e.trackIndex, []);
        trackMap.get(e.trackIndex)!.push({ start: e.startTime, end: eEnd });
      }

      // 合并本批次的待插入项
      for (const [trackIdx, placements] of pendingPlacements) {
        if (!trackMap.has(trackIdx)) trackMap.set(trackIdx, []);
        trackMap.get(trackIdx)!.push(...placements);
      }

      // 找第一条不重叠的音频轨道
      for (const [trackIdx, intervals] of trackMap) {
        let hasOverlap = false;
        for (const iv of intervals) {
          if (!(endTime <= iv.start || startTime >= iv.end)) {
            hasOverlap = true;
            break;
          }
        }
        if (!hasOverlap) return trackIdx;
      }

      return undefined;
    };

    for (const elm of elements) {
      const res = resObj.current[elm.id];
      if (!res) {
        continue;
      }
      const info = await getUploadBeforeData({
        url: editor.movie.reURL(res.storage_path),
        type: 'audio',
        workerPath: config.workerPath,
        uploadBase64: editor.apiServer.uploadBase64,
        file: null,
        reURL: editor.movie.reURL,
      });

      const speed = setting[voice.voice_type]?.speed || 1;

      const item = {
        id: util.randomID(),
        name: text.substring(0, 12),
        convert_status: -1,
        app_id: editor.appid,
        type: 'audio',
        urls: { url: res.storage_path },
        speed,
        attrs: { duration: info.duration, wave: info.wave, voice_from: 'huoshan', voice: voice.voice_type },
      };

      console.log('elm--------------->', elm);

      // 检索现有音频轨道，优先复用有空位的轨道
      const audioDuration = info.duration || 0;
      let audioTrackIndex = findAvailableAudioTrack(elm.startTime, audioDuration, speed);

      // 记录本批次插入
      const actualDuration = audioDuration / speed;
      if (audioTrackIndex !== undefined) {
        if (!pendingPlacements.has(audioTrackIndex)) pendingPlacements.set(audioTrackIndex, []);
        pendingPlacements.get(audioTrackIndex)!.push({ start: elm.startTime, end: elm.startTime + actualDuration });
      }

      props.addItem(item);
      await addImageVideoAudioItem(item, elm.startTime, audioTrackIndex, true);
    }
    editor.globalLoading = false;
    setLoading(false);
    Toast.success(language.val('source_tts_success'));
  };

  const playAudio = (storage_path: string, voice_type: string) => {
    audio.current?.stop();
    const url = editor.movie.reURL(storage_path);
    const rate = setting[voice_type]?.speed || 1;
    audio.current = new Howl({
      src: [url],
      rate,
    });
    audio.current.load();
    audio.current.play();
  };

  return (
    <div className={styles.tts} style={props.ttsStyle}>
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          ...(props.style || {}),
        }}
        className={styles.soundMan + ' scroll'}
      >
        <Input prefix={<IconSearch />} showClear placeholder="搜索音色名称" value={searchKey} onChange={setSearchKey} />
        <ul className={styles.voiceList}>
          {paginatedVoices.map(d => {
            if (!setting[d.voice_type]) {
              setting[d.voice_type] = {
                speed: 1,
                desc: '',
              };
            }
            return (
              <li
                onClick={async () => {
                  setVoice(d);
                  audio.current?.stop();
                  const a = audios.find(a => a === d.voice_type + '.mp3');
                  // 直接使用本地的音频进行预览
                  if (a) {
                    playAudio(location.origin + '/assets/huoshan/' + a, d.voice_type);
                  } else {
                    const arr = [];
                    const elements = editor.getGroupElementData();
                    if (elements?.length >= 1) {
                      arr.push(elements[0]);
                    }
                    await createTTS(d, arr);
                  }
                }}
                className={classNames({ [styles.active]: voice ? voice.voice_type === d.voice_type : false })}
                key={d['voice_type']}
              >
                <Popover
                  trigger="click"
                  content={
                    <>
                      <div className={styles.voiceSet} onClick={e => e.stopPropagation()}>
                        <div>
                          <Space className={styles.voiceItem}>
                            <span>语速：</span>
                            <Slider
                              value={setting[d.voice_type].speed || 1}
                              onChange={v => {
                                setting[d.voice_type].speed = v;
                                setSetting({ ...setting });
                              }}
                              onAfterChange={() => {
                                const elements = editor.getGroupElementData();
                                if (elements?.length === 1) {
                                  const item = elements[0];
                                  const resource = resObj.current[item.id];
                                  if (resource) playAudio(resource.storage_path, d.voice_type);
                                }
                              }}
                              min={0.5}
                              max={2}
                              step={0.1}
                              size="small"
                              style={{ width: 100 }}
                            />
                            <InputNumber
                              min={0.5}
                              max={2}
                              step={0.1}
                              size="small"
                              onChange={v => {
                                setting[d.voice_type].speed = v;
                                setSetting({ ...setting });
                              }}
                              onBlur={() => {
                                const elements = editor.getGroupElementData();
                                if (elements?.length === 1) {
                                  const item = elements[0];
                                  const resource = resObj.current[item.id];
                                  if (resource) playAudio(resource.storage_path, d.voice_type);
                                }
                              }}
                              value={setting[d.voice_type].speed || 1}
                              style={{ width: 100 }}
                            />
                          </Space>
                        </div>
                        <div>
                          {d.emotions ? (
                            <Space className={styles.voiceItem}>
                              <span>情绪：</span>
                              {d.emotions.length ? (
                                <Select
                                  onChange={async v => {
                                    setting[d.voice_type].emotion = v;
                                    setSetting({ ...setting });
                                    const arr = [];
                                    const elements = editor.getGroupElementData();
                                    if (elements?.length >= 1) {
                                      arr.push(elements[0]);
                                    }
                                    const res = await createTTS(d, arr);
                                    if (res) playAudio(res.storage_path, d.voice_type);
                                  }}
                                  defaultValue={''}
                                  placeholder="请选择情绪"
                                  style={{ width: 100 }}
                                >
                                  {d.emotions.map(v => (
                                    <Select.Option key={v.value} value={v.value}>
                                      {v.name}
                                    </Select.Option>
                                  ))}
                                </Select>
                              ) : (
                                <>暂无情绪</>
                              )}
                            </Space>
                          ) : (
                            <Space className={styles.voiceItem}>
                              <span>指令：</span>
                              <TextArea
                                placeholder="输入本次说话的情绪、方言、语气、语速等"
                                rows={3}
                                value={setting[d.voice_type].desc || ''}
                                onChange={e => {
                                  setting[d.voice_type].desc = e;
                                  setSetting({ ...setting });
                                }}
                                onBlur={async () => {
                                  const arr = [];
                                  const elements = editor.getGroupElementData();
                                  if (elements?.length >= 1) {
                                    arr.push(elements[0]);
                                  }
                                  const res = await createTTS(d, arr);
                                  if (res) playAudio(res.storage_path, d.voice_type);
                                }}
                                maxCount={300}
                                showClear
                              />
                            </Space>
                          )}
                        </div>
                      </div>
                    </>
                  }
                >
                  <a className={styles.listen} onClick={e => e.stopPropagation()}>
                    <SettingTwo theme="outline" size="14" fill="#fff" />
                  </a>
                </Popover>
                {d.vip ? (
                  <i>
                    <Diamond theme="two-tone" size="12" fill={['#f8e71c', '#f5a623']} strokeWidth={3} />
                  </i>
                ) : null}
                <div className={styles.info}>
                  <img src={d['avatar'] || ''} alt="" />
                  <span>
                    <p>{d['name']}</p>
                    <p title={d['info']} className={styles.lang}>
                      {d['info']}-{!!d.emotions ? 'v1' : 'v2'}
                    </p>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        {totalPages > 1 && (
          <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
            <Pagination
              total={filteredVoices.length}
              size="small"
              showQuickJumper={true}
              currentPage={page}
              pageSize={pageSize}
              onPageChange={p => setPage(p)}
            />
          </div>
        )}
      </div>
      {props.element ? null : (
        <div className={styles.textarea}>
          <TextArea value={text} rows={3} onChange={e => setText(e)} maxCount={300} showClear />
        </div>
      )}
      <div className={styles.btns}>
        <Button block loading={loading} theme="solid" onClick={startRead}>
          {/* {language.val('source_tts_start')} */}
          开始朗读
          {/* <Diamond theme="two-tone" size="12" fill={['#f8e71c', '#f5a623']} strokeWidth={3} style={{ marginLeft: 4 }} /> */}
        </Button>
      </div>
    </div>
  );
};

export default TTS;
