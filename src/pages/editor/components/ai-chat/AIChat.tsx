import { useState, useEffect, useRef, useMemo } from 'react';
import styles from './ai-chat.module.less';
import { AIChatInput, Button, Select, Toast, Popover, Input, Tooltip, Slider } from '@douyinfe/semi-ui';
import { Plus, History, Edit, Delete } from '@icon-park/react';
import type { MessageContent } from '@douyinfe/semi-ui/aiChatInput/interface';
import { stores } from '@stores/index';
import { pubsub } from '@utils/pubsub';
import type * as st from '@config/sdk.d';
import { addImageVideoAudioItem } from '../sources/addItem';
import { getUploadBeforeData } from '../../tools/uploadBeforeData';
import { getSystemPrompt, parseToolCalls, executeToolCall, splitUserCommand } from './aiMovieEditor';
import { DEFAULT_LLM_MODEL } from './aiConfig';
import { getCredits } from './price';
import ChatMessages from './ChatMessages';
import type { ChatMessage, MediaContent } from './ChatMessages';
import { util } from '@utils/index';
import { utils } from 'video-core-sdk';
import localforage from 'localforage';

const POLL_INTERVAL = 5000; // 5 秒轮询

// localforage 实例
const chatStore = localforage.createInstance({
  name: 'ai_chat',
});

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

const STORAGE_KEY = 'ai_chat_history';

const getHistory = async (): Promise<Conversation[]> => {
  try {
    const data = await chatStore.getItem<Conversation[]>(STORAGE_KEY);
    return data || [];
  } catch {
    return [];
  }
};

const saveHistory = async (history: Conversation[]): Promise<void> => {
  try {
    await chatStore.setItem(STORAGE_KEY, history);
  } catch {
    // ignore
  }
};

const WELCOME_MESSAGE: ChatMessage = {
  id: '0',
  role: 'assistant',
  createAt: Date.now(),
  content: '你好！我是AI 剪辑助手，请告诉我你需要什么帮助？',
};

const roleConfig = {
  user: {
    name: '用户',
    avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
  },
  assistant: {
    name: 'AI 助手',
    avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
  },
};

type AIMode = 'agent' | 'image' | 'video';

interface AIModeOption {
  value: AIMode;
  label: string;
}

const AI_MODES: AIModeOption[] = [
  { value: 'agent', label: 'agent模式' },
  { value: 'image', label: '图片生成' },
  { value: 'video', label: '视频生成' },
];

const MODE_UPLOAD_CONFIG: Record<AIMode, { accept: string; placeholder: string }> = {
  agent: { accept: '', placeholder: '输入你的问题...' },
  image: { accept: 'image/*', placeholder: '上传参考图、输入文字，描述你想生成的图片' },
  video: {
    accept: 'image/*',
    placeholder: '输入文字，描述你想创作的画面内容、运动方式等。例如：一个3D形象的小男孩，在公园滑滑板',
  },
};

const VIDEO_REFERENCE_UPLOAD: Record<VideoReferenceType, { count: number; labels: string[] }> = {
  all: { count: 1, labels: ['上传参考图'] },
  frames: { count: 2, labels: ['首帧', '尾帧'] },
  multi: { count: 4, labels: ['参考图1', '参考图2', '参考图3', '参考图4'] },
};

interface ImageModel {
  value: string;
  label: string;
  desc: string;
}

const IMAGE_MODELS: ImageModel[] = [
  { value: 'doubao-seedream-5-0-pro-260628', label: 'Doubao-Seedream-5.0-pro', desc: '文生图/图生图/多参考图，高质量生成' },
  { value: 'doubao-seedream-5-0-260128', label: 'Doubao-Seedream-5.0-lite', desc: '支持单图/组图生成，文生图/图生图/多参考图' },
  { value: 'doubao-seedream-4-5-251128', label: 'Doubao-Seedream-4.5', desc: '支持单图/组图生成，一致性、风格优化' },
  { value: 'doubao-seedream-4-0-250828', label: 'Doubao-Seedream-4.0', desc: '基础图生能力，性价比高' },
];

interface ImageRatio {
  value: string;
  label: string;
}

const IMAGE_RATIOS: ImageRatio[] = [
  { value: 'smart', label: '智能' },
  { value: '2:1', label: '2:1' },
  { value: '16:9', label: '16:9' },
  { value: '3:2', label: '3:2' },
  { value: '4:3', label: '4:3' },
  { value: '1:1', label: '1:1' },
  { value: '3:4', label: '3:4' },
  { value: '2:3', label: '2:3' },
  { value: '9:16', label: '9:16' },
];

interface ImageResolution {
  value: string;
  label: string;
  width: number;
  height: number;
}

const IMAGE_RESOLUTIONS: ImageResolution[] = [
  { value: '1k', label: '1K', width: 2048, height: 2048 },
  { value: '2k', label: '2K', width: 2048, height: 2048 },
  { value: '4k', label: '4K', width: 4096, height: 4096 },
];

const getImageSize = (ratio: string, resolution: string): { width: number; height: number } => {
  const res = IMAGE_RESOLUTIONS.find(r => r.value === resolution);
  const baseWidth = res?.width || 2048;
  const baseHeight = res?.height || 2048;

  if (ratio === 'smart') {
    return { width: baseWidth, height: baseHeight };
  }

  const [w, h] = ratio.split(':').map(Number);
  if (w > h) {
    return { width: baseWidth, height: Math.round((baseWidth * h) / w) };
  } else {
    return { height: baseHeight, width: Math.round((baseHeight * w) / h) };
  }
};

const getEstimatedCredits = (
  mode: string,
  model: string,
  resolution: string,
  count: number,
  duration?: number,
): number => {
  if (mode === 'agent') return 0;

  // 从 price.ts 获取单次生成积分
  const baseCredits = getCredits(model, resolution);

  if (mode === 'image') {
    return baseCredits * count;
  }

  if (mode === 'video') {
    // 时长系数：以 5 秒为基准
    const secs = Number(duration) || 5;
    return baseCredits * (secs / 5) * count;
  }

  return 0;
};

interface VideoModel {
  value: string;
  label: string;
  desc: string;
}

