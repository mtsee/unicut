import type { MovieData } from 'video-core-sdk';
import BasicService from '@server/BasicService';
import {
  createLocalProject,
  updateLocalProjectMeta,
  deleteLocalProject,
  copyLocalProject,
  getLocalProjectList,
  deleteAllMaterialsByAppId,
  isFSApiSupported,
  getRootHandle,
} from '@services/localStorageService';

class Server extends BasicService {
  // 本地存储模式是否已初始化
  private _useLocal: boolean | null = null;
  private _initPromise: Promise<void> | null = null;

  /** 初始化并检测本地存储模式 */
  private async _ensureInit(): Promise<boolean> {
    if (this._useLocal !== null) return this._useLocal;
    if (this._initPromise) {
      await this._initPromise;
      return this._useLocal!;
    }
    this._initPromise = (async () => {
      if (isFSApiSupported()) {
        const handle = await getRootHandle();
        this._useLocal = !!handle;
      } else {
        this._useLocal = false;
      }
    })();
    await this._initPromise;
    return this._useLocal!;
  }

  // 获取系统素材列表（仍走服务器）
  getSysMaterialList = async (params: any) => {
    return this.get(`/materials/page`, { params });
  };

  /** 创建项目 */
  createDraft = async (data: any) => {
    if (await this._ensureInit()) {
      return createLocalProject(data);
    }
    return this.post('/user/apps/create', data);
  };

  /** 获取作品最大数量信息（本地模式直接返回） */
  getAppCountInfo = async () => {
    if (await this._ensureInit()) {
      return [{ max: 999 }, null];
    }
    return this.get('/user/apps/count-info');
  };

  /** 获取项目列表 */
  getDraftList = async (params: any) => {
    if (await this._ensureInit()) {
      return getLocalProjectList(params);
    }
    return this.get('/user/apps/page', { params });
  };

  /** 获取作品详情 */
  getAppsDetail = async (id: string) => {
    if (await this._ensureInit()) {
      const { getProject } = await import('@services/localStorageService');
      const data = await getProject(id);
      return [data ? { id, data } : null, null];
    }
    return this.get('/user/apps/info', { params: { id } });
  };

  /** 发布作品（本地模式不需要） */
  publishApps = async (params: any) => {
    if (await this._ensureInit()) {
      return [{}, null];
    }
    return this.post('/user/apps/publish', params);
  };

  /** 删除项目 */
  deleteDraft = async (id: string) => {
    if (await this._ensureInit()) {
      // 同时删除关联的素材
      deleteAllMaterialsByAppId(id).catch(() => {});
      return deleteLocalProject(id);
    }
    return this.post('/user/apps/delete', { id });
  };

  /** 更新项目 */
  updateDraft = async (params: any) => {
    if (await this._ensureInit()) {
      return updateLocalProjectMeta(params.id, params);
    }
    return this.post('/user/apps/update', params);
  };

  /** 移动项目 */
  moveDraft = async (params: { ids: string[]; category_id: string }) => {
    if (await this._ensureInit()) {
      await Promise.all(params.ids.map((id: string) => updateLocalProjectMeta(id, { category_id: params.category_id })));
      return [{}, null];
    }
    return this.post('/user/apps/move', params);
  };

  /** 复制项目 */
  copyDraft = async (params: any) => {
    if (await this._ensureInit()) {
      return copyLocalProject(params.id ?? params);
    }
    return this.post('/user/apps/copy', params);
  };
}

export const server = new Server();
