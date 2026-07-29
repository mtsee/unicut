import styles from './styles.module.less';
import { useEffect, useRef, useState } from 'react';
import { paint } from './paint';
import { loadImage } from './tools';
import DrawLine from './DrawLine';
import { Toast, Spin } from '@douyinfe/semi-ui';

import { imageThumb } from '@pages/editor/tools/uploadBeforeData';
import { pubsub, util } from '@utils/index';
import type { ImageElement } from 'video-core-sdk';
import { ResourceItem, utils } from 'video-core-sdk';
import { language } from '@language/language';
import { stores } from '@stores/index';

export interface IProps {
  url: string;
  callback: () => void;
}

export default function RubberImage(props: IProps) {
  const { editor } = stores;
  const [loading, setLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>();
  const imgs = useRef<string[]>([props.url]);
  const [img, setImg] = useState({
    url: props.url,
    width: 0,
    height: 0,
  }); // 图片背景

  useEffect(() => {
    loadImage(img.url).then(_img => {
      img.width = _img.naturalWidth;
      img.height = _img.naturalHeight;
      setImg({ ...img });
    });
  }, []);

  // 计算一个scale
  let scale = (1000 - 100) / img.width;
  if (scale > 1) {
    scale = 1;
  }

  return (
    <Spin tip="loading..." spinning={loading}>
      <div className={styles.imgbox}>
        {img.url && img.width && (
          <DrawLine
            history={
              <div className={styles.history}>
                {imgs.current.map((d, i) => {
                  return (
                    <section key={i}>
                      <img
                        onClick={() => {
                          setImg({
                            ...img,
                            url: d,
                          });
                        }}
                        width={36}
                        src={d}
                      />
                    </section>
                  );
                })}
              </div>
            }
            onOk={async () => {
              if (img.url === props.url) {
                Toast.warning(language.val('timeline_top_ai_matting_no_modify'));
              } else {
                console.log(img.url);
                // 1、获取base64图片
                const base64 = img.url;
                const attrs = await imageThumb(base64, 200);
                // 2、base64上传服务器
                const name = 'aimatting_' + util.randomID() + '.png';
                const [res] = await editor.apiServer.uploadBase64({
                  content: base64,
                  name: name,
                });
                const [thumbRes] = await editor.apiServer.uploadBase64({
                  content: attrs._base64,
                  name: 'thumb_' + util.randomID() + '.png',
                });
                // 保存到素材库
                const [item, err] = await editor.apiServer.createUserMaterial({
                  name,
                  app_id: editor.appid,
                  urls: { url: res.storage_path, thumb: thumbRes.storage_path },
                  attrs: {
                    naturalWidth: img.width,
                    naturalHeight: img.height,
                  },
                });
                pubsub.publish('addItemToCloudList', item);
                // 3、添加素材到resource
                const resource = new ResourceItem({
                  id: utils.createID(),
                  originId: item.id,
                  url: item.urls.url,
                  name: item.name,
                  fileType: item.type,
                  type: item.type as any,
                  mustFetch: item.type === 'image' ? true : false,
                  thumb: item.urls.thumb,
                  styleSize: {
                    width: item.attrs.videoWidth || item.attrs.naturalWidth || Number(item.attrs.width),
                    height: item.attrs.videoHeight || item.attrs.naturalHeight || Number(item.attrs.height),
                  },
                  duration: item.attrs.duration,
                  from: 'user',
                  attrs: { ...item.attrs },
                });
                editor.data.resouces.push(resource);
                // 4、然后替换素材
                const elementData = editor.getElementData() as ImageElement;
                elementData.resourceId = resource.id;
                const scale = elementData.style.width / resource.styleSize.width;
                elementData.style.height = resource.styleSize.height * scale;
                elementData._dirty = util.randomID();
                editor.updateMovie();
                editor.updateTimeline();
                setLoading(false);
                props.callback();
              }
            }}
            onRun={async base64 => {
              if (!base64) {
                Toast.error(language.val('timeline_top_ai_matting_unmarked'));
                return;
              }
              setLoading(true);
              const _img = await loadImage(img.url);
              const res = await paint(_img, base64);
              imgs.current.push(res);
              setImg({
                ...img,
                url: res,
              });
              setLoading(false);
            }}
            scale={scale}
            width={img.width}
            height={img.height}
          >
            <img
              style={{
                width: img.width * scale,
                height: img.height * scale,
              }}
              ref={imgRef}
              className={styles.img}
              src={img.url}
            />
          </DrawLine>
        )}
      </div>
    </Spin>
  );
}
