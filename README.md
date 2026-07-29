# unicut
AI-driven open-source video editing tool

# 无界云剪

体验地址：https://unicut.h5ds.com

![editor](editor.png)

相关技术参考文档：

React: [https://react.docschina.org/](https://react.docschina.org/)

semi-ui: [https://semi.design/](https://semi.design/)

Mobx: [https://cn.mobx.js.org/](https://cn.mobx.js.org/)

vite: [https://vitejs.cn/guide/](https://vitejs.cn/guide/)


# 项目源码说明

# 目录结构说明：
```
├─dist 打包后生成的文件（执行yarn build后才会生成）
│  ├─assets 公共资源文件
│  │  ├─ai 
│  │  │  ├─matting  ai抠图代码
│  │  │  └─onnxruntime-web ai涂抹代码
│  │  ├─ffmpeg12 ffmpeg代码
│  │  ├─images 图片资源
│  │  └─worker 解码代码
│  └─homeAssets 打包后资源
│      ├─css  
│      ├─jpg
│      ├─js
│      └─png
├─public 静态资源文件夹
│  └─assets
│      ├─ai
│      │  ├─matting ai抠图代码
│      │  └─onnxruntime-web ai涂抹代码
│      ├─ffmpeg12 ffmpeg代码
│      ├─images 图片资源
│      └─worker 解码代码
├─src 项目源代码
│  ├─assets 图片等资源
│  │  └─images 图片资源
│  ├─components 公共组件
│  │  ├─audio 音频相关组件
│  │  ├─content 我的草稿和我的素材公用容器组件
│  │  ├─content-user 我的账号和我的消息公用容器组件
│  │  ├─footer 网站底部
│  │  ├─header 网站头部
│  │  │  └─user 头部右侧的下拉信息框
│  │  ├─login 登录
│  │  │  ├─loginMobile 手机登录
│  │  │  ├─loginQrcode 二维码登录
│  │  │  └─loginRegisterBox 登录容器框
│  │  ├─not-found 找不到的提示页面
│  │  ├─page-loading 页面加载loading
│  │  ├─sub-header banner组件
│  │  └─water-full 素材资源展示组件
│  ├─config 配置文件
│  ├─layout 布局
│  │  ├─home-layout 首页布局
│  │  ├─index-layout  关于我们布局
│  │  ├─user-layout 用户中心布局
│  │  │  └─sidebar 左侧导航
│  │  │      └─cropUpload 截图
│  │  └─workspace-layout 我的空间布局
│  │      └─sidebar 左侧导航
│  ├─less 基础less文件
│  ├─pages 页面
│  │  ├─aboutus 关于我们
│  │  ├─home 首页
│  │  ├─tools 快捷工具页面
│  │  │  ├─ai-matting ai抠图
│  │  │  └─ai-rubber ai涂抹
│  │  ├─user  个人中心
│  │  │  ├─account 账号设置
│  │  │  └─message 消息中心
│  │  └─workspace 我的空间
│  │      └─user 个人用户空间
│  │          ├─draft 我的草稿
│  │          └─material 我的素材
│  ├─server  请求
│  ├─stores mobx的store
│  ├─theme 主题
│  └─utils 公共方法
├─ssh 本地开发https使用
├─editorconfig 编辑器配置文件
├─.gitignore git提交忽略文件
├─copy.js 打包后复制处理文件
├─index.html 入口html文件
├─nodeExternals.js 处理package.json文件
├─packages.json npm包配置文件
├─readme.md 项目说明文档
├─tsconfig.json ts配置文件 
├─tsconfig.node.json 用于vite.config.ts的ts配置文件
├─vite.config.ts vite打包配置文件
└─viteConfig.ts vite公共配置文件（暂时未使用）
```
# 项目开发说明：

当前目录执行yarn dev,启动开发环境（备注：如果没有在最外层执行过一次yarn install, 需要先在最外层执行以上命令，然后才可以在目录下执行yarn dev启动命令）


# 项目单独发布打包命令：


# 打包：
当前目录下执行：yarn build（备注：如果没有在最外层执行过一次yarn install和yarn build, 需要先在最外层执行以上两个命令，然后才可以单独对video-web执行yarn build打包）

执行结束后会在根目录下生成www文件目录，里面是生成的需要发布的文件

打包后目录结构说明：
-assets 公共资源
-homeAssets web系统资源
-index.html 首页

