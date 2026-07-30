import styles from './list.module.less';
import {
  Tooltip,
  Button,
  Space,
  Modal,
  Select,
  Upload,
  Toast,
  Dropdown,
  Popover,
  Pagination,
  Empty,
} from '@douyinfe/semi-ui';
import { Voice, Left, VoiceInput, Upload as UploadIcon, DeleteFive, Close, Refresh } from '@icon-park/react';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { getUploadBeforeData, isAPNG } from '@pages/editor/tools/uploadBeforeData';
import { pubsub, util } from '@utils/index';
import SourceList from '@pages/editor/common/source/SourceList';
import { Progress, Checkbox } from '@douyinfe/semi-ui';
import { utils } from 'video-core-sdk';
import { MusicRhythm, ScanCode, Plus, Like } from '@icon-park/react';
import RecordAudioBox from './RecordAudioBox';
import { IllustrationNoContent, IllustrationNoContentDark } from '@douyinfe/semi-illustrations';
import TTS from './TTS';
// import { uploadInfo } from '@pages/editor/tools/uploadInfo';
import Decoding from './Decoding';
import Intl from '@language/Intl';
import { language } from '@language/language';
import QrcodeUpload from './QrcodeUpload';
import LottieItem from '../lottie/LottieItem';
import { IconTreeTriangleDown } from '@douyinfe/semi-icons';
import { config } from '@config/index';
import { stores } from '@stores/index';
import {
  addMaterial as addLocalMaterial,
  getMaterialDisplayItems,
  deleteMaterial as deleteLocalMaterial,
  createLocalUploadBase64,
} from '@services/localStorageService';
import { checkAndConvert } from './uploadDecode';

export interface IProps {
  type: 'local' | 'cloud';
}

export interface UploadItem {
  fileInfoSuccess: boolean;
  id: string;
  uid: string;
  status: 'ready' | 'uploadStart' | 'uploading' | 'decoding' | 'uploaded';
  progress: number;
  type?: string;
  name?: string;
  size?: number;
  thumb?: string;
  naturalHeight?: number;
  naturalWidth?: number;
  duration?: number;
  rotation?: number;
  rotate?: boolean;
  noAudioTracks?: boolean;
  videoWidth?: number;
  videoHeight?: number;
  wave?: string;
  frames?: string;
}

