import React, { useEffect, useState, useCallback } from 'react';
import { Button, Modal, Typography } from '@douyinfe/semi-ui';
import { FolderOpen } from '@icon-park/react';
import { initLocalFolder, getRootHandle, isFSApiSupported } from '@services/localStorageService';

interface FolderGuardProps {
  children: React.ReactNode;
}

const FolderGuard: React.FC<FolderGuardProps> = ({ children }) => {
  const supported = isFSApiSupported();
  const [folderReady, setFolderReady] = useState(!supported);
  const [folderLoading, setFolderLoading] = useState(false);

  // 组件挂载时检查文件夹是否已初始化
  useEffect(() => {
    if (supported) {
      getRootHandle().then(handle => {
        if (handle) {
          setFolderReady(true);
        }
      });
    }
  }, [supported]);

  const handleInitFolder = useCallback(async () => {
    setFolderLoading(true);
    try {
      const handle = await initLocalFolder();
      if (handle) {
        setFolderReady(true);
      }
    } finally {
      setFolderLoading(false);
    }
  }, []);

  // 不支持 FSApi，直接渲染子组件
  if (!supported) {
    return <>{children}</>;
  }

  // 文件夹未就绪，显示选择弹窗
  if (!folderReady) {
    return (
      <Modal
        visible={true}
        closable={false}
        maskClosable={false}
        footer={null}
        title={null}
        style={{ maxWidth: 480 }}
        bodyStyle={{ textAlign: 'center', padding: '40px 32px' }}
      >
        <FolderOpen size={64} fill="#1677ff" style={{ marginBottom: 24 }} />
        <Typography.Title heading={4} style={{ marginBottom: 12 }}>
          选择本地存储文件夹
        </Typography.Title>
        <Typography.Text type="tertiary" style={{ marginBottom: 24, display: 'block' }}>
          请选择一个本地文件夹用于存放素材和项目数据，素材将不会上传到服务器
        </Typography.Text>
        <Button
          theme="solid"
          type="primary"
          size="large"
          loading={folderLoading}
          onClick={handleInitFolder}
          block
        >
          选择文件夹
        </Button>
      </Modal>
    );
  }

  return <>{children}</>;
};

export default FolderGuard;
