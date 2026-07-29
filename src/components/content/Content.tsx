import styles from './content.module.less';
import { Button, Space, Toast, Upload, Pagination, Modal } from '@douyinfe/semi-ui';
import SourceList from './SourceList';
import { observer } from 'mobx-react';
import { layout } from '@stores/layout';
import { useReducer, useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { userService } from '@server/user.service';
import Folders from './Folders';
import { pubsub } from '@utils/pubsub';
import { util } from '@utils/index';
import _remove from 'lodash/remove';
import { FailPicture, Right, Scissors, Upload as UploadIcon } from '@icon-park/react';
import { Link } from 'react-router-dom';
import SelectedSet from './SelectedSet';
import { user } from '@stores/user';
import { uploadInfo } from '@utils/uploadInfo.es.js';
import { language } from '@language/language';
import { config } from '@config/index';
import VideoSplit from './video-split/VideoSplit';
import PictureSplit from './picture-split/PictureSplit';
import {
  isFSApiSupported,
  getRootHandle,
  getLocalCategoryList,
  createLocalCategory,
} from '@services/localStorageService';

export interface IProps {
  item: (a: any) => JSX.Element;
  itemClassName: string;
  itemWidth: number;
  type: 'draft' | 'material'; // 类型
  title: string | JSX.Element; // 标题
  subTitle?: JSX.Element;
  getListServer: (n: any) => Promise<[any, boolean]>; // 获取素材的回调
  seekItemStatus?: (ids: string[]) => Promise<any>; //  seekItemStatus的回调
  categoryId: string;
  contentHeight?: number; // 内容高度
  categoryName: string;
  catesCallback: (cates: any[]) => void;
  moveCallBack: (cid: string, ids: string[]) => void; // 移动元素的回调
  createUserMaterial?: (params: {
    category_id?: string; // 直接创建到该分类下面
    name: string;
    urls: Record<string, any>;
    attrs: Record<string, any>;
    size?: number;
    convert_status?: number;
  }) => Promise<[any, boolean]>;
}

export interface UploadItem {
  id: string;
  status: 'ready' | 'uploadStart' | 'uploading' | 'decoding' | 'uploaded';
  progress: number; // 当前进度
  type?: string; // 文件类型
  name?: string;
  size?: number; // 文件大小
  thumb?: string; // 缩图
  naturalHeight?: number; // 图片真实尺寸
  naturalWidth?: number;
  duration?: number; // 时长
  // 视频相关
  rotate?: boolean; // 视频是否旋转了
  hasAudioTrack?: boolean; // 视频是否有声音
  videoWidth?: number; // 视频真实尺寸
  videoHeight?: number;
  wave?: string; // 音波json数据
  frames?: string; // 1s单位的帧图
}

function Content(props: IProps, ref: any) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [cates, setCates] = useState([]);
  const [useLocal, setUseLocal] = useState(false);
  const timer = useRef(null);
  const totalRef = useRef(0);
  const [showVideoSplit, setShowVideoSplit] = useState(false);
  const [showImageSplit, setShowImageSplit] = useState(false);
  const params = useRef({
    page: 1,
    page_size: 100,
    keyword: '',
    category_id: props.categoryId || '0',
  });
  // 使用ref存储items避免轮询时的闭包问题
  const itemsRef = useRef<any[] | null>(null);
  // 缓存info数据
  const cacheInfoData = useRef<Record<string, UploadItem>>({});

  // item中convert_status 状态(-1无需处理，0-待处理 1-处理中 2-处理成功 3-处理失败)
  // 0，1 编码中
  // 2 编码成功
  // 3 编码失败
  // 如果状态是0和1轮训，并且修改item.status.decoding，直到状态是2或3,修改item.status为uploaded或error。
  const seekItemStatus = useCallback(
    async ids => {
      if (!itemsRef.current) {
        return;
      }
      if (!props.seekItemStatus) {
        return;
      }
      if (ids.length === 0) {
        forceUpdate();
        return;
      }
      const [res, err] = await props.seekItemStatus(ids);
      if (err) {
        return Toast.error(err);
      }

      // 更新itemsRef中的数据
      const currentItems = itemsRef.current;
      res.forEach(d => {
        const item = currentItems.find(item => item.id === d.source_id);
        if (item) {
          item.convert_status = d.status;
        }
      });
      // 同步更新state
      itemsRef.current = [...currentItems];
      forceUpdate();

      // 继续轮询需要处理的项
      const idArr = res
        .map(d => {
          if ([0, 1].includes(d.status)) {
            return d.source_id;
          }
          return null;
        })
        .filter(d => d !== null);

      if (idArr.length > 0) {
        timer.current = setTimeout(() => {
          seekItemStatus(idArr);
        }, 1000);
      } else {
        timer.current = null;
      }
    },
    [props.seekItemStatus],
  );

  // ref暴露getList方法
  useImperativeHandle(ref, () => ({
    getList,
  }));

  // 获取素材
  const getList = async itemsArr => {
    // 清理之前的轮询
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    const { list, total } = await getItems(props.type, params.current, props.getListServer);
    totalRef.current = total;

    console.log(list, total, 'list.length-------------------------');

    // 同步更新ref和state
    itemsRef.current = [...list];
    forceUpdate();

    // 开始轮询状态变化
    const pendingIds = list
      .map(d => {
        if ([0, 1].includes(d.convert_status)) {
          return d.id;
        }
        return null;
      })
      .filter(d => d !== null);

    if (pendingIds.length > 0) {
      seekItemStatus(pendingIds);
    }
  };

  // 检测本地存储模式
  useEffect(() => {
    if (isFSApiSupported()) {
      getRootHandle().then(handle => setUseLocal(!!handle));
    }
  }, []);

  // 获取全部分类
  const getCategoryList = useCallback(() => {
    const t = props.type === 'draft' ? 'project' : 'material';
    if (useLocal) {
      getLocalCategoryList(t as 'project' | 'material').then(resp => {
        const [res, err] = resp;
        if (err) {
          return Toast.error(err);
        } else {
          setCates(res.data);
          props.catesCallback(res.data);
        }
      });
    } else {
      userService.getCategoryList({ type: t, page: 1, page_size: 100 }).then(resp => {
        const [res, err] = resp;
        if (err) {
          return Toast.error(err);
        } else {
          setCates(res.data);
          props.catesCallback(res.data);
        }
      });
    }
  }, [useLocal]);

  useEffect(() => {
    getCategoryList();
    getList([]);

    return () => {
      layout.cancelSelected();
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = null;
    };
  }, []);

  // 显示上传中的信息
  const uploadList = Object.values(cacheInfoData.current)
    .map(d => {
      return {
        id: d.id,
        name: d.name,
        type: d.type,
        urls: { thumb: d.thumb },
        attrs: {
          width: d.naturalWidth || d.videoWidth || 200,
          height: d.naturalHeight || d.videoHeight || 180,
        },
        status: d.status,
        progress: d.progress,
      };
    })
    .filter(d => {
      return d.status !== 'uploaded';
    });
  // console.log(layout.openSelectManage, items, cates, 'layout.openSelectManage, items, cates');

  return (
    <div className={styles.content}>
      <div className={styles.title}>
        <h1>
          {props.title}
          <Space className={styles.cates}>
            <Link
              to={
                {
                  draft: `/workspace/draft/`,
                  material: `/workspace/material/`,
                }[props.type]
              }
            >
              {language.val('common_all')}
            </Link>
            {props.categoryName ? (
              <>
                <Right theme="outline" size="20" fill="var(--theme-icon)" />
                <span style={{ opacity: 0.5 }}>{props.categoryName}</span>
              </>
            ) : null}
          </Space>
        </h1>
        {layout.openSelectManage && (cates?.length || itemsRef.current?.length) ? (
          <SelectedSet
            cates={cates}
            total={totalRef.current}
            items={itemsRef.current}
            type={props.type}
            moveCallBack={props.moveCallBack}
            removeCallBack={(params: [any[]]) => {
              const [_items] = params;
              itemsRef.current = [..._items];
              forceUpdate();
            }}
          />
        ) : null}
        <Space>
          {props.type === 'material' && (
            <>
              <Button
                icon={<FailPicture theme="outline" size="20" fill="#FFF" />}
                size="large"
                onClick={() => setShowImageSplit(true)}
              >
                <span style={{ color: 'var(--theme-text)' }}>图片分割</span>
              </Button>
              <Button
                icon={<Scissors theme="outline" size="20" fill="#FFF" />}
                size="large"
                onClick={() => setShowVideoSplit(true)}
              >
                <span style={{ color: 'var(--theme-text)' }}>视频分割</span>
              </Button>
            </>
          )}
          {props.type === 'material' && (
            <Upload // .aac, .wav, .mp3,
              accept=".gif, .png, .jpeg, .jpg, .svg, .mp4, .avi, .mov"
              action={'/api/v1/common/upload/form'}
              uploadTrigger="auto"
              headers={{
                Authorization: user.getToken(),
              }}
              multiple={true}
              showUploadList={false}
              className={styles.btn1}
              beforeUpload={async v => {
                console.log(v.file, 'v.file');

                const ftype = v.file.fileInstance.type.split('/')[0];

                let thumb = ftype === 'image' ? v.file.url : '';
                if (ftype === 'image') {
                  const base64 = (await util.blobURL2Data(v.file.url as any)) as string;
                  const thumbBase64 = (await util.resizeBase64Image(base64, 300)) as string;
                  const [res] = await userService.uploadBase64({
                    content: thumbBase64,
                    name: v.file.name,
                    file_type: 'image',
                  });
                  thumb = res.storage_path;
                }

                cacheInfoData.current[v.file.name] = {
                  id: v.file.uid,
                  progress: 0,
                  status: 'ready',
                  thumb,
                  type: v.file.fileInstance.type,
                  size: v.file.fileInstance.size,
                  name: v.file.name,
                };
                forceUpdate();

                // console.log(
                //   v.file,
                //   'v.file.?????',
                //   util.getFileTypeByURL('', v.file.name.split('.').pop().toLowerCase()),
                // );
                // 获取blob url
                const info = await uploadInfo.getUploadBeforeData({
                  url: v.file.url,
                  type: util.getFileTypeByURL('', v.file.name.split('.').pop().toLowerCase()),
                  uploadBase64: userService.uploadBase64,
                });

                Object.assign(cacheInfoData.current[v.file.name], {
                  ...info,
                  status: 'uploadStart',
                  progress: 0,
                  desc: '',
                });
                forceUpdate();

                // 异步执行openaiImageDesc，不阻塞上传业务
                if (['video', 'image'].includes(ftype)) {
                  (async () => {
                    try {
                      if (cacheInfoData.current[v.file.name]) {
                        //@ts-ignore
                        cacheInfoData.current[v.file.name].descWaiting = true;
                      }
                      let base64 = '';
                      if (ftype === 'video') {
                        const res = (await uploadInfo.decoderVideoDrawFrameImage({
                          url: v.file.url,
                          aspectRatio: info.videoWidth / info.videoHeight,
                          audioTrack: null,
                          videoRotation: info.rotate ? 90 : 0,
                          frameScale: 10,
                          duration: info.duration,
                          workerPath: '/assets/worker',
                        })) as any;
                        console.log(res, info, 'res--------->');
                        base64 = await util.blobUrlToBase64(res.url);

                        // base64 缩小5倍，frameScale刚好是2
                        const _img = await util.imgLazy(base64);
                        const base642 = await util.resizeBase64Image(base64, _img.naturalWidth / 5);
                        // 上传到资源服务器
                        const [res2] = await userService.uploadBase64({
                          content: base642,
                          name: util.randomID() + '.png',
                          file_type: 'image',
                        });
                        console.log(res2, 'res2');
                        // 更新cacheInfoData
                        cacheInfoData.current[v.file.name].frames = res2.storage_path;
                      } else {
                        base64 = util.reURL(thumb, config.resourcesHost);
                      }
                      const [res3] = await userService.openaiImageDesc([
                        {
                          role: 'user',
                          content: [
                            {
                              type: 'image_url',
                              image_url: util.reURL(base64, config.resourcesHost),
                            },
                            {
                              type: 'text',
                              text:
                                ftype === 'video'
                                  ? '这是一组1秒/帧的视频帧图，请一句话描述一下视频内容：视频展示了...'
                                  : '这是一张图片，请一句话描述一下图片内容',
                            },
                          ],
                        },
                      ]);

                      if (cacheInfoData.current[v.file.name]) {
                        //@ts-ignore
                        cacheInfoData.current[v.file.name].desc = res3?.choices?.[0]?.message?.content || '';
                        // 描述生成完成，更新状态
                        //@ts-ignore
                        cacheInfoData.current[v.file.name].descWaiting = false;
                        forceUpdate();
                      }
                    } catch (error) {
                      console.error('openaiImageDesc执行失败:', error);
                      // 描述生成失败，更新状态
                      //@ts-ignore
                      cacheInfoData.current[v.file.name].descWaiting = false;
                    }
                  })();
                }

                return {
                  shouldUpload: true,
                  status: 'success',
                };
              }}
              onProgress={(p, file, all) => {
                cacheInfoData.current[file.name].status = 'uploading';
                cacheInfoData.current[file.name].progress = p;
                forceUpdate();
              }}
              onSuccess={async (res, file, all) => {
                if (res.code !== 0) {
                  Toast.error(res.message);
                  cacheInfoData.current[file.name].status = 'uploaded';
                  forceUpdate();
                  return;
                }

                cacheInfoData.current[file.name].status = 'decoding';
                forceUpdate();

                // 等待描述生成完成
                //@ts-ignore
                while (cacheInfoData.current[file.name].descWaiting) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                }

                const { name, thumb, progress, id, status, ...other } = cacheInfoData.current[file.name];
                const attrs = {};
                for (let key in other) {
                  if (key.split('')[0] !== '_') {
                    attrs[key] = other[key];
                  }
                }

                const url = res.data.storage_path;

                // 保存到素材库
                const [item, err] = await props.createUserMaterial({
                  category_id: props.categoryId || '0',
                  name: name,
                  urls: { url, thumb },
                  attrs,
                  convert_status: -1,
                });
                cacheInfoData.current[file.name].status = 'uploaded';
                params.current.page = 1;
                getList([]);
              }}
              onError={(...v) => console.log('error', v)}
            >
              <Button
                iconPosition="left"
                theme="solid"
                type="primary"
                block
                icon={<UploadIcon theme="outline" size="20" fill="#FFF" />}
                size="large"
              >
                {language.val('draft_upload_material')}
              </Button>
            </Upload>
          )}
          {!props.categoryName && (
            <Button
              onClick={async () => {
                const type = {
                  draft: 'project',
                  material: 'material',
                }[props.type] as 'project' | 'material';
                const name = 'Untitled_' + util.randomID(4);
                if (useLocal) {
                  const [res, err] = await createLocalCategory(type, name);
                  if (!err) {
                    getCategoryList();
                    Toast.success(language.val('common_create_success'));
                    pubsub.publish('updateFolders');
                  } else {
                    Toast.error(err);
                  }
                } else {
                  const [res, err] = await userService.saveCategory({ type, name });
                  if (!err) {
                    getCategoryList();
                    Toast.success(language.val('common_create_success'));
                    pubsub.publish('updateFolders');
                  } else {
                    Toast.error(err);
                  }
                }
              }}
              size="large"
              theme="solid"
            >
              {language.val('draft_create_folder')}
            </Button>
          )}
          <Button
            disabled={cates?.length || itemsRef.current?.length ? false : true}
            onClick={() => {
              if (layout.openSelectManage) {
                layout.cancelSelected();
              } else {
                layout.openSelectManage = true;
              }
              forceUpdate();
            }}
            size="large"
          >
            {layout.openSelectManage && (cates?.length || itemsRef.current?.length)
              ? language.val('draft_cancel')
              : language.val('draft_batch_manage')}
          </Button>
        </Space>
      </div>
      {props.subTitle ? props.subTitle : null}
      {!props.categoryId && (
        <Folders
          catesCallback={cs => {
            setCates(cs);
            props.catesCallback(cs);
          }}
          type={props.type}
        />
      )}
      <div className={styles.contents} style={{ height: props.contentHeight || 'auto' }}>
        <SourceList
          itemWidth={props.itemWidth}
          item={props.item}
          itemClassName={props.itemClassName}
          items={[
            ...uploadList,
            ...(itemsRef.current || []).map(d => {
              console.log(d);
              if (d.convert_status === 0 || d.convert_status === 1) {
                d.status = 'decoding';
              } else if (d.convert_status === 2 || d.convert_status === -1) {
                d.status = 'uploaded';
              } else if (d.convert_status === 3) {
                d.status = 'error';
              }
              return d;
            }),
          ].map(d => {
            return {
              ...d,
              thumb: d.urls?.thumb || d.attrs?.thumb || d.thumb,
              width: d.attrs?.width || d.attrs?.naturalWidth || d.attrs?.videoWidth || 200,
              height: d.attrs?.height || d.attrs?.naturalHeight || d.attrs?.videoHeight || 180,
            };
          })}
          type={props.type}
        />
      </div>
      {totalRef.current > 0 && (
        <div className={styles.pagination}>
          <Pagination
            total={totalRef.current}
            pageSize={params.current.page_size}
            currentPage={params.current.page}
            onChange={page => {
              params.current.page = page;
              getList([]);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            showSizeChanger={false}
          />
        </div>
      )}
      <Modal
        visible={showVideoSplit}
        title="视频分割"
        footer={null}
        onCancel={() => setShowVideoSplit(false)}
        onOk={() => setShowVideoSplit(false)}
        width={1200}
      >
        {showVideoSplit && <VideoSplit />}
      </Modal>
      <Modal
        visible={showImageSplit}
        title="图片分割"
        footer={null}
        onCancel={() => setShowImageSplit(false)}
        onOk={() => setShowImageSplit(false)}
        width={1200}
      >
        {showImageSplit && <PictureSplit />}
      </Modal>
    </div>
  );
}

/**
 * 获取素材的列表Items数据
 * @param type
 * @param params
 * @param items
 * @returns
 */
export async function getItems(
  type: 'draft' | 'material', // 类型
  params: {
    page: number;
    page_size: number;
    keyword: string;
    category_id?: string;
    project_id?: string;
  },
  apiServer: (n: any) => Promise<[any, boolean]>,
) {
  const [res, err] = await apiServer({ ...params });

  if (!err) {
    const newData = res.data.map((d: any) => {
      const item: any = { ...d, convert_status: d.convert_status ?? -1 };
      if (type === 'draft') {
        return { ...item, width: 200, height: 180 };
      } else if (type === 'material') {
        if (item.type === 'audio') {
          return { ...item, width: 200, height: 80 };
        } else {
          return {
            ...item,
            width: item.attrs.width || item.attrs.videoWidth || item.attrs.naturalWidth,
            height: item.attrs.height || item.attrs.videoHeight || item.attrs.naturalHeight,
          };
        }
      } else {
        throw new Error('类型不支持', type);
      }
    });

    // 分页模式下直接返回新数据，不合并
    const list = newData;

    return {
      list,
      total: res.total,
    };
  } else {
    return {
      list: [],
      total: 0,
    };
  }
}

//@ts-ignore
export default observer(forwardRef(Content));
