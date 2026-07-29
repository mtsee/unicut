/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'react-router-dom';
declare module 'PubSub';
declare module 'pixi-filters';
declare module 'react-resize-detector';
declare module 'simple-query-string';
// declare module 'video-core-sdk';
