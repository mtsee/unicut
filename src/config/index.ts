// 配置
const config = {
  secretKey: 'x&S#acLCx', //
  apiHost: '/api/v1',
  editorHost: 'https://localhost:3002/editor',
  prefix: 'video', // 项目前缀，用于设置localStroage的名称
  // resourcesHost: 'https://cdn.h5ds.com', // CDN资源路径
  loginSuccessLink: '/workspace/draft', // 登录成功后跳转地址
  resourcesHost: 'https://cdn.h5ds.com', // CDN资源路径
  basename: '', // history路由前缀
  env: 'dev',
  EModuleEffectSourcePath: 'https://cdn.h5ds.com/assets/effectcanvas/',
  workerPath: '/assets/worker',
  host: 'https://video.h5ds.com', // 二维码扫描有用到
};

// 生产环境参数
if (import.meta.env.PROD) {
  config.editorHost = '/editor';
  config.env = 'prod';
  // config.resourcesHost = 'https://videomix.h5ds.com';
  // config.apiHost = (window as any).apiHost || '';
}

export { config };
