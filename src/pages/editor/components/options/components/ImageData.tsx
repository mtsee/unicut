import React from 'react';
import Item from '../components/item';
import { Modal, Space, TextArea, Toast, Tooltip } from '@douyinfe/semi-ui';
import { stores } from '@stores/index';
import type { ImageElement } from 'video-core-sdk';
import { util } from '@utils/index';
import { CodeDownload, DownPicture } from '@icon-park/react';

type Props = {};

const ImageData = (props: Props) => {
  const { editor } = stores;
  const element = editor.getElementData() as ImageElement;

  return (
    <Item
      title="原始数据"
      extra={
        <Space>
          <Tooltip content="显示参数">
            <a
              onClick={() => {
                // 获取参数
                console.log('elements', editor.scale);
                Toast.success('console查看');
                const resources = editor.data.resouces.filter(item => element.resourceId === item.id);

                Modal.confirm({
                  title: '数据',
                  content: (
                    <>
                      <TextArea
                        rows={8}
                        value={JSON.stringify(
                          {
                            width: element.style.width / editor.scale,
                            height: element.style.height / editor.scale,
                            data: [element],
                            resources: resources,
                          },
                          null,
                          2,
                        )}
                      />
                    </>
                  ),
                });
              }}
            >
              <CodeDownload size={20} color="var(--theme-icon)" />
            </a>
          </Tooltip>
          <Tooltip content="下载原图">
            <a
              onClick={async () => {
                const resource = editor.data.resouces.find(item => element.resourceId === item.id);
                if (!resource?.url) {
                  Toast.error('资源地址无效');
                  return;
                }
                const url = editor.movie.reURL(resource.url);
                try {
                  const res = await fetch(url);
                  const blob = await res.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = blobUrl;
                  a.download = resource.name || 'image.png';
                  a.click();
                  URL.revokeObjectURL(blobUrl);
                } catch {
                  Toast.error('下载失败');
                }
              }}
            >
              <DownPicture size={20} color="var(--theme-icon)" />
            </a>
          </Tooltip>
        </Space>
      }
    ></Item>
  );
};

export default ImageData;
