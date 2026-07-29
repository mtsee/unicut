import { MovieData, PluginConfig } from 'video-core-sdk';

// 图&文生成视频
export interface AiVideoParams {
  task_type: 'huoshan_video';
  params: {
    model: string; // "model": "doubao-seedance-1-0-pro-250528",
    content: {
      type: 'text';
      text: string;
    }[];
    generate_audio?: boolean; //  doubao-seedance-1-5-pro-251215 模型才有音频
    // 是否生成音频，默认是false
    ratio: string; // 9:16 16:9 1:1 3:4 4:3,21:9 默认是adaptive
    duration: number; // 时长
    fps: number; // 帧率，默认是30fps
    resolution: string; // 分辨率，默认是 720p
    seed: number; // 默认是-1
  };
}

export interface AiChatParams {
  provider?: 'deepseek' | undefined;
  model: string; // "model": "doubao-seed-1-6-251015", 默认使用："deepseek-v4-pro" 
  messages: {
    role: 'user' | 'system';
    content: string;
  }[];
}

// 图+视频 生成 新的视频
export interface AiVideo2VideoParams {
  task_type: 'huoshan_cv_video';
  params: {
    image_url: string;
    driving_video_info: {
      store_type: number; // 默认是0
      video_url: string;
    };
  };
}

// 图片生成
export interface AiImageParams {
  task_type: 'huoshan_image';
  params: {
    model: string; // "model": "doubao-seedream-4-5-251128",
    prompt: string;
    size: '2K' | '1K' | '4K';
    watermark: false;
  };
}

export interface VideoEditorSDKParams {
  target: HTMLDivElement;
  appid?: string;
  token?: string;
  // 水印配置
  watermark?: IWatermark;
  userInfo?: UserInfo;
  movieData?: MovieData; // 选填二选一，工程数据，工程数据和作品ID必须传入一个，会优先读取工程数据，如果没有传入工程数据，会通过appid去api server 去获取工程数据
  workerPath?: string; // worker资源地址： decode.worker.js  gif.worker.js
  apiServer?: APIServer;
  plugins?: PluginConfig[];
  resourcesHost?: string;
  sides?: SideItem[] | null; // 侧边栏
  saveAppCallback?: (res: any) => void; // 保存的回调
  exConfig?: {
    mobileUpload?: boolean; // 是否移动端上传
    // 最大媒体轨道数量
    maxMediaTrackNum: number;
    // 支持多语言
    supportLanguage: boolean;
    // 显示项目按钮
    showProjectButton: boolean;
    logoLink?: string;
    // 自定义logo链接
    logoOnClick?: () => void; // 如果填写了，logoLink失效
    // 自定义logo
    logo: (themeType: 'light' | 'dark') => string;
  };
  loginButtonConfig?: {
    id: string; // 容器的ID
    className: string; // 容器的类名
    Component?: React.FC; // 登录组件
  };
  exportButtonConfig?: {
    id: string; // 容器的ID
    className: string; // 容器的类名
    Component?: React.FC; // 导出组件
  };
}

export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  logout: () => void; // 退出登录
}

export interface SideItem {
  type: string;
  name: string;
  enName: string;
  icon: React.ReactNode;
  simple?: boolean; // 是否简单模式展示
  panel?: React.ReactNode;
}

export interface PageParams {
  page: number;
  page_size: number;
}

// 素材参数
export interface MaterialParams extends PageParams {
  type: string;
  tag?: string;
  pid?: string;
  category_id?: string | number;
  convert_status?: number; // 转码任务状态(-1-不处理 0-待处理1-处理中 2-处理成功3-处理失败)
  keyword?: string;
}

export interface TemplateParams extends PageParams {
  category_id?: string | number;
  keyword?: string;
}

export interface CreateAppParams {
  source_id: string; //来源Id
  category_id: string | number; //分类Id
  name: string; //名称
  description: string; //描述
  duration: number; //时长（毫秒）// editor.movie.getTotalTime()
  width: number; //宽度
  height: number; //高度
  thumb: string; //封面图url
  data: MovieData; // JSON数据
}

export interface UpdateAppParams extends Partial<CreateAppParams> {
  id: string;
}

export interface UserMaterialParams extends PageParams {
  app_id?: string;
  keyword: string;
  category_id: string;
  type?: string;
  pid?: string;
}

export interface CreateUserMaterialParams {
  app_id: string;
  type?: string;
  name: string;
  from?: string; // 来源 'user' | 'system'
  category_id?: string;
  urls: { url: string; thumb?: string };
  attrs: Record<string, any>;
  size?: number;
}

