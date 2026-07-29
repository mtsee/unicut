import { defineConfig } from 'vite';
//@ts-ignore
import path from 'path';
import react from '@vitejs/plugin-react';
import vitePluginImp from 'vite-plugin-imp';
import mkcert from 'vite-plugin-mkcert';
import { visualizer } from 'rollup-plugin-visualizer';
import { terser } from 'rollup-plugin-terser';

//@ts-ignore
const resolve = url => path.resolve(__dirname, url);

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@components': resolve('./src/components'),
      '@server': resolve('./src/server'),
      '@pages': resolve('./src/pages'),
      '@language': resolve('./src/language'),
      '@hooks': resolve('./src/hooks'),
      '@theme': resolve('./src/theme'),
      '@layout': resolve('./src/layout'),
      '@stores': resolve('./src/stores'),
      '@utils': resolve('./src/utils'),
      '@config': resolve('./src/config'),
      '@less': resolve('./src/less'),
      '@images': resolve('./src/assets/images'),
      '@icons': resolve('./src/icons'),
      '@plugins': resolve('./src/pages/editor/plugins'),
      '@database': resolve('./src/database'),
      '@services': resolve('./src/services'),
      // 'video-core-sdk': resolve('C:/E/gitlab/h5-video/packages/video-core/src/react-pixi/CoreSDK.tsx'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'], // 省略扩展名
  },
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    mkcert({
      source: 'coding',
      savePath: './ssh',
    }),
    react({
      babel: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-proposal-class-properties', { loose: true }],
        ],
      },
    }),
    vitePluginImp({
      libList: [
        {
          libName: '@icon-park/react',
          libDirectory: 'es/icons',
          camel2DashComponentName: false,
        },
        {
          libName: 'lodash',
          libDirectory: '',
          camel2DashComponentName: false,
        },
        // {
        //   libName: '@douyinfe/semi-ui',
        // },
      ],
    }),
  ],
  css: {
    modules: {
      generateScopedName: '[name]__[local]__[hash:5]',
    },
    preprocessorOptions: {
      less: {
        // 支持内联 javascript
        javascriptEnabled: true,
      },
    },
  },
  // 入口
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'homeAssets/js/[name]-[hash].js',
        entryFileNames: 'homeAssets/js/[name]-[hash].js',
        assetFileNames: 'homeAssets/[ext]/[name]-[hash].[ext]',
      },
      input: {
        main: resolve('index.html'),
      },
      manualChunks: {
        'opencv-ts': ['opencv-ts'],
      },
      plugins: [
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.warn', 'console.error'],
          },
          format: { comments: false },
        }),
        visualizer(),
      ],
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        //生产环境时移除console
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  base: '/', // 公共基础路径
  server: {
    host: '0.0.0.0',
    port: 3005,
    proxy: {
      '/cgi-bin': {
        target: 'https://video.h5ds.com',
        changeOrigin: true,
      },
      '/api': {
        target: 'https://video.h5ds.com',
        // target: 'http://192.168.31.153:8882',
        // target: 'https://video-business.i.h5ds.com',
        changeOrigin: true,
      },
      // '/video': {
      //   target: 'https://cdn.h5ds.com',
      //   changeOrigin: true,
      // },
    },
  },
});
