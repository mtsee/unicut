import { useState, useEffect, useCallback, useRef } from 'react';
import type { MaterialRecord } from '@database/localDB';
import {
  initLocalFolder,
  getRootHandle,
  resetLocalFolder,
  addMaterial,
  getMaterials,
  deleteMaterial,
  getMaterialFileUrl,
  saveProject,
  getProject,
  deleteProject,
  isFSApiSupported,
} from '@services/localStorageService';

interface UseLocalStorageReturn {
  /** API 是否可用 */
  supported: boolean;
  /** 文件夹是否已就绪 */
  ready: boolean;
  /** 初始化中 */
  loading: boolean;
  /** 素材列表 */
  materials: MaterialRecord[];
  /** 初始化本地文件夹 */
  initFolder: () => Promise<boolean>;
  /** 重新选择文件夹 */
  reSelectFolder: () => Promise<boolean>;
  /** 添加素材 */
  addMaterialItem: (params: {
    name: string;
    type: string;
    file: File;
    thumbFile?: File | Blob;
    attrs?: Record<string, any>;
    from?: 'user' | 'system';
    tag?: string;
  }) => Promise<MaterialRecord | null>;
  /** 删除素材 */
  removeMaterial: (id: string) => Promise<void>;
  /** 获取素材文件 URL */
  getFileUrl: (relativePath: string) => Promise<string | null>;
  /** 刷新素材列表 */
  refreshMaterials: () => Promise<void>;
  /** 保存项目 */
  saveProjectData: (data: any) => Promise<void>;
  /** 获取项目 */
  getProjectData: () => Promise<any | null>;
  /** 删除项目 */
  removeProject: () => Promise<void>;
}

export function useLocalStorage(appId: string): UseLocalStorageReturn {
  const supported = isFSApiSupported();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const initializedRef = useRef(false);

  const refreshMaterials = useCallback(async () => {
    const list = await getMaterials(appId);
    setMaterials(list);
  }, [appId]);

  const initFolder = useCallback(async () => {
    if (initializedRef.current) return true;
    setLoading(true);
    try {
      const handle = await initLocalFolder();
      if (handle) {
        setReady(true);
        initializedRef.current = true;
        await refreshMaterials();
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshMaterials]);

  const reSelectFolder = useCallback(async () => {
    await resetLocalFolder();
    initializedRef.current = false;
    return initFolder();
  }, [initFolder]);

  const addMaterialItem = useCallback(
    async (params: {
      name: string;
      type: string;
      file: File;
      thumbFile?: File | Blob;
      attrs?: Record<string, any>;
      from?: 'user' | 'system';
      tag?: string;
    }) => {
      const record = await addMaterial({ ...params, appId });
      if (record) {
        await refreshMaterials();
      }
      return record;
    },
    [appId, refreshMaterials],
  );

  const removeMaterial = useCallback(
    async (id: string) => {
      await deleteMaterial(id);
      await refreshMaterials();
    },
    [refreshMaterials],
  );

  const getFileUrl = useCallback(async (relativePath: string) => {
    return getMaterialFileUrl(relativePath);
  }, []);

  const saveProjectData = useCallback(
    async (data: any) => {
      await saveProject(appId, data);
    },
    [appId],
  );

  const getProjectData = useCallback(async () => {
    return getProject(appId);
  }, [appId]);

  const removeProject = useCallback(async () => {
    await deleteProject(appId);
  }, [appId]);

  // 首次挂载自动尝试初始化
  useEffect(() => {
    if (supported) {
      getRootHandle().then(handle => {
        if (handle) {
          setReady(true);
          initializedRef.current = true;
          refreshMaterials();
        }
      });
    }
  }, [supported, refreshMaterials]);

  return {
    supported,
    ready,
    loading,
    materials,
    initFolder,
    reSelectFolder,
    addMaterialItem,
    removeMaterial,
    getFileUrl,
    refreshMaterials,
    saveProjectData,
    getProjectData,
    removeProject,
  };
}