export interface CreateTTSParams {
  version: string; // 版本号
  emotion: string; // 情绪
  text: string; // 内容
  config: {
    speaker: string; // 发音人
    audio_params: {
      format: 'mp3' | 'wav';
      sample_rate: number; // 采样率 24000
    };
    additions: {
      silence_duration?: number; //默认是0， 静音时长 1000 设置该参数可在句尾增加静音时长，范围0~30000ms。（注：增加的句尾静音主要针对传入文本最后的句尾，而非每句话的句尾）
      enable_language_detector?: boolean; // 自动识别语种
      disable_markdown_filter?: boolean; // 是否开启markdown解析过滤，为true时，解析并过滤markdown语法，例如，**你好**，会读为“你好”，为false时，不解析不过滤，例如，**你好**，会读为“星星‘你好’星星”
      disable_emoji_filter?: boolean; // 开启emoji表情在文本中不过滤显示，默认为false，建议搭配时间戳参数一起使用。
      mute_cut_remain_ms?: string; // 该参数需配合mute_cut_threshold参数一起使用，其中："mute_cut_threshold": "400", // 静音判断的阈值（音量小于该值时判定为静音）
      max_length_to_filter_parenthesis?: number; //是否过滤括号内的部分，0为不过滤，100为过滤
      explicit_language?: string; // 仅读指定语种的文本 zh-cn、不给定参数，正常中英混crosslingual 启用多语种前端（包含zh/en/ja/es-mx/id/pt-br）zh-cn 中文为主，支持中英混en 仅英文ja 仅日文es-mx 仅墨西id 仅印尼pt-br 仅巴葡
      explicit_dialect?: string; // dongbei（东北话）shaanxi（陕西话）sichuan（四川话）
      /**
       * 语音合成的辅助信息，用于模型对话式合成，能更好的体现语音情感；
          可以探索，比如常见示例有以下几种：

          语速调整
          比如：context_texts: ["你可以说慢一点吗？"]
          情绪/语气调整
          比如：context_texts=["你可以用特别特别痛心的语气说话吗?"]
          比如：context_texts=["嗯，你的语气再欢乐一点"]
          音量调整
          比如：context_texts=["你嗓门再小点。"]
          音感调整
          比如：context_texts=["你能用骄傲的语气来说话吗？"]
       */
      context_texts?: string[]; // 上下文文本，用于生成上下文相关的语音
      /**
       * 是否开启cot解析能力。cot能力可以辅助当前语音合成，对语速、情感等进行调整。
        注意：

        音色支持范围：仅限声音复刻2.0复刻的音色
        文本长度：单句的text字符长度最好小于64（cot标签也计算在内）
        cot能力生效的范围是单句
        示例：
        支持单组和多组cot标签：<cot text=急促难耐>工作占据了生活的绝大部分</cot>，只有去做自己认为伟大的工作，才能获得满足感。<cot text=语速缓慢>不管生活再苦再累，都绝不放弃寻找</cot>。
       */
      use_tag_parser?: boolean;
    };
    mix_speaker?: Record<string, any>;
    // voice_type: string; // 音色
    // speed_ratio?: number; // 语速 //语速，[0.8~2]，默认为 1，通常保留一位小数即可
  };
  // options: Record<string, any>;
}

export interface UpdateUserMaterialParams extends Partial<CreateUserMaterialParams> {
  id: string;
}

export interface UserMaterialTypeParams extends PageParams {
  type: string; // material
}

// 获取收藏列表的参数
export interface CollectParams extends PageParams {
  type: string;
  category_id?: string | number;
  keyword?: string;
}

export interface UploadBase64Params {
  content: string;
  name: string;
  file_type?: string;
}

export interface AppDetailRes {}

export interface TemplateItemRes {}

export interface MaterialItemRes {
  id: string;
  name: string;
  size: number;
  updatedAt: string;
  createdAt: string;
  type: string;
  attrs: {
    duration?: number;
    wave?: string;
    frames?: string;
    videoWidth?: number;
    videoHeight?: number;
    naturalWidth?: number;
    naturalHeight?: number;
    width?: number;
    height?: number;
  };
  urls: {
    url: string;
    thumb: string;
    filename: string;
  };
}

export type Err = string | null;

export interface APIServer {
  // 获取appData数据
  getAppData: (appid: string) => Promise<[{ url: string }, Err]>;
  // 创建新的作品
  createApp: (params: CreateAppParams) => Promise<[{ id: string }, Err]>;
  // 云合成
  createTask: (data: {
    source: 'user_app';
    source_id: string;
    params: {
      fps: number;
      resolution: string;
      jsonUrl: string;
    };
  }) => Promise<[{ url: string }, Err]>;

