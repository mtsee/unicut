import BasicService from '@server/BasicService';
import type { MaterialTypes } from '@stores/editor';
import type * as st from '@config/sdk.d';
import { localDB } from '@database/localDB';

const genId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

class Server extends BasicService {
  /**
   * @desc 创建视频（IndexedDB）
   */
  createApp = async (data: st.CreateAppParams) => {
    try {
      const id = genId();
      const now = Date.now();
      await localDB.projects.put({
        id,
        name: data.name,
        categoryId: String(data.category_id),
        thumb: data.thumb,
        description: data.description,
        data: data.data,
        createdAt: now,
        updatedAt: now,
      });
      return [{ id }, null];
    } catch (err: any) {
      return [null, err.message];
    }
  };

  /**
   * 获取用户作品详情（IndexedDB）
   */
  getAppData = async (id: string) => {
    try {
      const project = await localDB.projects.get(id);
      if (!project) return [null, 'Project not found'];
      return [{ id: project.id, name: project.name, url: '', data: project.data, thumb: project.thumb }, null];
    } catch (err: any) {
      return [null, err.message];
    }
  };

  /**
   * 删除作品（IndexedDB）
   */
  deleteApp = async (id: string) => {
    try {
      await localDB.projects.delete(id);
      return ['success', null];
    } catch (err: any) {
      return [null, err.message];
    }
  };

  /**
   * 更新草稿（IndexedDB）
   */
  updateApp = async (params: st.UpdateAppParams) => {
    try {
      const existing = await localDB.projects.get(params.id);
      const now = Date.now();
      await localDB.projects.put({
        id: params.id,
        name: params.name || existing?.name || '',
        categoryId: params.category_id !== undefined ? String(params.category_id) : existing?.categoryId || '',
        thumb: params.thumb || existing?.thumb || '',
        description: params.description || existing?.description || '',
        data: params.data || existing?.data || {},
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      });
      return ['success', null];
    } catch (err: any) {
      return [null, err.message];
    }
  };

  /**
   * 上传base64图片（IndexedDB）
   */
  uploadBase64 = async (params: st.UploadBase64Params) => {
    try {
      const id = genId();
      const storagePath = `indexeddb://upload/${id}`;
      // 将base64 data URL 转换为 blob URL 供后续使用
      const blobUrl = params.content; // 直接使用 data URL，确保兼容性
      await localDB.uploads.put({
        id,
        content: params.content,
        name: params.name,
        file_type: params.file_type,
        storage_path: blobUrl,
        createdAt: Date.now(),
      });
      return [{ storage_path: blobUrl }, null];
    } catch (err: any) {
      return [null, err.message];
    }
  };

  // /**
  //  * 服务端执行视�?资源的倒放业务
  //  * @param id：资源ID
  //  * @param from：用户资源或者是系统资源
  //  * @returns
  //  */
  // videoReplay = (id: string, from: 'user' | 'system' | 'other' | 'admin') => {
  //   return this.post(`/common/materialJobs/reverse`, {
  //     source: from === 'user' ? 'user_material' : 'material',
  //     source_id: id,
  //   });
  // };

  // /**
  //  * 查询倒放的状�?
  //  * @param ids
  //  * @returns
  //  */
  // seekVideoReplayStatus = (ids: string[]) => {
  //   return this.post(`/user/materials/status`, {
  //     ids,
  //   });
  // };

  /**
   * 获取分类列表
   */
  getMaterialTypes = (type: MaterialTypes) => {
    const typeMap = {
      text: 311,
      image: 312,
      audio: 313,
      video: 314,
      sticker: 315,
      effect: 316,
      filter: 317,
      transition: 318,
    };
    return this.get(`/common/type-items/page`, {
      params: { type_id: typeMap[type] || '', page_size: 999 },
    }).then(res => {
      const [re, err] = res;
      return [re.data, err];
    });
  };

  /**
   * 获取模版的分�?
   * @returns
   */
  getTemplateTypes = () => {
    return this.get(`/template/categories/tree`, { params: { page_size: 99 } });
  };

  /**
   * 获取素材
   */
  getMaterials = (params: st.MaterialParams) => {
    // if (params.type === 'video') {
    //   params.convert_status = 2;
    // }
    return this.get('/materials/page', { params });
  };

