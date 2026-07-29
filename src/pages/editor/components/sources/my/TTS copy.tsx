import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { getUploadBeforeData } from '@pages/editor/tools/uploadBeforeData';
import { addImageVideoAudioItem } from '../addItem';
import { language } from '@language/language';
import { config } from '@config/index';
import { stores } from '@stores/index';
import type { TextElement } from 'video-core-sdk';
import { IconSearch } from '@douyinfe/semi-icons';

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
  const [resObj, setResObj] = useState<any>({});
  const [page, setPage] = useState(1);
  const pageSize = 40;
  const LOCAL_AUDIO_DIR = '/assets/huoshan';
  const MISSING_SPEAKERS = [
    'zh_female_sajiaxuemei_uranus_bigtts',
    'zh_female_meiliinvyou_uranus_bigtts',
    'zh_male_baqingshu_uranus_bigtts',
    'zh_female_tiexinvsheng_uranus_bigtts',
  ];

  const audio = useMemo(() => document.createElement('audio'), []);

  const isLocalAudioAvailable = useCallback((speaker: string) => {
    if (MISSING_SPEAKERS.includes(speaker)) {
      return false;
    }
    return true;
  }, []);

  const getLocalAudioUrl = useCallback((speaker: string) => {
    return `${LOCAL_AUDIO_DIR}/${speaker}.mp3`;
  }, []);

  useEffect(() => {
    Promise.all([fetchJSON('/assets/zijie1.json'), fetchJSON('/assets/zijie2.json')])
      .then((data: any[]) => {
        const [a1, a2] = data;
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

  const createTTS = async (voice: any, useLocalFirst: boolean = true): Promise<any> => {
    if (!voice) {
      return Toast.error(language.val('source_tts_please_select'));
    }
    setLoading(true);
    const obj = {};
    const speaker = voice.voice_type;

    if (useLocalFirst && isLocalAudioAvailable(speaker)) {
      const localUrl = getLocalAudioUrl(speaker);
      for (const item of props.element || []) {
        const t = item.text || text;
        if (!t) continue;
        obj[item.id] = {
          storage_path: localUrl,
          text: t,
          voice_type: speaker,
          desc: setting[speaker].desc,
          isLocalAudio: true,
        };
      }
      if (props.element?.length === 1) {
        const item = props.element[0];
        audio.pause();
        audio.src = localUrl;
        audio.playbackRate = setting[speaker].speed || 1;
        audio.play();
      }
      setResObj({ ...resObj, ...obj });
      setLoading(false);
      return Object.values(obj)[0];
    }

    for (const item of props.element || []) {
      const t = item.text || text;

      if (!t) continue;

      let res = null;
      let err = null;
      if (
        resObj[item.id] &&
        !resObj[item.id].isLocalAudio &&
        resObj[item.id].emotion === setting[voice.voice_type].emotion &&
        resObj[item.id].desc === setting[voice.voice_type].desc &&
        resObj[item.id].text === t &&
        Object.values(resObj)
          .map((d: any) => d.voice_type)
          .includes(voice.voice_type)
      ) {
        res = resObj[item.id];
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
    if (props.element?.length === 1) {
      const item = props.element[0];
      playAudio(obj[item.id].storage_path, voice.voice_type);
    }
    setResObj({ ...resObj, ...obj });
    setLoading(false);

    return Object.values(obj)[0];
  };

  const playAudio = (storage_path: string, voice_type: string) => {
    audio.pause();
    audio.src = editor.movie.reURL(storage_path);
    audio.playbackRate = setting[voice_type].speed || 1;
    audio.play();
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
                  await createTTS(d);
                }}
                className={classNames({ [styles.active]: voice ? voice.voice_type === d.voice_type : false })}
                key={d['voice_type']}
              >
                <Popover
                  trigger="hover"
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
                                if (props.element?.length === 1) {
                                  const item = props.element[0];
                                  const resource = resObj[item.id];
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
                                if (props.element?.length === 1) {
                                  const item = props.element[0];
                                  const resource = resObj[item.id];
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
                                    const res = await createTTS(d);
                                    if (props.element?.length === 1) {
                                      if (res) playAudio(res.storage_path, d.voice_type);
                                    }
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
                                  const res = await createTTS(d);
                                  if (props.element?.length === 1) {
                                    if (res) playAudio(res.storage_path, d.voice_type);
                                  }
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
                {(d.vip || !!d.emotions?.length) && (
                  <i>
                    <Diamond theme="two-tone" size="12" fill={['#f8e71c', '#f5a623']} strokeWidth={3} />
                  </i>
                )}
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
        <Button
          block
          loading={loading}
          theme="solid"
          onClick={async () => {
            if (voice) {
              await createTTS(voice, false);
            }
            for (const elm of props.element) {
              const res = resObj[elm.id];
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
              const [item, err2] = await editor.apiServer.createUserMaterial({
                name: text.substring(0, 12),
                app_id: editor.appid,
                urls: { url: res.storage_path },
                attrs: { duration: info.duration, wave: info.wave, voice_from: 'huoshan', voice: voice.voice_type },
              });
              if (err2) {
                return Toast.error(err2);
              }
              //@ts-ignore
              item.speed = setting[voice.voice_type].speed || 1;
              props.addItem(item);
              await addImageVideoAudioItem(item, elm.startTime);
            }
            Toast.success(language.val('source_tts_success'));
            if (props.element.length === 1) {
              const item = props.element[0];
              if (item?.id) {
                editor.setContorlAndSelectedElemenent([item.id]);
              }
            }
          }}
        >
          {language.val('source_tts_start')}
        </Button>
      </div>
    </div>
  );
};

export default TTS;