  // 获取AI视频生成任务列表
  getAiTaskList: (params: PageParams) => Promise<[any, Err]>;
  // 删除AI视频生成任务
  deleteAiTask: (ids: string[]) => Promise<[string, Err]>;
  // 创建AI视频生成任务
  createAiTask: (params: st.AiVideoParams | st.AiImageParams) => Promise<[any, Err]>;
  // 轮训AI视频生成任务状态
  seekAiTaskStatus: (ids: string[]) => Promise<[any, Err]>;

  // 轮训上传状态
  seekVideoReplayStatus: (ids: string[]) => Promise<[any, Err]>;

  // 服务端执行视频&资源的倒放业务
  videoReplay: (id: string, from: 'user' | 'system' | 'other' | 'admin') => Promise<[any, Err]>;

  // 更新作品
  updateApp: (params: UpdateAppParams) => Promise<[string, Err]>;
  // 删除作品
  deleteApp?: (id: string) => Promise<[string, Err]>;
  // 获取模版的分类信息
  getTemplateTypes: () => Promise<[{ name: string; id: string }[], Err]>;
  // 获取模版列表
  getTemplates: (params: TemplateParams) => Promise<[{ name: string; id: string }[], Err]>;
  // 获取用户信息
  getUserInfo: (token: string) => Promise<[{ name: string; id: string }[], Err]>;
  // 获取素材的分类
  getMaterialTypes: (type: string) => Promise<[{ name: string; id: string }[], Err]>;
  // 获取素材
  getMaterials: (params: MaterialParams) => Promise<
    [
      {
        data: { id: string; name: string; urls: { url: string; thumb: string } }[];
        current_page: number;
        total: number;
      },
      Err,
    ]
  >;
  // 收藏元素
  collect: (params: { source_id: string; type: string }) => Promise<[string, Err]>;
  // 取消收藏
  cancelCollect: (sourceIds: string[], type: string) => Promise<[string, Err]>;
  // 收藏列表
  getCollects: (params: CollectParams) => Promise<[{ id: string; name: string }[], Err]>;
  // 上传base64图片
  uploadBase64: (params: UploadBase64Params) => Promise<[{ storage_path: string }, Err]>;
  // 表单上传
  formUpdate: (params: FormData) => Promise<[{ storage_path: string }, Err]>;
  // 获取用户素材
  getUserMaterial: (params: MaterialParams) => Promise<[{ data: MaterialItemRes[]; total: number }, Err]>;
  // 获取用户的素材分类
  getUserMaterialType: (
    params: UserMaterialTypeParams,
  ) => Promise<[{ data: { id: string; name: string }[]; total: number }, Err]>;
  // 删除用户素材
  deleteUserMaterial: (ids: string[]) => Promise<[string, Err]>;
  // 新增用户素材
  createUserMaterial: (params: CreateUserMaterialParams) => Promise<[MaterialItemRes, Err]>;
  //tts
  createTTS: (params: CreateTTSParams) => Promise<[{ storage_path: string }, Err]>;
  //ai字幕，传入音频的url，返回taskId，轮训taskId查询转换结果
  createCaption: (url: string) => Promise<[{ TaskId: string }, Err]>;
  // 轮训
  seekCaptionTask: (taskId: string) => Promise<[any, Err]>;
  // 修改用户素材
  updateUserMaterial: (params: UpdateUserMaterialParams) => Promise<[MaterialItemRes, Err]>;

  // ai 对话（SSE 流式返回）
  openAiChatSSE: (params: AiChatParams) => Promise<[any, Err]>;
  // ai 对话（一次性返回）
  openAiChat: (params: AiChatParams) => Promise<[any, Err]>;
  // 查询 AI 任务详情
  aiTaskInfo: (id: string) => Promise<[any, Err]>;

  // ========== VIP / 积分 ==========
  // 积分套餐列表
  getCreditPackages: () => Promise<[any, Err]>;
  // 创建积分订单
  createCreditOrder: (packageId: string | number) => Promise<[any, Err]>;
  // 积分订单状态
  getCreditOrderStatus: (id: string | number) => Promise<[any, Err]>;
  // VIP 套餐列表
  getVipPackages: () => Promise<[any, Err]>;
  // 创建 VIP 订单
  createVipOrder: (packageId: string | number, vipLevel?: number) => Promise<[any, Err]>;
  // VIP 订单状态
  getVipOrderStatus: (id: string | number) => Promise<[any, Err]>;
}