  /**
   * 搜索模版
   * @param params
   * @returns
   */
  getTemplates = (params: st.TemplateParams) => {
    return this.get('/templates/page', {
      params: {
        ...params,
      },
    }).then(arg => {
      const [res, err] = arg;
      res.data.forEach(d => {
        d.type = 'template';
      });
      return [res, err];
    });
  };

  // 搜藏元素
  collect = (params: { source_id: string; type: string }) => {
    return this.post(`/user/collects/create`, { ...params });
  };

  // 取消收藏
  cancelCollect = (source_id: Array<string>, type: string) => {
    return this.post(`/user/collects/cancel`, { source_id, type });
  };

  // 获取收藏列表
  getCollects = (params: st.CollectParams) => {
    return this.get(`/user/collects/page`, { params });
  };

  // 表单上传（IndexedDB）
  formUpdate = async (formdata: FormData) => {
    try {
      const id = genId();
      const file = formdata.get('file') as File | Blob | null;
      let storagePath = '';
      if (file) {
        // 将 Blob/File 转换为 data URL 存储
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        storagePath = base64;
        await localDB.uploads.put({
          id,
          content: base64,
          name: file instanceof File ? file.name : 'upload',
          blobType: file.type,
          storage_path: base64,
          createdAt: Date.now(),
        });
      } else {
        // 无文件情况，存储 form 字段信息
        const fields: Record<string, string> = {};
        formdata.forEach((val, key) => {
          if (typeof val === 'string') fields[key] = val;
        });
        storagePath = JSON.stringify(fields);
        await localDB.uploads.put({
          id,
          content: storagePath,
          name: 'form_' + id,
          storage_path: storagePath,
          createdAt: Date.now(),
        });
      }
      return [{ storage_path: storagePath }, null];
    } catch (err: any) {
      return [null, err.message];
    }
  };

