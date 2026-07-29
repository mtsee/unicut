import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import styles from './item.module.less';
import dayjs from 'dayjs';
import { Calendar } from '@icon-park/react';
// import ItemStatusBtn from './ItemStatusBtn';
import ItemStatus from './ItemStatus';
import { config } from '@config/index';
import { getUploadBeforeData } from '@pages/editor/tools/uploadBeforeData';
import { addImageVideoAudioItem } from '../addItem';
import { util } from '@utils/index';
import { transaction } from 'mobx';
import { Pagination } from '@douyinfe/semi-ui';
import { stores } from '@stores/index';

type Props = {};

const Tasks = (props: Props) => {
  const { editor } = stores;
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const pageRef = useRef({
    page: 1,
    page_size: 20,
  });
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const loopInterval = useRef(null);

  const loop = async () => {
    const ids = Object.values(editor.aiLoopStatus).map((d: any) => d.id);
    if (ids.length === 0) {
      return;
    }
    const [res, err] = await editor.apiServer.seekAiTaskStatus(ids);
    if (err) {
      return;
    }
    transaction(() => {
      res.forEach(d => {
        if (editor.aiLoopStatus[d.task_id]) {
          editor.aiLoopStatus[d.task_id] = d;
          editor.aiLoopStatus[d.task_id].status = d.status;
          editor.aiLoopStatus[d.task_id].result = d.result;
        }
      });
    });
    forceUpdate();
  };

  const startLoop = () => {
    // 清除之前的定时器
    if (loopInterval.current) {
      clearInterval(loopInterval.current);
    }
    // 立即执行一次
    loop();
    // 设置定时器，每5秒执行一次
    loopInterval.current = setInterval(loop, 5000);
  };

  const getList = () => {
    console.log('pageRef.current', pageRef.current);
    editor.apiServer.getAiTaskList(pageRef.current).then(r => {
      const [res, err] = r;
      if (err) {
        return;
      }
      setTotal(res.total || 0);
      setItems(res.data || []);
      // 重新开始轮询
      startLoop();
    });
  };

  useEffect(() => {
    getList();
    
    // 清理函数
    return () => {
      if (loopInterval.current) {
        clearInterval(loopInterval.current);
        loopInterval.current = null;
      }
    };
  }, []);

  const addElement = useCallback(async (item: any) => {
    editor.globalLoading = true;
    try {
      const info = await getUploadBeforeData({
        url: editor.movie.reURL(item.result.url),
        type: item.task_type.indexOf('video') !== -1 ? 'video' : 'image',
        workerPath: config.workerPath,
        uploadBase64: editor.apiServer.uploadBase64,
        reURL: editor.movie.reURL,
      });
      console.log('info--------------->', info);
      await addImageVideoAudioItem({
        id: 'ai_' + item.id,
        noAudioTracks: info.noAudioTracks,
        name: util.getFileNameFromUrl(item.result.url),
        type: item.task_type.indexOf('video') !== -1 ? 'video' : 'image',
        urls: {
          thumb: info.thumb,
          url: item.result.url,
        },
        attrs: {
          frames: info.frames || null,
          videoWidth: info.videoWidth || info.naturalWidth,
          videoHeight: info.videoHeight || info.naturalHeight,
          duration: info.duration || 0,
          frameScale: 2,
        },
        from: 'ai',
      });
      editor.globalLoading = false;
    } catch (error) {
      console.error('添加元素失败', error);
      editor.globalLoading = false;
    }
  }, []);

  const deleteItem = useCallback(async (data: any) => {
    try {
      await editor.apiServer.deleteAiTask(data.id);
      util.clearSleep();
      getList();
    } catch (error) {
      console.error('删除元素失败', error);
    }
  }, []);

  return (
    <div className={styles.tasks + ' scroll'}>
      {items.map(item => {
        item = editor.aiLoopStatus[item.id] || item;
        const poster = item.params.content
          ? item.params.content.find(d => d.type === 'image_url')?.image_url.url
          : item.params.image;

        return (
          <div key={item.id} className={styles.item}>
            <div className={styles.view}>
              {item.task_type.indexOf('video') !== -1 && (
                <video poster={poster} src={editor.movie.reURL(item.result?.url)} controls />
              )}
              {item.task_type.indexOf('image') !== -1 && (
                <img src={editor.movie.reURL(item.result?.url)} alt={item.params.prompt} />
              )}
            </div>
            <ItemStatus deleteItem={deleteItem} data={item} status={item.status} />
            <div className={styles.footer}>
              <div className={styles.date}>
                <Calendar theme="outline" size="16" fill={'var(--theme-icon)'} strokeWidth={3} />
                <span>&nbsp;{dayjs(item.updatedAt).format('YYYY-MM-DD hh:mm:ss')}</span>
              </div>
              {item.status === 3 ? (
                <a onClick={() => addElement(item)} className={styles.add}>
                  +
                </a>
              ) : (
                <span></span>
              )}
            </div>
          </div>
        );
      })}
      <div className={styles.pagination}>
        <Pagination
          total={total}
          defaultCurrentPage={pageRef.current.page}
          pageSize={pageRef.current.page_size}
          style={{ marginBottom: 12 }}
          onChange={page => {
            pageRef.current.page = page;
            getList();
          }}
        ></Pagination>
      </div>
    </div>
  );
};

export default observer(Tasks);
