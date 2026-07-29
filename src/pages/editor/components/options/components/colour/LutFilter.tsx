import { useEffect, useState } from 'react';
import type { Editor } from '@stores/editor';
import type { ImageElement } from 'video-core-sdk';
import { ResourceItem, utils } from 'video-core-sdk';
import { Pagination } from '@douyinfe/semi-ui';
import Item from '../item';
import SliderInput from '../slider-input';
import styles from './colour.module.less';
import { remove } from 'lodash';

export interface LutFilterProps {
  editor: Editor;
  elementData: ImageElement;
  forceUpdate: () => void;
}

const PAGE_SIZE = 20;

export default function LutFilter({ editor, elementData, forceUpdate }: LutFilterProps) {
  const [lutMaterials, setLutMaterials] = useState<any[] | null>(null);
  const [lutLoading, setLutLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // 当前 elementData.filters 中的 LutFilter
  const lutFilter = elementData.filters?.find(d => d.name === 'LutFilter');
  const currentImageUrl = lutFilter?.params?.imageUrl;

  const fetchMaterials = async (page: number) => {
    setLutLoading(true);
    const [res]: any = await editor.apiServer.getMaterials({
      type: 'filter',
      page,
      page_size: PAGE_SIZE,
      keyword: '',
      category_id: '',
    });
    if (res?.data) {
      setLutMaterials(res.data);
      setTotal(res.total ?? res.meta?.total ?? 0);
    }
    setLutLoading(false);
  };

  useEffect(() => {
    fetchMaterials(1);
  }, []);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    fetchMaterials(page);
  };

  const applyLutFilter = async (item: any) => {
    if (!elementData.filters) {
      elementData.filters = [];
    }

    const resource = new ResourceItem({
      id: utils.createID(),
      originId: utils.createID(),
      url: item.urls.url,
      name: item.name,
      thumb: item.urls.thumb,
      fileType: 'png',
      type: 'image',
      mustFetch: true,
      styleSize: {
        width: item.attrs.width,
        height: item.attrs.height,
      },
      from: 'system',
    });
    await editor.movie.resourceManage.fetchBlob(resource.url);
    editor.data.resouces.push(resource as any);

    const existing = elementData.filters.find(d => d.name === 'LutFilter');
    if (existing) {
      existing.params = {
        intensity: existing.params?.intensity ?? 1,
        imageUrl: item.urls.url,
        resourceId: resource.id,
      };
    } else {
      elementData.filters.push({
        name: 'LutFilter',
        enabled: true,
        params: { intensity: 1, imageUrl: item.urls.url, resourceId: resource.id },
      });
    }
    if (!elementData.resourceIds) {
      elementData.resourceIds = [];
    }
    elementData.resourceIds.push(resource.id);
    elementData._filtersDirty = utils.createID();
    editor.record({
      type: 'update',
      desc: '应用滤镜',
    });
    editor.updateMovie();
    forceUpdate();
  };

  const setLutIntensity = (v: number) => {
    const existing = elementData.filters?.find(d => d.name === 'LutFilter');
    if (existing) {
      existing.params.intensity = v;
      elementData._filtersDirty = utils.createID();
      editor.updateMovie();
      forceUpdate();
    }
  };

  const removeLutFilter = () => {
    if (!elementData.filters) return;
    const filter = elementData.filters.find(d => d.name === 'LutFilter');
    filter.enabled = false;
    if (elementData.resourceIds) {
      remove(elementData.resourceIds, filter.params.resourceId);
    }
    elementData.filters = elementData.filters.filter(d => d.name !== 'LutFilter');
    elementData._filtersDirty = utils.createID();
    editor.movie.clearUnUsedResource();
    console.log('删除滤镜--->', filter);
    editor.updateMovie();
    editor.record({
      type: 'update',
      desc: '移除滤镜',
    });
    forceUpdate();
  };

  return (
    <div style={{ padding: '0 8px' }}>
      {lutFilter && (
        <Item
          title="强度"
          extra={
            <a onClick={removeLutFilter} style={{ color: 'var(--semi-color-danger)', fontSize: 12 }}>
              移除滤镜
            </a>
          }
        >
          <SliderInput
            min={0}
            max={1}
            step={0.01}
            value={lutFilter.params?.intensity ?? 1}
            onChange={setLutIntensity}
          />
        </Item>
      )}
      {lutLoading && <div style={{ textAlign: 'center', padding: 20 }}>loading...</div>}
      {!lutLoading && lutMaterials && (
        <>
          <div className={styles.lutGrid}>
            {lutMaterials.map((item: any) => {
              const thumb = item.urls?.thumb || item.thumb;
              const isActive = currentImageUrl === item.urls?.url;
              return (
                <div
                  key={item.id}
                  className={`${styles.lutItem} ${isActive ? styles.lutItemActive : ''}`}
                  onClick={() => applyLutFilter(item)}
                >
                  <img src={editor.movie.reURL(thumb)} alt={item.name} />
                  <span className={styles.lutName}>{item.name}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <Pagination
              total={total}
              currentPage={currentPage}
              pageSize={PAGE_SIZE}
              onPageChange={onPageChange}
              size="small"
            />
          </div>
        </>
      )}
    </div>
  );
}
