import Dexie, { type Table } from 'dexie';

/** 素材元数据 */
export interface MaterialRecord {
  id: string;
  appId: string; // appid 分类
  name: string;
  type: 'video' | 'image' | 'audio' | string; // 素材类型type
  fileName: string; // 本地存储的文件名
  relativePath: string; // 相对路径，如 "materials/appId/video/xxx.mp4"
  thumbFileName?: string; // 封面图本地文件名
  thumbRelativePath?: string; // 封面图相对路径
  framesFileName?: string; // 帧预览图本地文件名
  framesRelativePath?: string; // 帧预览图相对路径
  waveFileName?: string; // 音波图本地文件名
  waveRelativePath?: string; // 音波图相对路径
  size: number; // 文件大小（字节）
  attrs: {
    width?: number;
    height?: number;
    duration?: number;
    naturalWidth?: number;
    naturalHeight?: number;
    videoWidth?: number;
    videoHeight?: number;
    frames?: string;
    wave?: string;
    delayFrame?: number;
    totalFrame?: number;
    delays?: number[];
    rotate?: boolean;
    noAudioTracks?: boolean;
    frameScale?: number;
    rotation?: number;
    [key: string]: any;
  };
  from?: 'user' | 'system';
  tag?: string;
  createdAt: number; // 时间戳
  updatedAt: number;
}

/** 文件夹句柄记录 */
export interface FolderHandleRecord {
  id: string; // 固定 key，如 'root'
  handle: FileSystemDirectoryHandle;
}

/** 项目 JSON 数据 */
export interface ProjectRecord {
  id: string; // appId
  name: string; // 项目名称
  categoryId?: string; // 分类ID
  thumb?: string; // 封面图
  description?: string; // 描述
  data: any; // MovieData JSON
  createdAt: number; // 创建时间
  updatedAt: number;
}

/** 分类/文件夹记录 */
export interface CategoryRecord {
  id: string; // 分类ID，如 'local_cat_xxx'
  name: string;
  type: 'project' | 'material'; // 分类类型
  createdAt: number;
  updatedAt: number;
}

/** 上传文件记录 (uploadBase64 / formUpdate) */
export interface UploadRecord {
  id: string;
  content: string; // base64 data URL 或文本内容
  name: string;
  file_type?: string;
  blobType?: string; // blob MIME type
  storage_path: string; // 生成的伪 storage_path，供调用方使用
  createdAt: number;
}

class LocalDB extends Dexie {
  materials!: Table<MaterialRecord, string>;
  folderHandles!: Table<FolderHandleRecord, string>;
  projects!: Table<ProjectRecord, string>;
  categories!: Table<CategoryRecord, string>;
  uploads!: Table<UploadRecord, string>;

  constructor() {
    super('H5VideoLocalDB');
    this.version(5).stores({
      materials: 'id, appId, type, createdAt',
      folderHandles: 'id',
      projects: 'id, categoryId, updatedAt',
      categories: 'id, type',
      uploads: 'id, createdAt',
    });
  }
}

export const localDB = new LocalDB();
