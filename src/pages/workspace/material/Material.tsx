import styles from './styles.module.less';
import Content from '@components/content';
import { Progress, Modal, Image, Input, Toast } from '@douyinfe/semi-ui';
import { server } from './server';
import { pubsub, util } from '@utils/index';
import { useEffect, useReducer, useRef, useState } from 'react';
import AudioItem from '@components/audio/AudioItem';
import { language } from '@language/language';
// import { Play, PauseOne } from '@icon-park/react';
// import { layout } from '@stores/layout';

export interface IProps {
  match: any;
}

export default function Material(props: IProps) {
  const [cid = '', cname = ''] = props.match.params.cid?.split('_') || [];
  const [updateContent, setUpdateContent] = useState(1);
  const [playItem, setPlayItem] = useState<any>(null);
  const [item0, setItem0] = useState(null);
  const [name, setName] = useState('');

  const itemFun = item => {
    return (
      <>
        <div data-id={item.id} className={styles.item}>
          {['ready', 'uploadStart', 'uploading', 'decoding'].includes(item.status) && (
            <span className={styles.progress}>
              {item.status === 'ready' && <span className={styles.tips}>上传准备</span>}
              {['uploadStart', 'uploading'].includes(item.status) && (
                <Progress percent={item.progress} strokeWidth={2} showInfo type="circle" width={50} />
              )}
              {item.status === 'decoding' && <span className={styles.tips}>编码中...</span>}
              {/* {item.status === 'uploaded' && <span className={styles.tips}>上传完成</span>} */}
              {item.status === 'error' && (
                <span className={styles.tips} style={{ color: 'red' }}>
                  转码失败
                </span>
              )}
            </span>
          )}
          {item.type === 'video' && (
            <img
              onClick={() => {
                setPlayItem(item);
              }}
              src={util.reURL(item.urls?.thumb)}
              alt=""
            />
          )}
          {item.type === 'audio' && <AudioItem noName={true} item={item} />}
          {item.type === 'image' && (
            <Image
              src={util.reURL(item.urls?.thumb)}
              preview={{
                src: util.reURL(item.urls?.url),
              }}
              alt=""
            />
          )}
          {['audio', 'video'].includes(item.type) && (
            <span className={styles.times}>{util.secondToTime(item.attrs.duration)}</span>
          )}
          <div
            onDoubleClick={() => {
              setItem0(item);
              setName(item.name);
            }}
            title={item.name}
            className={styles.name}
            data-itemid={item.id}
          >
            {item.name}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Content
        key={cid + updateContent}
        title={language.val('common_material')}
        type="material"
        categoryId={cid}
        categoryName={cname}
        itemWidth={160}
        item={itemFun}
        catesCallback={c => {
          console.log(c);
        }}
        itemClassName={''}
        seekItemStatus={server.seekVideoItemStatus}
        getListServer={server.getUserMaterial as any}
        createUserMaterial={server.createUserMaterial as any}
        moveCallBack={async (cid: string, ids: string[]) => {
          pubsub.publish('pageLoading', {
            start: true,
          });
          await server.moveMaterial({
            ids: ids,
            category_id: cid,
          });
          setUpdateContent(+new Date());
          pubsub.publish('pageLoading', {
            end: true,
          });
        }}
      />
      <Modal
        onOk={async () => {
          await server.updateUserMaterial({ id: item0.id, name });
          document.querySelector(`.${styles.name}[data-itemid="${item0.id}"]`).innerHTML = name;
          Toast.success('修改成功!');
          setItem0(null);
        }}
        title="修改文件名称"
        width={400}
        onCancel={() => setItem0(null)}
        visible={!!item0}
      >
        {item0 && (
          <Input
            value={name}
            onChange={e => {
              setName(e);
            }}
          />
        )}
      </Modal>
      <Modal width={800} height={700} footer={null} onCancel={() => setPlayItem(null)} visible={!!playItem}>
        <div className={styles.videoContainer}>
          <div className={styles.video}>
            {playItem && <video style={{ height: 550, maxWidth: '100%' }} controls src={util.reURL(playItem.urls?.url)} />}
          </div>
          <h1>{playItem?.name}</h1>
          <p>{playItem?.attrs?.desc}</p>
        </div>
      </Modal>
    </>
  );
}