export default function List(props: IProps) {
  const { editor } = stores;
  const [items, setItems] = useState(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [listKey, setListKey] = useState(0);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkboxs, setCheckboxs] = useState([]);
  const [showType, setShowType] = useState('');
  const [cates, setCates] = useState([]);
  const uploadRef = useRef();
  const cacheInfoData = useRef<Record<string, UploadItem>>({});
  const params = useRef<any>({
    app_id: props.type === 'cloud' ? '' : editor.appid,
    page: 1,
    page_size: 40,
    keyword: '',
    category_id: '',
  });

  const getList = useCallback(async () => {
    setLoading(true);

    // 本地存储模式：从 IndexedDB 读取
    if (editor.useLocalStorage) {
      try {
        const res = await getMaterialDisplayItems(editor.appid);
        const list = res.map((d: any) => {
          return {
            ...d,
            convert_status: d.convert_status ?? -1,
            thumb: d.urls?.thumb || d.attrs?.thumb,
            width: d.attrs?.videoWidth || d.attrs?.naturalWidth || Number(d.attrs?.width) || 200,
            height: d.attrs?.videoHeight || d.attrs?.naturalHeight || Number(d.attrs?.height) || 160,
          };
        });
        setItems(list);
        setTotal(list.length);
      } catch (e) {
        console.error('读取本地素材失败:', e);
        // 保持现有列表，不清空
      }
    }
    setLoading(false);
  }, [editor.appid, editor.useLocalStorage]);

  const getCates = useCallback(async () => {
    const [res, err] = await editor.apiServer.getUserMaterialType({ page: 1, type: 'material', page_size: 99 });
    setCates(res.data || []);
  }, []);

  const handlePageChange = (page: number) => {
    params.current.page = page;
    getList();
  };

  useEffect(() => {
    getList();
    getCates();
  }, [editor.appid, editor.useLocalStorage]);

  useEffect(() => {
    if (props.type === 'cloud') {
      pubsub.subscribe('addItemToCloudList', (_msg, item) => {
        setItems(prev => [item, ...(prev || [])]);
      });
    }

    return () => {
      if (props.type === 'cloud') {
        pubsub.unsubscribe('addItemToCloudList');
      }
    };
  }, [props.type]);

  const uploadList = Object.values(cacheInfoData.current)
    .filter(d => d.status !== 'uploaded')
    .map(d => {
      return {
        id: d.id,
        uid: d.uid,
        name: d.name,
        type: d.type,
        urls: { thumb: d.thumb },
        attrs: {
          width: d.naturalWidth || d.videoWidth || 200,
          height: d.naturalHeight || d.videoHeight || 180,
        },
        status: d.status,
        progress: d.progress,
        thumb: d.thumb,
        width: d.naturalWidth || d.videoWidth || 200,
        height: d.naturalHeight || d.videoHeight || 160,
      };
    });

  const sourceItems = [...uploadList, ...(items || [])];

  const beforeUpload = async v => {
    if (!editor.userInfo) {
      Toast.warning(language.val('toast_please_login'));
      return { shouldUpload: false, status: 'error' };
    }

    const fileInstance = v.file.fileInstance;
    const ftype = fileInstance.type.split('/')[0];
    const uid = v.file.uid;

    // === 本地存储模式 ===
    // 验证项目 ID
    if (!editor.appid) {
      Toast.error('项目 ID 未设置，请先保存项目');
      return { shouldUpload: false, status: 'error' };
    }

    // 添加到来货清单
    cacheInfoData.current[uid] = {
      fileInfoSuccess: false,
      id: uid,
      uid: uid,
      progress: 10,
      status: 'ready',
      thumb: ftype === 'image' ? v.file.url : '',
      type: fileInstance.type,
      size: fileInstance.size,
      name: v.file.name,
    };
    forceUpdate();

    try {
      // 处理文件并获取信息（不上传服务器）
      const materialType = util.getFileTypeByURL('', v.file.name.split('.').pop()?.toLowerCase() || '');
      const isVideoMaterial = materialType === 'video' || fileInstance.type.startsWith('video/');

      // 视频文件：先转码为 mp4/h264/yuv420p，再提取帧图/音波
      let uploadFile: File = fileInstance;
      let convertStatus = -1; // -1 无需处理

      if (isVideoMaterial) {
        cacheInfoData.current[uid].status = 'decoding';
        forceUpdate();

        try {
          const videoBlobUrl = URL.createObjectURL(fileInstance);
          const convertResult = await checkAndConvert(videoBlobUrl, {
            file: fileInstance,
            type: materialType,
            ext: fileInstance.name.split('.').pop()?.toLowerCase() || '',
            onProgress: p => {
              const pct = 10 + Math.round(p.percent * 0.5); // 10%→60%
              cacheInfoData.current[uid].progress = Math.min(pct, 60);
              forceUpdate();
            },
          });
          URL.revokeObjectURL(videoBlobUrl);

          if (convertResult.converted) {
            convertStatus = 2; // 转码成功
            const res = await fetch(convertResult.url);
            const blob = await res.blob();
            URL.revokeObjectURL(convertResult.url);

            // 用转码后的 mp4 替换原始文件
            const mp4Name = fileInstance.name.replace(/\.[^.]+$/, '.mp4') || `${fileInstance.name}.mp4`;
            uploadFile = new File([blob], mp4Name, { type: 'video/mp4' });
          } else {
            convertStatus = -1; // 无需转码
          }
        } catch (err) {
          console.warn('视频转码失败，使用原始文件:', err);
          convertStatus = 3; // 转码失败
        }

        cacheInfoData.current[uid].progress = 60;
        forceUpdate();
      } else {
        // 非视频：更新进度
        cacheInfoData.current[uid].status = 'uploadStart';
        forceUpdate();
      }

      // 使用 getUploadBeforeData 获取素材信息（统一处理所有类型）
      // 通过本地 uploadBase64 直接将帧图/音波数据保存到文件夹
      const relativeDir = `materials/${editor.appid}/${materialType}`;
      const uploadFileUrl = URL.createObjectURL(uploadFile);
      const uploadInfo = await getUploadBeforeData({
        url: uploadFileUrl,
        type: materialType as any,
        stopDrawFrame: true, // 截帧比较慢，这里关闭，添加到时间轴后再异步截帧
        workerPath: config.workerPath,
        file: uploadFile,
        uploadBase64: createLocalUploadBase64(relativeDir),
      });
      URL.revokeObjectURL(uploadFileUrl);

      const attrs: Record<string, any> = {};
      const skipKeys = [
        'thumb',
        '_base64',
        '_localThumb',
        '_localFrames',
        '_localWave',
        '_localURL',
        'url',
        'file',
        'reURL',
        'uploadBase64',
        'wave',
        'frames',
      ];
      for (const key in uploadInfo) {
        if (!skipKeys.includes(key) && !key.startsWith('_')) {
          attrs[key] = uploadInfo[key];
        }
      }

      // 写入本地文件系统 + IndexedDB（转码已在上面完成）
      cacheInfoData.current[uid].status = 'uploading';
      cacheInfoData.current[uid].progress = isVideoMaterial ? 85 : 70;
      forceUpdate();

      if (isVideoMaterial) {
        attrs.convert_status = convertStatus;
      }

      await addLocalMaterial({
        appId: editor.appid,
        name: uploadFile.name,
        type: materialType,
        file: uploadFile,
        thumbPath: uploadInfo.thumb,
        framesPath: uploadInfo.frames,
        wavePath: uploadInfo.wave,
        width: attrs.naturalWidth || attrs.videoWidth || 200,
        height: attrs.naturalHeight || attrs.videoHeight || 160,
        attrs,
        from: 'user',
      });

      // 标记完成
      cacheInfoData.current[uid].status = 'uploaded';
      cacheInfoData.current[uid].progress = 100;
      forceUpdate();

      // 刷新列表
      setTimeout(() => getList(), 300);
    } catch (err) {
      console.error('本地存储素材失败:', err);
      Toast.error('存储素材失败，请重试');
      if (cacheInfoData.current[uid]) {
        cacheInfoData.current[uid].status = 'ready';
        cacheInfoData.current[uid].progress = 0;
      }
      forceUpdate();
    }

    return { shouldUpload: false, autoRemove: true };
  };

  return (
    <>
      {checkboxs.length !== 0 && (
        <div className={styles.checkboxBtns}>
          <span>选中: {checkboxs.length}个</span>
          <Space>
            <Button
              icon={<DeleteFive theme="filled" size="14" fill="var(--semi-color-danger)" />}
              onClick={() => {
                Modal.confirm({
                  title: language.val('source_delete_confirm'),
                  content: language.val('source_delete_confirm_tips'),
                  onOk: async () => {
                    // 本地存储模式
                    if (editor.useLocalStorage) {
                      for (const id of checkboxs) {
                        await deleteLocalMaterial(id);
                      }
                      Toast.success(language.val('source_delete_success'));
                      setItems(items.filter(d => !checkboxs.includes(d.id)));
                      setCheckboxs([]);
                      setTotal(total - checkboxs.length);
                      return;
                    }

                    // 云端模式
                    const [res, err] = await editor.apiServer.deleteUserMaterial([...checkboxs]);
                    if (!err) {
                      Toast.success(language.val('source_delete_success'));
                      setItems(items.filter(d => !checkboxs.includes(d.id)));
                      setCheckboxs([]);
                      setTotal(total - checkboxs.length);
                    }
                  },
                });
              }}
              type="danger"
            >
              <Intl name="source_delete_button" />
            </Button>
            <Button
              icon={<Close theme="filled" size="14" fill="var(--semi-color-primary)" />}
              onClick={() => {
                setCheckboxs([]);
              }}
            >
              <Intl name="source_cancel_button" />
            </Button>
          </Space>
        </div>
      )}
      {checkboxs.length === 0 && (
        <div className={styles.btns}>
          {props.type === 'local' ? (
            <Space style={{ width: '100%' }}>
              <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                <Upload
                  style={{ width: 'calc(100% - 35px)' }}
                  accept=".gif, .png, .jpeg, .jpg, .svg, .lottie, .aac, .wav, .mp3, .mp4, .mov"
                  action={'/api/v1/common/upload/form'}
                  uploadTrigger="auto"
                  headers={{
                    Authorization: editor.token,
                  }}
                  ref={uploadRef}
                  // maxSize={100 * 1024}
                  multiple={true}
                  draggable={true}
                  showUploadList={false}
                  className={styles.btn1}
                  beforeUpload={beforeUpload}
                  onProgress={(p, file: any, all: any) => {
                    const uid = file.uid;
                    if (cacheInfoData.current[uid]) {
                      cacheInfoData.current[uid].status = 'uploading';
                      cacheInfoData.current[uid].progress = p;
                      forceUpdate();
                    }
                  }}
                  onSuccess={async (res, file: any, all: any) => {
                    const uid = file.uid;
                    if (res.code !== 0) {
                      Toast.error(res.message);
                      if (cacheInfoData.current[uid]) {
                        cacheInfoData.current[uid].status = 'uploaded';
                      }
                      forceUpdate();
                      return;
                    }

                    // 视频文件不需要显示"编码中"，直接等待截帧完成
                    if (cacheInfoData.current[uid]) {
                      cacheInfoData.current[uid].status = 'uploadStart';
                      forceUpdate();
                    }

                    while (cacheInfoData.current[uid] && !cacheInfoData.current[uid].fileInfoSuccess) {
                      console.log('等待截取帧');
                      await util.sleep(1000);
                    }
                    console.log('截帧完成!');

                    const cachedItem = cacheInfoData.current[uid];
                    if (!cachedItem) return;

                    const { name, thumb, progress, id, status, uid: cachedUid, ...other } = cachedItem;
                    const attrs: Record<string, any> = {};
                    for (let key in other) {
                      if (key.split('')[0] !== '_') {
                        attrs[key] = other[key];
                      }
                    }
                    // 补充 width、height 参数
                    if (attrs.type === 'image') {
                      attrs.width = Number(attrs.naturalWidth) || 0;
                      attrs.height = Number(attrs.naturalHeight) || 0;
                    } else if (attrs.type === 'video') {
                      attrs.width = Number(attrs.videoWidth) || 0;
                      attrs.height = Number(attrs.videoHeight) || 0;
                    }
                    const url = res.data.storage_path;
                    const [item, err] = await editor.apiServer.createUserMaterial({
                      app_id: editor.appid,
                      name: name,
                      urls: { url, thumb },
                      attrs,
                      convert_status: -1,
                    });

                    if (cacheInfoData.current[uid]) {
                      cacheInfoData.current[uid].status = 'uploaded';
                    }
                    forceUpdate();

                    if (!err && item) {
                      getList();
                    }
                  }}
                  onError={(...v) => console.log('error', v)}
                >
                  <Button
                    iconPosition="left"
                    theme="solid"
                    type="primary"
                    onClick={() => {
                      setShowType('');
                    }}
                    block
                    icon={<UploadIcon theme="outline" size="20" fill="#FFF" />}
                  >
                    <Intl name="my_upload" />
                  </Button>
                </Upload>
                <Dropdown
                  menu={[
                    {
                      node: 'item',
                      icon: <Voice theme="outline" size="20" fill="var(--theme-icon)" />,
                      name: language.val('source_record'),
                      onClick: () => {
                        setShowType('record');
                      },
                    },
                    {
                      node: 'item',
                      icon: <VoiceInput theme="outline" size="20" fill="var(--theme-icon)" />,
                      name: language.val('source_tts'),
                      onClick: () => {
                        setShowType('tts');
                      },
                    },
                  ]}
                  trigger="click"
                  position="bottomRight"
                >
                  <Button
                    style={{ marginLeft: 4 }}
                    theme="solid"
                    type="primary"
                    icon={<IconTreeTriangleDown />}
                  ></Button>
                </Dropdown>
              </div>
              {editor.exConfig?.mobileUpload && (
                <QrcodeUpload
                  refresh={async () => {
                    cacheInfoData.current = {};
                    params.current.page = 1;
                    setListKey(+new Date());
                    await getList();
                  }}
                />
              )}
            </Space>
          ) : (
            <Select
              defaultValue={language.val('source_root_dir')}
              onChange={v => {
                Object.assign(params.current, {
                  page: 1,
                  page_size: 20,
                  keyword: '',
                  category_id: v,
                });
                setItems([]);
                getList();
              }}
              style={{ width: '100%' }}
            >
              <Select.Option value={0}>{language.val('source_root_dir')}</Select.Option>
              {cates.map(d => {
                return (
                  <Select.Option key={d.id} value={d.id}>
                    &nbsp;&nbsp;&nbsp;{d.name}
                  </Select.Option>
                );
              })}
            </Select>
          )}
        </div>
      )}
      <div
        className={styles.list + ' scroll'}
        id={`sourceItemsScrollDOM_${props.type}`}
        onWheel={() => {
          if (editor.previewSource) {
            editor.previewSource = null;
          }
        }}
      >
        {showType === '' && !!items && !sourceItems.length && (
          <div className={styles.emptySource}>
            <Empty
              image={<IllustrationNoContent style={{ width: 150, height: 150 }} />}
              darkModeImage={<IllustrationNoContentDark style={{ width: 150, height: 150 }} />}
              description={
                <div className={styles.loginTip}>
                  <Intl name="my_tab_no_material" />
                </div>
              }
              style={{ padding: 30 }}
            />
          </div>
        )}
        {!items && !sourceItems.length && <span style={{ padding: 20 }}>loading...</span>}
        {showType === 'record' && (
          <>
            <a
              onClick={() => {
                setShowType('');
              }}
              className={styles.back}
            >
              <Left theme="filled" size="24" fill="var(--theme-icon)" />
              在线录音
            </a>
            <RecordAudioBox
              onCancel={() => setShowType('')}
              addItem={item => {
                getList();
              }}
            />
          </>
        )}
        {showType === 'tts' && (
          <>
            <a
              onClick={() => {
                setShowType('');
              }}
              className={styles.back}
            >
              <Left theme="filled" size="24" fill="var(--theme-icon)" />
              {language.val('source_tts')}
            </a>
            <TTS
              onCancel={() => setShowType('')}
              ttsStyle={{ height: 'calc(100% - 175px)' }}
              style={{ height: 'calc(100% - 40px)', maxHeight: 'none' }}
              addItem={item => {
                getList();
              }}
            />
          </>
        )}
        {showType === '' && !!sourceItems.length && (
          <SourceList
            type={'video'}
            key={listKey}
            total={total}
            page={params.current.page}
            pageSize={params.current.page_size}
            loading={loading}
            checkboxs={checkboxs}
            onChangeCheckboxs={id => {
              if (checkboxs.includes(id)) {
                setCheckboxs(checkboxs.filter(d => d !== id));
              } else {
                setCheckboxs([...checkboxs, id]);
              }
            }}
            items={sourceItems}
            onPageChange={handlePageChange}
            item={(d: any) => {
              return (
                <>
                  {d.progress !== undefined && (
                    <span className={styles.progress}>
                      {d.status === 'ready' && <span className={styles.tips}>上传准备</span>}
                      {['uploadStart', 'uploading', 'decoding'].includes(d.status) && (
                        <Progress percent={d.progress} strokeWidth={2} showInfo type="circle" width={50} />
                      )}
                      {d.status === 'uploaded' && <span className={styles.tips}>上传完成</span>}
                    </span>
                  )}
                  {d.status !== 'uploading' && (
                    <Decoding
                      item={d}
                      callback={obj => {
                        const item = itemsRef.current?.find(a => a.id === d.id);
                        if (item) {
                          Object.assign(item, obj);
                        }
                        setItems(prev => [...(prev || [])]);
                      }}
                    />
                  )}
                  {d.status !== 'ready' && d.type === 'audio' ? (
                    <span className={styles.myAudioItem}>
                      <MusicRhythm theme="filled" size="60" fill="#009006" />
                    </span>
                  ) : d.status !== 'ready' && d.type === 'lottie' ? (
                    <span className={styles.myAudioItem}>
                      <Like theme="filled" size="60" fill="#FF6B6B" />
                    </span>
                  ) : d.status !== 'ready' && d.type === 'sticker' ? (
                    <LottieItem item={d} />
                  ) : (
                    <img
                      src={editor.movie.reURL(d.urls?.thumb || d.thumb)}
                      style={{ display: d.urls?.thumb || d.thumb ? 'block' : 'none' }}
                    />
                  )}
                  {['audio', 'video'].includes(d.type) && (
                    <i className={styles.time}>{utils.secToTime(d.attrs?.duration || 0, 'mm:ss')}</i>
                  )}
                  <p className={styles.name}>{d.name}</p>
                </>
              );
            }}
            itemClassName={styles.myItem}
          />
        )}
      </div>
    </>
  );
}