  // 获取用户素材（IndexedDB）
  getUserMaterial = async (params: st.UserMaterialParams) => {
    try {
      let collection = localDB.materials.orderBy('createdAt').reverse();
      if (params.app_id) {
        collection = collection.filter(m => m.appId === params.app_id);
      }
      if (params.category_id && params.category_id !== '0') {
        collection = collection.filter(m => m.tag === params.category_id);
      }
      if (params.type) {
        collection = collection.filter(m => m.type === params.type);
      }
      const total = await collection.count();
      const offset = (params.page - 1) * params.page_size;
      const data = await collection.offset(offset).limit(params.page_size).toArray();

      // 包装为与原 API 一致的格式
      return [{
        data: data.map(d => ({
          ...d,
          urls: d.relativePath ? { url: d.relativePath, thumb: d.thumbRelativePath || d.relativePath } : (d as any).urls || {},
        })),
        total,
        current_page: params.page,
        page_size: params.page_size,
      }, null];
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

  // 删除用户素材（IndexedDB）
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
        //@ts-ignore
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

  // ========== 火山AI ==========

  // 火山AI视频生成-(图生视频、文生视频)
  createAiTask = (params: st.AiVideoParams | st.AiImageParams | st.AiVideo2VideoParams) => {
    return this.post(`/common/bizTasks/create`, { ...params });
  };

  // 查询火山AI视频生成任务状态
  getAiTaskList = (params: st.PageParams) => {
    return this.get(`/common/bizTasks/page`, { params: { ...params } });
  };

  aiTaskInfo = (id: string) => {
    return this.get(`/common/bizTasks/info?id=${id}`);
  };

  // 删除火山AI视频生成任务
  deleteAiTask = (ids: string[]) => {
    return this.post(`/common/bizTasks/delete`, { id: ids });
  };

  // 轮训火山AI视频生成任务状态 status 状态(0-未入队列 1-已入队列，待处理 2-处理中 3-处理成功 4-处理失败 5-已取消/删除)
  seekAiTaskStatus = (ids: string[]) => {
    return this.post(`/common/bizTasks/status`, { ids });
  };

  // 云合成
  createTask = (data: {
    source: 'user_app';
    source_id: string;
    params: {
      fps: number;
      resolution: string;
      jsonUrl: string;
      // storageUrl: '/videos/1/output.mp4';
      // callback: 'http://localhost:8000/api/callback';
    };
  }) => {
    return this.post(`/user/app/tasks/create`, data);
  };
  
  
  // sse返回
  openAiChatSSE = (params: st.AiChatParams) => {
    return this.post(`/common/openai/stream`, { ...params });
  };

  // 一次性返回
  openAiChat = (params: st.AiChatParams) => {
    return this.post(`/common/openai/completion`, { ...params });
  };

  /**
   * 更新用户的素材（IndexedDB）
   */
  updateUserMaterial = async (params: st.UpdateUserMaterialParams) => {
    try {
      const existing = await localDB.materials.get(params.id);
      if (!existing) return [null, 'Material not found'];
      const now = Date.now();
      await localDB.materials.put({
        ...existing,
        name: params.name || existing.name,
        relativePath: params.urls?.url || existing.relativePath,
        thumbRelativePath: params.urls?.thumb || existing.thumbRelativePath,
        size: params.size !== undefined ? params.size : existing.size,
        attrs: params.attrs ? { ...existing.attrs, ...params.attrs } : existing.attrs,
        tag: params.category_id || existing.tag,
        appId: params.app_id || existing.appId,
        updatedAt: now,
      });
      return [{ id: params.id, name: params.name || existing.name }, null];
    } catch (err: any) {
      return [null, err.message];
    }
  };

  // tts
  createTTS = (params: st.CreateTTSParams) => {
    const p = params as any;
    if (p.version === 'v1') {
      return this.post('/common/tts/huoshan', {
        text: p.text,
        config: {
          voice_type: p.config.speaker,
          speed_ratio: 1.0,
          emotion: p.emotion,
          // enable_emotion: p.emotion ? true : false,
        },
        options: {},
      });
    } else {
      return this.post('/common/tts/huoshan_v3', p);
    }
  };

  // ai字幕
  createCaption = (url: string) => {
    return this.post('/common/filetrans/huoshan', {
      audio: {
        format: 'mp3',
        codec: 'pcm',
      },
      url: url,
    });
  };

  // 字幕任务
  seekCaptionTask = (taskId: string) => {
    return this.get(`/common/filetrans/huoshan_info?TaskId=${taskId}`);
  };

  // ========== VIP / 积分 ==========

  getCreditPackages = async () => {
    return await this.get('/user/credit-packages/list');
  };

  createCreditOrder = async (package_id: string | number) => {
    return await this.post('/user/credit-orders/create', { package_id });
  };

  getCreditOrderStatus = async (id: string | number) => {
    return await this.get('/user/credit-orders/status', { params: { id } });
  };

  getVipPackages = async () => {
    return await this.get('/user/vip-packages/list');
  };

  createVipOrder = async (package_id: string | number, vip_level?: number) => {
    return await this.post('/user/vip-orders/create', { package_id, vip_level });
  };

  getVipOrderStatus = async (id: string | number) => {
    return await this.get('/user/vip-orders/status', { params: { id } });
  };
}

export const server = new Server();

/**
 * 获取素材的列表Items数据
 * @param type
 * @param params
 * @param items
 * @returns
 */
export async function getItems(
  type: string,
  params: {
    page: number;
    page_size: number;
    keyword: string;
    category_id?: string;
  },
  items: any[] | null,
  apiServer: (n: any) => Promise<[any, string | null]>,
) {
  let res: { data: any[]; total: number }, err: any;
  [res, err] = await apiServer({
    type,
    ...params,
  });

  if (!err) {
    const list = res.data.map((d: any) => {
      if (d.material) {
        d = d.material;
      }
      const size = { width: d.width || d.attrs?.width || 1920, height: d.height || d.attrs?.height || 1080 };
      switch (d.type) {
        case 'audio':
          size.width = 100;
          size.height = 20;
          break;
        case 'effect':
        case 'text':
        case 'filter':
          size.width = 100;
          size.height = 100;
          break;
        case 'transition':
          size.width = 100;
          size.height = 70;
          break;
      }
      return { ...d, ...size };
    });
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