const VIDEO_MODELS: VideoModel[] = [
  { value: 'doubao-seedance-2-0-260128', label: 'Doubao-Seedance-2.0', desc: '多模态生视频/编辑/延长，支持4K、音画同生' },
  { value: 'doubao-seedance-2-0-fast-260128', label: 'Doubao-Seedance-2.0-fast', desc: '极速推理，高性价比，480p/720p' },
  { value: 'doubao-seedance-1-0-pro-250528', label: 'Doubao-Seedance-1.0-pro', desc: '基础视频生成，性价比高' },
  { value: 'doubao-seedance-1-0-pro-fast-251015', label: 'Doubao-Seedance-1.0-pro-fast', desc: '极速版基础视频生成' },
  { value: 'doubao-seedance-2-0-mini-260615', label: 'Doubao-Seedance-2.0-mini', desc: '高性价比，极速推理，480p/720p' },
];

type VideoReferenceType = 'all' | 'frames' | 'multi';

interface VideoReference {
  value: VideoReferenceType;
  label: string;
}

const VIDEO_REFERENCES: VideoReference[] = [
  { value: 'all', label: '全能参考' },
  { value: 'frames', label: '首尾帧' },
  { value: 'multi', label: '智能多帧' },
];

interface VideoRatio {
  value: string;
  label: string;
}

const VIDEO_RATIOS: VideoRatio[] = [
  { value: '2:1', label: '2:1' },
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '1:1', label: '1:1' },
  { value: '3:4', label: '3:4' },
  { value: '9:16', label: '9:16' },
];

interface VideoResolution {
  value: string;
  label: string;
}

const MODEL_SUPPORTED_RESOLUTIONS: Record<string, VideoResolution[]> = {
  'doubao-seedance-2-0-260128': [
    { value: '480p', label: '480P' },
    { value: '720p', label: '720P' },
    { value: '1080p', label: '1080P' },
    { value: '4k', label: '4K' },
  ],
  'doubao-seedance-2-0-fast-260128': [
    { value: '480p', label: '480P' },
    { value: '720p', label: '720P' },
  ],
  'doubao-seedance-2-0-mini-260615': [
    { value: '480p', label: '480P' },
    { value: '720p', label: '720P' },
  ],
  'doubao-seedance-1-0-pro-250528': [
    { value: '480p', label: '480P' },
    { value: '720p', label: '720P' },
    { value: '1080p', label: '1080P' },
  ],
  'doubao-seedance-1-0-pro-fast-251015': [
    { value: '480p', label: '480P' },
    { value: '720p', label: '720P' },
    { value: '1080p', label: '1080P' },
  ],
};

// 视频模型支持的时长范围
const MODEL_SUPPORTED_DURATIONS: Record<string, { min: number; max: number }> = {
  'doubao-seedance-2-0-260128': { min: 4, max: 15 },
  'doubao-seedance-2-0-fast-260128': { min: 4, max: 15 },
  'doubao-seedance-2-0-mini-260615': { min: 4, max: 15 },
  'doubao-seedance-1-0-pro-250528': { min: 2, max: 12 },
  'doubao-seedance-1-0-pro-fast-251015': { min: 2, max: 12 },
};

interface VideoDuration {
  value: number;
  label: string;
}



