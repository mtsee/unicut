// @ts-nocheck
import BasicService from '@server/BasicService';
import type * as st from '@config/sdk.d';
import { localDB } from '@database/localDB';
import { getMaterialFileUrlCached } from '@services/localStorageService';

const genId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

class Server extends BasicService {
  /**
   * 获取用户素材列表（IndexedDB）
   */
  getUserMaterial = async (params: st.UserMaterialParams) => {
    try {
      let collection = localDB.materials.orderBy('createdAt').reverse();
      if (params.keyword) {
        collection = collection.filter(m => m.name.includes(params.keyword));
      }
      if (params.category_id && params.category_id !== '0') {
        collection = collection.filter(m => m.tag === params.category_id);
      }
      if (params.type) {
        collection = collection.filter(m => m.type === params.type);
      }
      const total = await collection.count();
      const page = params.page || 1;
      const pageSize = params.page_size || 20;
      const offset = (page - 1) * pageSize;
      const rawData = await collection.offset(offset).limit(pageSize).toArray();

      // 将本地文件路径解析为 blob URL
      const data = await Promise.all(
        rawData.map(async d => {
          let url = '';
          let thumb = '';
          if (d.relativePath && (d.relativePath.startsWith('/materials/') || d.relativePath.startsWith('materials/'))) {
            url = (await getMaterialFileUrlCached(d.relativePath)) || '';
            if (d.thumbRelativePath) {
              thumb = (await getMaterialFileUrlCached(d.thumbRelativePath)) || '';
            }
          }
          return {
            ...d,
            urls: d.relativePath
              ? { url: url || d.relativePath, thumb: thumb || d.thumbRelativePath || url || d.relativePath }
              : (d as any).urls || {},
          };
        }),
      );

      // 包装为与原 API 一致的格式
      return [{
        data,
        total,
        current_page: page,
        page_size: pageSize,
      }, null];
    } catch (err: any) {
      return [null, err.message];
    }
  };

  /**
   * 新增用户素材（IndexedDB）
   */
  createUserMaterial = async (params: st.CreateUserMaterialParams) => {
    try {
      const id = genId();
      const now = Date.now();
      await localDB.materials.put({
        id,
        appId: params.app_id || '',
        name: params.name,
        type: params.type || 'image',
        fileName: params.name,
        relativePath: params.urls?.url || '',
        thumbRelativePath: params.urls?.thumb || '',
        size: params.size || 0,
        attrs: {
          ...params.attrs,
          width: params.attrs?.width || 200,
          height: params.attrs?.height || 160,
        },
        from: params.from || 'user',
        tag: params.category_id || '',
        createdAt: now,
        updatedAt: now,
      });
      return [{
        id,
        name: params.name,
        urls: params.urls,
        attrs: params.attrs,
        type: params.type,
        app_id: params.app_id,
        category_id: params.category_id,
        size: params.size,
        from: params.from,
      }, null];
    } catch (err: any) {
      return [null, err.message];
    }
  };

  /**
   * 删除用户素材（IndexedDB）
   */
  deleteUserMaterial = async (ids: string[]) => {
    try {
      console.log('批量删除', ids);
      await localDB.materials.bulkDelete(ids);
      return ['success', null];
    } catch (err: any) {
      return [null, err.message];
    }
  };

  /**
   * 更新用户素材（IndexedDB）
   */
  updateUserMaterial = async (params: st.UpdateUserMaterialParams) => {
    try {
      const existing = await localDB.materials.get(params.id);
      if (!existing) return [null, 'Material not found'];
      await localDB.materials.put({
        ...existing,
        name: params.name || existing.name,
        relativePath: params.urls?.url || existing.relativePath,
        thumbRelativePath: params.urls?.thumb || existing.thumbRelativePath,
        size: params.size !== undefined ? params.size : existing.size,
        attrs: params.attrs ? { ...existing.attrs, ...params.attrs } : existing.attrs,
        tag: params.category_id || existing.tag,
        updatedAt: Date.now(),
      });
      return ['success', null];
    } catch (err: any) {
      return [null, err.message];
    }
  };

  /**
   * 获取分类列表（IndexedDB）
   */
  getUserMaterialType = async (params: { type: string; page?: number; page_size?: number }) => {
    try {
      const cates = await localDB.categories
        .where('type')
        .equals(params.type)
        .toArray();
      return [{ data: cates, total: cates.length }, null];
    } catch (err: any) {
      return [null, err.message];
    }
  };

  // 批量移动
  getBatchMobile = async data => {
    return this.post('/user/materials/move', data);
  };

  // 限制素材大小
  getUploadSize = async key => {
    return this.get(`/common/config/value?key=${key}`);
  };

  // 移动素材
  moveMaterial = params => {
    return this.post('/user/materials/move', params);
  };

  // 查询视频转码状态
  seekVideoItemStatus = (ids: string[]) => {
    return this.post(`/user/materials/status`, {
      ids,
    });
  };

  // ========== 项目素材 ==========

  /**
   * 项目素材列表
   */
  projectMaterialList = async (params: any) => {
    const [data, err] = await this.get('/user/project/materials/page', { params });
    console.log('xxdatax', data);
    return [
      {
        current_page: '1',
        total: 0,
        data: data.map(d => {
          const { id, ...other } = d.detail || {};
          return {
            ...d,
            ...other,
          };
        }),
      },
      false,
    ] as any;
  };

  /**
   * 项目素材删除
   */
  projectMaterialDelete = (params: any) => {
    return this.post('/user/project/materials/delete', params);
  };

  /**
   * 项目素材批量新增
   */
  projectMaterialAdd = (params: any) => {
    return this.post('/user/project/materials/batch', params);
  };
}

const server = new Server();
export { server };