export default function AIChat() {
  const { editor, user } = stores;
  const [chats, setChats] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [aiMode, setAiMode] = useState<AIMode>('agent');
  const [uploadedImages, setUploadedImages] = useState<Record<string, { base64: string; file: File }>>({});
  const [imageModel, setImageModel] = useState('doubao-seedream-5-0-pro-260628');
  const [imageRatio, setImageRatio] = useState('1:1');
  const [imageResolution, setImageResolution] = useState('2k');
  const [videoModel, setVideoModel] = useState('doubao-seedance-2-0-mini-260615');
  const [videoReference, setVideoReference] = useState<VideoReferenceType>('all');
  const [videoRatio, setVideoRatio] = useState('1:1');
  const [videoResolution, setVideoResolution] = useState('720p');
  const [videoCount, setVideoCount] = useState(1);
  const [videoDuration, setVideoDuration] = useState(5);
  const editInputRef = useRef<HTMLInputElement>(null);

  // 当前视频模型支持的分辨率
  const supportedVideoResolutions = useMemo(() => {
    return MODEL_SUPPORTED_RESOLUTIONS[videoModel] || MODEL_SUPPORTED_RESOLUTIONS['doubao-seedance-2-0-mini-260615'];
  }, [videoModel]);

  // 切换模型时自动修正分辨率（如果当前选中的分辨率不支持，默认切到720p）
  useEffect(() => {
    const supported = supportedVideoResolutions.map(r => r.value);
    if (!supported.includes(videoResolution)) {
      setVideoResolution('720p');
    }
  }, [videoModel, supportedVideoResolutions, videoResolution]);

  // 当前视频模型支持的时长列表
  const supportedVideoDurations = useMemo(() => {
    const range = MODEL_SUPPORTED_DURATIONS[videoModel] || { min: 4, max: 10 };
    const durations: VideoDuration[] = [];
    for (let i = range.min; i <= range.max; i++) {
      durations.push({ value: i, label: `${i}s` });
    }
    return durations;
  }, [videoModel]);

  // 切换模型时自动修正时长（如果当前选中的时长超出范围，默认取最接近的值）
  useEffect(() => {
    const range = MODEL_SUPPORTED_DURATIONS[videoModel] || { min: 4, max: 10 };
    if (videoDuration < range.min) {
      setVideoDuration(range.min);
    } else if (videoDuration > range.max) {
      setVideoDuration(range.max);
    }
  }, [videoModel, videoDuration]);
  const dialogueRef = useRef<HTMLDivElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const uploadInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pollingRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  console.log('chats', chats);

  const currentModeConfig = MODE_UPLOAD_CONFIG[aiMode];

  const handleModeChange = (value: string | number | any[]) => {
    const mode = value as AIMode;
    setAiMode(mode);
    setUploadedImages({});
  };

  const handleImageUpload = (slotKey: string) => {
    const input = uploadInputRefs.current[slotKey];
    if (input) {
      input.click();
    }
  };

  const handleImageChange = (slotKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target?.result as string;
      setUploadedImages(prev => ({
        ...prev,
        [slotKey]: { base64, file },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (slotKey: string) => {
    setUploadedImages(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  };

  const uploadSlots = useMemo(() => {
    if (aiMode === 'agent') return [];
    if (aiMode === 'image') {
      return [
        {
          key: 'slot_0',
          label: '上传参考图',
          accept: MODE_UPLOAD_CONFIG.image.accept,
          index: 0,
        },
      ];
    }
    if (aiMode === 'video') {
      const refConfig = VIDEO_REFERENCE_UPLOAD[videoReference];
      return refConfig.labels.map((label, i) => ({
        key: `slot_${i}`,
        label,
        accept: MODE_UPLOAD_CONFIG.video.accept,
        index: i,
      }));
    }
    return [];
  }, [aiMode, videoReference]);

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chats]);

  // 组件卸载时清理所有轮询
  useEffect(() => {
    return () => clearAllPolling();
  }, []);

  // 从 localforage 加载历史记录
  useEffect(() => {
    getHistory().then(data => {
      setHistory(data);
      setHistoryLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (currentConversationId) {
      const existing = history.find(h => h.id === currentConversationId);
      if (existing) {
        setChats(existing.messages);
      }
    }
  }, [currentConversationId, history]);

  // 监听来自 ai-btns "加入对话" 的图片数据
  useEffect(() => {
    const handler = (_msg, data: { base64: string }) => {
      // 找到第一个可用的 slot
      const slot = uploadSlots.find(s => !uploadedImages[s.key]);
      if (!slot) {
        Toast.warning('参考图已满，请先移除一个');
        return;
      }
      setUploadedImages(prev => ({
        ...prev,
        [slot.key]: { base64: data.base64, file: new File([], 'reference.png') as any },
      }));
      // 如果当前是 agent 模式，自动切换到对应模式
      if (aiMode === 'agent') {
        if (uploadSlots.length > 0) {
          // 根据第一个 slot 类型切换
          setAiMode(uploadSlots[0]?.key?.startsWith('video') ? 'video' : 'image');
        }
      }
      Toast.success('图片已添加到参考图');
    };
    pubsub.subscribe('addRefImage', handler);
    return () => {
      pubsub.unsubscribe('addRefImage');
    };
  }, [uploadSlots, uploadedImages, aiMode]);

  const createNewConversation = () => {
    clearAllPolling();
    setChats([WELCOME_MESSAGE]);
    setCurrentConversationId(null);
    Toast.success('已创建新对话');
  };

  const selectConversation = (id: string) => {
    clearAllPolling();
    const conversation = history.find(h => h.id === id);
    if (conversation) {
      setChats(conversation.messages);
      setCurrentConversationId(id);
    }
  };

  const startEditTitle = (id: string, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 50);
  };

  const saveEditTitle = () => {
    if (editingId && editingTitle.trim()) {
      const updated = history.map(h => (h.id === editingId ? { ...h, title: editingTitle.trim() } : h));
      setHistory(updated);
      saveHistory(updated);
      Toast.success('已重命名');
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const deleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    saveHistory(updated);
    if (currentConversationId === id) {
      setChats([WELCOME_MESSAGE]);
      setCurrentConversationId(null);
    }
    Toast.success('已删除');
  };

  const saveCurrentConversation = (updatedChats?: ChatMessage[]) => {
    const msgs = updatedChats || chats;
    if (currentConversationId) {
      const updated = history.map(h =>
        h.id === currentConversationId ? { ...h, messages: msgs, title: getTitle(msgs) } : h,
      );
      setHistory(updated);
      saveHistory(updated);
    } else if (msgs.length > 1) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: getTitle(msgs),
        messages: msgs,
        createdAt: Date.now(),
      };
      const updated = [newConversation, ...history];
      setHistory(updated);
      saveHistory(updated);
      setCurrentConversationId(newConversation.id);
    }
  };

  const getTitle = (messages: ChatMessage[]): string => {
    const userMsg = messages.find(m => m.role === 'user');
    return userMsg ? userMsg.content.slice(0, 20) + (userMsg.content.length > 20 ? '...' : '') : '新对话';
  };

  // 轮询任务结果，成功后替换占位图
  const pollTaskResult = (taskId: string, msgId: string) => {
    if (pollingRef.current[taskId]) {
      clearInterval(pollingRef.current[taskId]);
    }
    pollingRef.current[taskId] = setInterval(async () => {
      try {
        const [statusRes, statusErr] = await editor.apiServer!.seekAiTaskStatus([taskId]);
        if (statusErr) return;

        // 返回格式: [{ id: 47, task_type: "huoshan_image", task_id: "", status: 3, result: { url: "/video/..." } }]
        // task_id 可能为空字符串，用 id 匹配
        const arr = Array.isArray(statusRes) ? statusRes : [statusRes];
        console.log('[pollTaskResult] 轮询: taskId=', taskId, '返回:', statusRes);
        const task = arr.find((d: any) => d.task_id === taskId || String(d.id) === String(taskId));
        if (!task) {
          console.warn(`[pollTaskResult] 未匹配到任务, taskId=${taskId}, 返回:`, statusRes);
          return;
        }

        // 更新 editor.aiLoopStatus
        editor.aiLoopStatus[taskId] = task;

        const resultUrl = task.result?.url;
        const taskStatus = task.status; // 0-未入队列 1-待处理 2-处理中 3-成功 4-失败 5-已取消

        const isDone = taskStatus === 3;
        const isFailed = taskStatus === 4 || taskStatus === 5;

        if (isDone || isFailed) {
          clearInterval(pollingRef.current[taskId]);
          delete pollingRef.current[taskId];

          setChats(prev => {
            let newContent: string | MediaContent[];
            if (isFailed) {
              newContent = `生成失败：${task.error_msg || task.message || '未知错误'}`;
            } else if (resultUrl) {
              const fullUrl = editor.movie?.reURL?.(resultUrl) || resultUrl;
              const isVideo = task.task_type === 'huoshan_video' || task.task_type === 'huoshan_cv_video';
              if (isVideo) {
                newContent = [{ type: 'video', video_url: fullUrl, file_id: `ai_video_${Date.now()}` }];
              } else {
                newContent = [{ type: 'image', image_url: fullUrl, file_id: `ai_image_${Date.now()}` }];
              }
            } else {
              newContent = `任务已完成，请在素材库中查看结果。`;
            }

            console.log('[pollTaskResult] 更新消息, msgId=', msgId, 'newContent=', newContent);

            const updated = prev.map(m => {
              if (m.id === msgId) {
                return { ...m, content: newContent };
              }
              return m;
            });
            saveCurrentConversation(updated);
            return updated;
          });

          if (resultUrl && !isFailed) {
            Toast.success('AI 生成完成');
          }
        }
      } catch (e) {
        // 轮询异常不中断，下一轮继续
      }
    }, POLL_INTERVAL);
  };

  // 通过 getAiTaskList 获取最新任务，启动轮询
  const startImagePolling = async (placeholderMsgId: string) => {
    try {
      const [listRes] = await editor.apiServer!.getAiTaskList({ page: 1, page_size: 1 });
      const latestTask = Array.isArray(listRes?.data) ? listRes.data[0] : listRes?.data;
      // 用 String(id) 作为轮询 key，与 seekAiTaskStatus 返回匹配
      const rawId = latestTask?.id || latestTask?.task_id;
      if (rawId) {
        const taskId = String(rawId);
        console.log('[startImagePolling] 找到任务, taskId=', taskId, 'latestTask=', latestTask);
        editor.aiLoopStatus[taskId] = latestTask;
        pollTaskResult(taskId, placeholderMsgId);
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  };

  // 清理所有轮询
  const clearAllPolling = () => {
    Object.values(pollingRef.current).forEach(clearInterval);
    pollingRef.current = {};
  };

  // 插入生成的图片到画布
  const insertImageToCanvas = async (url: string) => {
    if (!editor?.data) {
      Toast.error('没有打开的视频项目');
      return;
    }
    try {
      const fullUrl = editor.movie?.reURL?.(url) || url;
      const currentTime = editor.currentTime || 0;

      // 构造符合addImageVideoAudioItem要求的item结构
      // 获取图片的宽度和高度，设置为默认值
      const _img = await util.imgLazy(fullUrl);
      // 生成封面图URL
      const base64 = (await utils.blobURL2Data(fullUrl as any)) as string;
      const thumbBase64 = (await utils.resizeBase64Image(base64, 200)) as string;
      const [res] = await editor.apiServer.uploadBase64({
        content: thumbBase64,
        name: util.randomID() + '_thumb.png',
        file_type: 'image',
      });
      const thumb = res.storage_path;

      const item = {
        type: 'image',
        name: 'AI生成图片',
        urls: {
          url: fullUrl,
          thumb,
        },
        attrs: {
          width: _img.naturalWidth || 400,
          height: _img.naturalHeight || 400,
        },
        from: 'user', // AI生成的图片归属用户素材
      };

      // 调用标准添加元素方法，自动处理轨道分配、历史记录、选中、更新等
      const element = await addImageVideoAudioItem(item, currentTime);
      if (element) {
        Toast.success('已插入到画布');
      }
    } catch (e) {
      Toast.error('插入失败');
      console.error(e);
    }
  };

  // 插入生成的视频到画布
  const insertVideoToCanvas = async (url: string) => {
    if (!editor?.data) {
      Toast.error('没有打开的视频项目');
      return;
    }
    try {
      Toast.info('正在解析视频信息...');
      const fullUrl = editor.movie?.reURL?.(url) || url;

      // 通过 getUploadBeforeData 获取视频的元数据（duration, thumb, frames, wave 等）
      const videoData = await getUploadBeforeData({
        url: fullUrl,
        type: 'video',
        uploadBase64: (params: any) => editor.apiServer!.uploadBase64(params),
        reURL: (u: string) => editor.movie?.reURL?.(u) || u,
      });

      const currentTime = editor.currentTime || 0;

      // 构造符合 addImageVideoAudioItem 要求的 item 结构
      const item = {
        type: 'video',
        name: 'AI生成视频',
        urls: {
          url: fullUrl,
          thumb: (videoData as any).thumb || fullUrl,
        },
        attrs: {
          ...videoData,
          width: (videoData as any).videoWidth || 400,
          height: (videoData as any).videoHeight || 400,
          duration: (videoData as any).duration || 5,
        },
        from: 'user',
      };

      const element = await addImageVideoAudioItem(item, currentTime);
      if (element) {
        Toast.success('视频已插入到画布');
      }
    } catch (e) {
      Toast.error('视频插入失败');
      console.error(e);
    }
  };

  // 复制URL到剪贴板
  const copyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      Toast.success('链接已复制');
    } catch {
      Toast.error('复制失败');
    }
  };

  // 删除消息
  const deleteMessage = (msgId: string) => {
    setChats(prev => {
      const updated = prev.filter(m => m.id !== msgId);
      saveCurrentConversation(updated);
      return updated;
    });
    Toast.success('已删除');
  };

  // 复制消息内容
  const copyMessage = async (msg: ChatMessage) => {
    let text = '';
    if (typeof msg.content === 'string') {
      text = msg.content;
    } else {
      // 提取多媒体消息里的文本和URL
      text = msg.content
        .map(item => {
          if (item.type === 'text') return item.text;
          if (item.type === 'image') return `图片：${item.image_url}`;
          if (item.type === 'video') return `视频：${item.video_url}`;
          return '';
        })
        .filter(Boolean)
        .join('\n');
    }
    if (text) {
      await navigator.clipboard.writeText(text);
      Toast.success('已复制消息内容');
    }
  };

  // 撤销对话：删除用户消息和对应的AI回复
  const undoMessage = (msg: ChatMessage) => {
    setChats(prev => {
      const idx = prev.findIndex(m => m.id === msg.id);
      if (idx === -1) return prev;

      const updated = [...prev];
      // 删除这条用户消息
      updated.splice(idx, 1);
      // 如果下一条是AI回复，也删掉
      if (idx < updated.length && updated[idx].role === 'assistant') {
        updated.splice(idx, 1);
      }
      saveCurrentConversation(updated);
      return updated;
    });
    Toast.success('已撤销该对话');
  };

  const handleSendMessage = async (content: string | MessageContent) => {
    const text = typeof content === 'string' ? content : content.inputContents?.[0]?.text || '';

    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      createAt: Date.now(),
      content: text.trim(),
    };
    const thinkingId = `thinking_${Date.now()}`;
    const thinkingMsg: ChatMessage = {
      id: thinkingId,
      role: 'assistant',
      createAt: Date.now(),
      content: '思考中...',
      status: 'loading' as any,
    };
    setChats(prev => [...prev, userMsg, thinkingMsg]);
    setLoading(true);

    // 辅助函数：用真实回复替换 thinking 消息
    const replaceThinking = (aiMsg: ChatMessage) => {
      setChats(prev => {
        const updated = prev.filter(m => m.id !== thinkingId).concat(aiMsg);
        saveCurrentConversation(updated);
        return updated;
      });
    };

    try {
      if (aiMode === 'agent') {
        // 执行单次 Agent 对话
        const runAgentCommand = async (
          command: string,
          label?: string,
          previousResults?: string,
        ): Promise<{ content: string; successCount: number; failCount: number; rawResults?: string }> => {
          const labelPrefix = label ? `[${label}] ` : '';
          let systemPrompt = getSystemPrompt(editor);
          
          if (previousResults) {
            systemPrompt += `\n\n【前序执行结果】：${previousResults}`;
          }

          const chatMessages: { role: 'user' | 'system'; content: string }[] = [
            { role: 'system', content: systemPrompt },
            ...chats
              .filter(m => m.role === 'user' || m.role === 'assistant')
              .map(m => ({
                role: (m.role === 'user' ? 'user' : 'system') as 'user' | 'system',
                content: typeof m.content === 'string' ? m.content : '',
              })),
            { role: 'user' as const, content: command },
          ];

          const [res, err] = await editor.apiServer!.openAiChat({
            model: DEFAULT_LLM_MODEL,
            messages: chatMessages,
          });

          if (err) {
            console.warn('[runAgentCommand] API 错误:', err);
          }

          let rawContent: string = err
            ? `抱歉，请求失败：${err}`
            : res?.choices?.[0]?.message?.content ||
              res?.content ||
              res?.message ||
              JSON.stringify(res) ||
              '已收到你的消息，请稍后重试';

          console.log('[runAgentCommand] 命令:', command.slice(0, 50), '| err:', !!err, '| 回复长度:', rawContent?.length);

          let { text: cleanText, calls: toolCalls } = parseToolCalls(rawContent);

          console.log('[runAgentCommand] 解析到 tool_calls 数量:', toolCalls.length);

          // 重试：AI 只回复了文字未生成 tool_calls，追加追问强制执行
          if (toolCalls.length === 0 && !err && rawContent.trim()) {
            console.log('[runAgentCommand] 无 tool_calls，发送重试追问...');
            const retryMessages = [
              ...chatMessages,
              { role: 'user' as const, content: '请立即使用 <tool_calls> 格式直接执行上述操作，不要只回复文字或计划。' },
            ];
            const [res2, err2] = await editor.apiServer!.openAiChat({
              model: DEFAULT_LLM_MODEL,
              messages: retryMessages,
            });

            if (!err2 && res2) {
              rawContent = res2?.choices?.[0]?.message?.content ||
                res2?.content ||
                res2?.message ||
                JSON.stringify(res2);
              const retryParse = parseToolCalls(rawContent);
              cleanText = retryParse.text;
              toolCalls = retryParse.calls;
              console.log('[runAgentCommand] 重试后 tool_calls 数量:', toolCalls.length);
            }
          }

          if (toolCalls.length === 0) {
            // AI 以纯文本回复，未生成工具调用
            return {
              content: cleanText || rawContent,
              successCount: 0,
              failCount: 0,
            };
          }

          const results = await Promise.all(
            toolCalls.map(async call => {
              const result = await executeToolCall(editor, call.name, call.args);
              return { ...call, result };
            }),
          );

          const successCount = results.filter(r => r.result.success).length;
          const failCount = results.length - successCount;
          const resultMessages = results
            .map(r => `${r.result.success ? 'OK' : 'FAIL'} [${r.name}]: ${r.result.message}`)
            .join('\n');

          const finalContent =
            (cleanText ? cleanText + '\n\n' : '') +
            `${labelPrefix}执行了 ${toolCalls.length} 个操作（成功 ${successCount} 个）：\n${resultMessages}`;

          editor.updateTimeline();
          editor.updateMovie();

          return { content: finalContent, successCount, failCount, rawResults: resultMessages };
        };

        // 分析命令是否可拆分
        const splitResult = await splitUserCommand(editor.apiServer!, text.trim());
        console.log('[Agent] 命令拆分结果:', splitResult);

        if (splitResult.splittable && splitResult.commands.length > 1) {
          // 可拆分：逐个执行子命令，传递前序执行结果，并在聊天中逐项展示
          let totalSuccess = 0;
          let totalFail = 0;
          let subTaskSuccess = 0;
          let subTaskFail = 0;
          let previousResults = '';

          // 更新 thinking 消息，提示已拆分
          setChats(prev => {
            const updated = prev.map(m =>
              m.id === thinkingId
                ? { ...m, content: `已拆分为 ${splitResult.commands.length} 个子任务，开始执行...` }
                : m,
            );
            return updated;
          });

          for (let i = 0; i < splitResult.commands.length; i++) {
            const cmd = splitResult.commands[i];

            // 更新 thinking 消息，显示当前子任务进度
            setChats(prev => {
              const updated = prev.map(m =>
                m.id === thinkingId
                  ? { ...m, content: `正在执行子任务 ${i + 1}/${splitResult.commands.length}：${cmd.slice(0, 40)}...` }
                  : m,
              );
              return updated;
            });

            const result = await runAgentCommand(cmd, `${i + 1}/${splitResult.commands.length}`, previousResults);
            totalSuccess += result.successCount;
            totalFail += result.failCount;

            // 统计子任务级别的成败
            if (result.successCount > 0 && result.failCount === 0) {
              subTaskSuccess++;
            } else if (result.failCount > 0) {
              subTaskFail++;
            }

            if (result.rawResults) {
              previousResults += result.rawResults + '\n';
            }

            // 每个子任务结果作为一个独立的聊天消息展示
            const subMsg: ChatMessage = {
              id: `sub_${i}_${Date.now()}`,
              role: 'assistant',
              createAt: Date.now(),
              content: `**子任务 ${i + 1}/${splitResult.commands.length}**：${cmd}\n\n${result.content}`,
            };
            setChats(prev => {
              const updated = [...prev, subMsg];
              saveCurrentConversation(updated);
              return updated;
            });
          }

          // 移除 thinking，追加汇总消息
          const summary = `${totalFail > 0 ? ' 部分操作失败。' : ' 全部完成。'}共 ${splitResult.commands.length} 个子任务：${subTaskSuccess} 个成功${subTaskFail > 0 ? `，${subTaskFail} 个失败` : ''}（内含 ${totalSuccess + totalFail} 个操作，${totalSuccess} 成功${totalFail > 0 ? `，${totalFail} 失败` : ''}）`;
          setChats(prev => {
            const updated = prev.filter(m => m.id !== thinkingId);
            saveCurrentConversation(updated);
            return updated;
          });
          // 汇总作为最后一条 AI 消息
          const summaryMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            createAt: Date.now(),
            content: summary,
          };
          setChats(prev => {
            const updated = [...prev, summaryMsg];
            saveCurrentConversation(updated);
            return updated;
          });
        } else {
          // 不可拆分：正常执行
          const result = await runAgentCommand(text.trim());
          const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            createAt: Date.now(),
            content: result.content,
          };
          replaceThinking(aiMsg);
        }
      } else if (aiMode === 'image') {
        // 图片生成模式
        const uploadUrls = Object.values(uploadedImages).map(item => item.base64);
        const size = getImageSize(imageRatio, imageResolution);
        const params: st.AiImageParams = {
          task_type: 'huoshan_image',
          params: {
            model: imageModel,
            prompt: text.trim(),
            size: imageResolution === '4k' ? '4K' : imageResolution === '2k' ? '2K' : '1K',
            watermark: false,
          },
        };

        if (uploadUrls.length > 0) {
          (params as any).params.image = uploadUrls.length === 1 ? uploadUrls[0] : uploadUrls;
        }

        const [, err] = await editor.apiServer!.createAiTask(params);

        if (!err) {
          Toast.success('任务创建成功');
        } else {
          Toast.error(err);
        }

        const placeholderMsgId = (Date.now() + 1).toString();

        if (!err) {
          // 先显示占位图
          const placeholderMsg: ChatMessage = {
            id: placeholderMsgId,
            role: 'assistant',
            createAt: Date.now(),
            content: `图片生成任务已创建（${size.width}x${size.height}），正在生成中...`,
          };
          replaceThinking(placeholderMsg);
          // 后台轮询：通过 getAiTaskList 获取最新任务的 ID
          const started = await startImagePolling(placeholderMsgId);
          if (!started) {
            // 如果获取不到任务 ID，延迟重试
            setTimeout(() => startImagePolling(placeholderMsgId), 2000);
          }
        } else {
          const aiMsg: ChatMessage = {
            id: placeholderMsgId,
            role: 'assistant',
            createAt: Date.now(),
            content: `任务创建失败：${err}`,
          };
          replaceThinking(aiMsg);
        }
      } else if (aiMode === 'video') {
        // 视频生成模式
        const imageUrls = Object.values(uploadedImages).map(item => item.base64);
        const content: { type: string; text?: string; image_url?: { url: string }; role?: string }[] = [
          { type: 'text', text: text.trim() },
        ];

        for (let i = 0; i < imageUrls.length; i++) {
          content.push({
            type: 'image_url',
            image_url: { url: imageUrls[i] },
          });
        }

        const [, err] = await editor.apiServer!.createAiTask({
          task_type: 'huoshan_video',
          params: {
            model: videoModel,
            content,
            ratio: videoRatio,
            duration: videoDuration,
            fps: 24,
            resolution: videoResolution,
            seed: -1,
          },
        });

        if (!err) {
          Toast.success('任务创建成功');
        } else {
          Toast.error(err);
        }

        const placeholderMsgId = (Date.now() + 1).toString();

        if (!err) {
          const placeholderMsg: ChatMessage = {
            id: placeholderMsgId,
            role: 'assistant',
            createAt: Date.now(),
            content: `视频生成任务已创建（${videoRatio} ${videoDuration}s ${videoResolution}），正在生成中...`,
          };
          replaceThinking(placeholderMsg);
          const started = await startImagePolling(placeholderMsgId);
          if (!started) {
            setTimeout(() => startImagePolling(placeholderMsgId), 2000);
          }
        } else {
          Toast.error(err);
          const aiMsg: ChatMessage = {
            id: placeholderMsgId,
            role: 'assistant',
            createAt: Date.now(),
            content: `任务创建失败：${err}`,
          };
          replaceThinking(aiMsg);
        }
      }
    } catch (e: any) {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        createAt: Date.now(),
        content: `请求异常：${e?.message || '网络错误，请稍后重试'}`,
      };
      replaceThinking(aiMsg);
      Toast.error('网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.chat} ref={dialogueRef}>
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>AI 助手</div>
        <div className={styles.headerActions}>
          <Button
            theme="borderless"
            icon={<Plus theme="outline" size="14" />}
            onClick={createNewConversation}
            className={styles.headerBtn}
          />
          <Popover
            content={
              <div className={styles.historyPopover}>
                <div className={styles.historyPopoverHeader}>历史对话</div>
                <div className={styles.historyList}>
                  {history.length === 0 ? (
                    <div className={styles.historyEmpty}>暂无历史对话</div>
                  ) : (
                    history.map(conv => (
                      <div
                        key={conv.id}
                        className={`${styles.historyItem} ${currentConversationId === conv.id ? styles.historyItemActive : ''}`}
                        onClick={() => selectConversation(conv.id)}
                      >
                        {editingId === conv.id ? (
                          <div className={styles.historyItemEdit}>
                            <Input
                              ref={editInputRef}
                              value={editingTitle}
                              onChange={e => setEditingTitle(e)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveEditTitle();
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              onBlur={saveEditTitle}
                              autoComplete="off"
                            />
                          </div>
                        ) : (
                          <>
                            <div className={styles.historyItemContent}>
                              <div className={styles.historyItemTitle}>{conv.title}</div>
                              <div className={styles.historyItemTime}>
                                {new Date(conv.createdAt).toLocaleString('zh-CN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                            <div className={styles.historyItemActions}>
                              <Button
                                theme="borderless"
                                icon={<Edit theme="outline" size="12" />}
                                onClick={e => {
                                  e.stopPropagation();
                                  startEditTitle(conv.id, conv.title);
                                }}
                                className={styles.historyActionBtn}
                              />
                              <Button
                                theme="borderless"
                                icon={<Delete theme="outline" size="12" />}
                                onClick={e => deleteConversation(e, conv.id)}
                                className={styles.historyActionBtn}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            }
            position="bottomRight"
            trigger="click"
          >
            <Button theme="borderless" icon={<History theme="outline" size="14" />} className={styles.headerBtn} />
          </Popover>
        </div>
      </div>
      <div className={styles.chatDialogue}>
        <ChatMessages
            messages={chats}
            roleConfig={roleConfig}
            chatListRef={chatListRef}
            onCopyUrl={copyImageUrl}
            onInsertImage={insertImageToCanvas}
            onInsertVideo={insertVideoToCanvas}
            onDeleteMessage={deleteMessage}
            onCopyMessage={copyMessage}
            onUndoMessage={undoMessage}
          />
      </div>
      <div className={styles.chatInput}>
        <div
          className={styles.chatInputWrapper}
          onKeyDownCapture={e => {
            e.stopPropagation();
          }}
          onKeyUpCapture={e => {
            e.stopPropagation();
          }}
        >
          <AIChatInput
            placeholder={currentModeConfig.placeholder}
            keepSkillAfterSend={false}
            onMessageSend={handleSendMessage}
            generating={loading}
            onStopGenerate={() => setLoading(false)}
            showUploadButton={false}
            showUploadFile={false}
            renderConfigureArea={() => (
              <div className={styles.configureArea}>
                <Select
                  value={aiMode}
                  onChange={handleModeChange}
                  optionList={AI_MODES}
                  style={{ width: 110 }}
                  size="small"
                  className={styles.modeSelect}
                />
                {aiMode === 'image' && (
                  <>
                    <Popover
                      content={
                        <div className={`${styles.imageSettingsPanel} scroll`}>
                          <div className={styles.imageSettingsSection}>
                            <div className={styles.imageSettingsTitle}>选择比例</div>
                            <div className={styles.imageRatioSelector}>
                              {IMAGE_RATIOS.map(ratio => (
                                <button
                                  key={ratio.value}
                                  className={`${styles.imageRatioBtn} ${imageRatio === ratio.value ? styles.imageRatioBtnActive : ''}`}
                                  onClick={() => setImageRatio(ratio.value)}
                                  title={ratio.label}
                                >
                                  {ratio.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className={styles.imageSettingsSection}>
                            <div className={styles.imageSettingsTitle}>选择分辨率</div>
                            <div className={styles.imageResolutionSelector}>
                              {IMAGE_RESOLUTIONS.map(res => (
                                <button
                                  key={res.value}
                                  className={`${styles.imageResolutionBtn} ${imageResolution === res.value ? styles.imageResolutionBtnActive : ''}`}
                                  onClick={() => setImageResolution(res.value)}
                                >
                                  {res.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className={styles.imageSettingsSection}>
                            <div className={styles.imageSettingsTitle}>尺寸</div>
                            <div className={styles.imageSizeInput}>
                              <span className={styles.imageSizeLabel}>W</span>
                              <input
                                type="number"
                                value={getImageSize(imageRatio, imageResolution).width}
                                readOnly
                                className={styles.imageSizeInputField}
                              />
                              <span className={styles.imageSizeLabel}>H</span>
                              <input
                                type="number"
                                value={getImageSize(imageRatio, imageResolution).height}
                                readOnly
                                className={styles.imageSizeInputField}
                              />
                              <span className={styles.imageSizeLabel}>PX</span>
                            </div>
                          </div>
                          <div className={styles.imageSettingsSection}>
                            <div className={styles.imageSettingsTitle}>选择模型</div>
                            <div className={styles.imageModelSelector}>
                              {IMAGE_MODELS.map(model => (
                                <button
                                  key={model.value}
                                  className={`${styles.imageModelBtn} ${imageModel === model.value ? styles.imageModelBtnActive : ''}`}
                                  onClick={() => setImageModel(model.value)}
                                >
                                  <div className={styles.imageModelContent}>
                                    <div className={styles.imageModelName}>{model.label}</div>
                                    <div className={styles.imageModelDesc}>{model.desc}</div>
                                  </div>
                                  {imageModel === model.value && <div className={styles.imageModelCheck} />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      }
                      position="bottomLeft"
                      trigger="click"
                    >
                      <div className={styles.imageSettingsButton}>
                        <span>{imageRatio}</span>
                        <span className={styles.imageSettingsSeparator}>
                          {IMAGE_RESOLUTIONS.find(r => r.value === imageResolution)?.label}
                        </span>
                      </div>
                    </Popover>
                    <Tooltip content={getEstimatedCredits(aiMode, imageModel, imageResolution, 1) + '积分'}>
                      <div className={styles.creditEstimate}>
                        <span className={styles.creditIcon}>💰</span>
                        <span>{getEstimatedCredits(aiMode, imageModel, imageResolution, 1)} </span>
                      </div>
                    </Tooltip>
                  </>
                )}
                {aiMode === 'video' && (
                  <>
                    <Popover
                      content={
                        <div className={`${styles.imageSettingsPanel} scroll`}>
                          <div className={styles.imageSettingsSection}>
                            <div className={styles.imageSettingsTitle}>参考选项</div>
                            <div className={styles.imageModelSelector} style={{ display: 'flex', flexDirection: 'row', gap: '8px', flexWrap: 'wrap' }}>
                              {VIDEO_REFERENCES.map(ref => (
                                <button
                                  key={ref.value}
                                  className={`${styles.imageModelBtn} ${videoReference === ref.value ? styles.imageModelBtnActive : ''}`}
                                  onClick={() => setVideoReference(ref.value)}
                                  style={{ minWidth: '70px', padding: '6px 8px' }}>
                                  <div className={styles.imageModelContent}>
                                    <div className={styles.imageModelName}>{ref.label}</div>
                                  </div>
                                  {videoReference === ref.value && <div className={styles.imageModelCheck} />}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className={styles.imageSettingsSection}>
                            <div className={styles.imageSettingsTitle}>选择比例</div>
                            <div className={styles.imageRatioSelector}>
                              {VIDEO_RATIOS.map(ratio => (
                                <button
                                  key={ratio.value}
                                  className={`${styles.imageRatioBtn} ${videoRatio === ratio.value ? styles.imageRatioBtnActive : ''}`}
                                  onClick={() => setVideoRatio(ratio.value)}
                                  title={ratio.label}
                                >
                                  {ratio.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className={styles.imageSettingsSection}>
                            <div className={styles.imageSettingsTitle}>选择分辨率</div>
                            <div className={styles.imageResolutionSelector}>
                              {supportedVideoResolutions.map(res => (
                                <button
                                  key={res.value}
                                  className={`${styles.imageResolutionBtn} ${videoResolution === res.value ? styles.imageResolutionBtnActive : ''}`}
                                  onClick={() => setVideoResolution(res.value)}
                                >
                                  {res.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className={styles.imageSettingsSection}>
                            <div className={styles.imageSettingsTitle}>
                              生成时长 <span style={{ float: 'right', color: 'var(--theme-textSecondary)', fontSize: '12px' }}>{videoDuration} 秒</span>
                            </div>
                            <Slider
                              value={videoDuration}
                              key={videoModel}
                              onChange={(val: number) => setVideoDuration(val)}
                              min={MODEL_SUPPORTED_DURATIONS[videoModel]?.min || 4}
                              max={MODEL_SUPPORTED_DURATIONS[videoModel]?.max || 10}
                              step={1}
                              marks={supportedVideoDurations.reduce((acc, d) => ({ ...acc, [d.value]: d.label }), {})}
                              style={{ width: '100%', marginTop: '8px' }}
                            />
                          </div>
                          <div className={styles.imageSettingsSection}>
                            <div className={styles.imageSettingsTitle}>选择生成数量</div>
                            <div className={styles.videoCountSelector}>
                              {[1, 2, 3, 4].map(num => (
                                <button
                                  key={num}
                                  className={`${styles.videoCountBtn} ${videoCount === num ? styles.videoCountBtnActive : ''}`}
                                  onClick={() => setVideoCount(num)}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className={styles.imageSettingsSection}>
                            <div className={styles.imageSettingsTitle}>选择模型</div>
                            <div className={styles.imageModelSelector}>
                              {VIDEO_MODELS.map(model => (
                                <button
                                  key={model.value}
                                  className={`${styles.imageModelBtn} ${videoModel === model.value ? styles.imageModelBtnActive : ''}`}
                                  onClick={() => setVideoModel(model.value)}
                                >
                                  <div className={styles.imageModelContent}>
                                    <div className={styles.imageModelName}>{model.label}</div>
                                    <div className={styles.imageModelDesc}>{model.desc}</div>
                                  </div>
                                  {videoModel === model.value && <div className={styles.imageModelCheck} />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      }
                      position="bottomLeft"
                      trigger="click"
                    >
                      <div className={styles.imageSettingsButton}>
                        <span>{videoRatio}</span>
                        <span className={styles.imageSettingsSeparator}>
                          {supportedVideoResolutions.find(r => r.value === videoResolution)?.label}
                        </span>
                      </div>
                    </Popover>
                    <Tooltip
                      content={
                        getEstimatedCredits(aiMode, videoModel, videoResolution, videoCount, videoDuration) + '积分'
                      }
                    >
                      <div className={styles.creditEstimate}>
                        <span className={styles.creditIcon}>💰</span>

                        <span>
                          {getEstimatedCredits(aiMode, videoModel, videoResolution, videoCount, videoDuration)}{' '}
                        </span>
                      </div>
                    </Tooltip>
                  </>
                )}
              </div>
            )}
            renderTopSlot={() => {
              if (uploadSlots.length === 0) return null;
              return (
                <div className={styles.uploadArea}>
                  {uploadSlots.map((slot, index) => (
                    <div key={slot.key} className={styles.uploadItem}>
                      <input
                        type="file"
                        accept={slot.accept}
                        style={{ display: 'none' }}
                        ref={el => {
                          uploadInputRefs.current[slot.key] = el;
                        }}
                        onChange={e => handleImageChange(slot.key, e)}
                      />
                      {uploadedImages[slot.key] ? (
                        <div className={styles.uploadPreview}>
                          <img src={uploadedImages[slot.key].base64} alt={slot.label} />
                          <div className={styles.uploadRemove} onClick={() => handleRemoveImage(slot.key)}>
                            x
                          </div>
                        </div>
                      ) : (
                        <div
                          className={styles.uploadPlaceholder}
                          onClick={() => handleImageUpload(slot.key)}
                          title={slot.label}
                        >
                          <Plus theme="outline" size="16" />
                          <span className={styles.uploadPlaceholderLabel}>{slot.label}</span>
                        </div>
                      )}
                      {index < uploadSlots.length - 1 && videoReference !== 'multi' && <div className={styles.uploadArrow}>→</div>}
                    </div>
                  ))}
                </div>
              );
            }}
            topSlotPosition="top"
            uploadProps={{
              action: '/api/v1/common/upload/form',
              accept: 'image/*',
              showUploadList: false,
              headers: {
                Authorization: editor.token,
              },
              beforeUpload: (file: any) => {
                const blob = file.originFileObj || file.file || file;
                if (!(blob instanceof Blob)) {
                  console.warn('Invalid file object:', file);
                  return false;
                }
                const reader = new FileReader();
                reader.onload = async e => {
                  const base64 = e.target?.result as string;
                  const userMsg: ChatMessage = {
                    id: Date.now().toString(),
                    role: 'user',
                    createAt: Date.now(),
                    content: [{ type: 'image', image_url: base64, file_id: `upload_${Date.now()}` }],
                  };
                  const thinkingId = `thinking_${Date.now()}`;
                  const thinkingMsg: ChatMessage = {
                    id: thinkingId,
                    role: 'assistant',
                    createAt: Date.now(),
                    content: '思考中...',
                    status: 'loading' as any,
                  };
                  setChats(prev => [...prev, userMsg, thinkingMsg]);
                  setLoading(true);

                  const replaceThinking = (aiMsg: ChatMessage) => {
                    setChats(prev => {
                      const updated = prev.filter(m => m.id !== thinkingId).concat(aiMsg);
                      saveCurrentConversation(updated);
                      return updated;
                    });
                  };

                  try {
                    const chatMessages = chats
                      .filter(m => m.role === 'user' || m.role === 'assistant')
                      .map(m => ({
                        role: (m.role === 'user' ? 'user' : 'system') as 'user' | 'system',
                        content: typeof m.content === 'string' ? m.content : '',
                      }));
                    chatMessages.push({ role: 'user' as const, content: '请分析这张图片' });

                    const [res, err] = await editor.apiServer!.openAiChat({
                      model: 'doubao-seedance-1-5-pro-251215',
                      messages: chatMessages,
                    });

                    if (err) {
                      Toast.error(err);
                    }

                    const aiContent = err
                      ? `图片分析失败：${err}`
                      : res?.choices?.[0]?.message?.content ||
                        res?.content ||
                        res?.message ||
                        JSON.stringify(res) ||
                        '已收到你上传的图片，请告诉我你想对这张图片做什么？';

                    const aiMsg: ChatMessage = {
                      id: (Date.now() + 1).toString(),
                      role: 'assistant',
                      createAt: Date.now(),
                      content: aiContent,
                    };
                    replaceThinking(aiMsg);
                  } catch (e: any) {
                    const errMsg = e?.message || '网络错误，请稍后重试';
                    const aiMsg: ChatMessage = {
                      id: (Date.now() + 1).toString(),
                      role: 'assistant',
                      createAt: Date.now(),
                      content: `图片分析异常：${errMsg}`,
                    };
                    replaceThinking(aiMsg);
                    Toast.error('网络请求失败');
                  } finally {
                    setLoading(false);
                  }
                };
                reader.readAsDataURL(blob);
                return false;
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
