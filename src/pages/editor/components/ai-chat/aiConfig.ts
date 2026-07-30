import { Toast } from '@douyinfe/semi-ui';
import { stores } from '@stores/index';
import { util } from '@utils/index';

// ==================== LLM 模型配置 ====================

interface LLMModelConfig {
  name: string;
  modelId: string;
  provider: string;
  description?: string;
}

/** 可用的 LLM 模型列表 */
export const LLM_MODELS: Record<string, LLMModelConfig> = {
  'doubao-seed-1-6-251015': {
    name: '豆包 Seed 1.6',
    modelId: 'doubao-seed-1-6-251015',
    provider: 'huoshan',
    description: '通用大语言模型，用于 AI 对话和指令拆解',
  },
  'deepseek-v4-pro-260425': {
    name: 'Deepseek V4 Pro',
    modelId: 'deepseek-v4-pro-260425',
    provider: 'deepseek',
    description: '专业级大语言模型，用于复杂任务和专业领域',
  },
  'deepseek-v4-flash-260425': {
    name: 'Deepseek V4 Flash',
    modelId: 'deepseek-v4-flash-260425',
    provider: 'deepseek',
    description: '专业级大语言模型，用于复杂任务和专业领域',
  },
};

/** 默认 LLM 模型 */
export const DEFAULT_LLM_MODEL = 'deepseek-v4-pro-260425';

/**
 * 获取 LLM 模型配置
 * @param modelId 模型 ID，默认使用 DEFAULT_LLM_MODEL
 */
export function getLLMModel(modelId?: string): LLMModelConfig {
  const id = modelId || DEFAULT_LLM_MODEL;
  return LLM_MODELS[id] || LLM_MODELS[DEFAULT_LLM_MODEL];
}

// ==================== 图片/视频生成参数 ====================

// https://www.volcengine.com/docs/82379/1393047
export async function getImageToVideoParams(formData: Record<string, any>) {
  const { editor } = stores;
  let params = {};
  const [img1, img2] = formData.urls;
  switch (formData.aiAction) {
    case 'text-to-image':
      {
        params = {
          task_type: 'huoshan_image',
          params: {
            model: 'doubao-seedream-4-5-251128',
            prompt: formData.description,
            size: formData.size || `1K`, // 2K、4K
            watermark: false,
          },
        };
      }
      break;
    case 'image-to-image':
      {
        const _img = await util.imgLazy(editor.movie.reURL(img1));
        params = {
          task_type: 'huoshan_image',
          params: {
            model: 'doubao-seedream-4-5-251128',
            prompt: formData.description,
            image: editor.movie.reURL(img1),
            size: formData.size || `1K`, //`${_img.naturalWidth}x${_img.naturalHeight}`, // 2K、4K
            watermark: false,
          },
        };
      }
      break;
    case 'images-to-image':
      {
        const _img = await util.imgLazy(editor.movie.reURL(img1));
        params = {
          task_type: 'huoshan_image',
          params: {
            model: 'doubao-seedream-4-5-251128',
            prompt: formData.description,
            image: formData.urls,
            sequential_image_generation: 'disabled',
            size: formData.size || `1K`, // 2K、4K
            watermark: false,
          },
        };
      }
      break;
    case 'first-last-to-video':
      if (!img1 || !img2) {
        Toast.error('请在画布中选择第一帧和最后一帧图片');
        return null;
      }
      params = {
        task_type: 'huoshan_video',
        params: {
          model: 'doubao-seedance-1-5-pro-251215',
          content: [
            {
              type: 'text',
              text: formData.description,
            },
            {
              type: 'image_url',
              image_url: {
                url: editor.movie.reURL(img1),
              },
              role: 'first_frame',
            },
            {
              type: 'image_url',
              image_url: {
                url: editor.movie.reURL(img2),
              },
              role: 'last_frame',
            },
          ],
          ratio: formData.size,
          duration: formData.duration,
          fps: 24,
          resolution: formData.clarity,
          // seed: 11,
        },
      };
      break;
    case 'first-to-video':
      if (!img1) {
        Toast.error('请在画布中选择第一帧图片');
        return null;
      }
      params = {
        task_type: 'huoshan_video',
        params: {
          model: 'doubao-seedance-1-5-pro-251215',
          content: [
            {
              type: 'text',
              text: formData.description,
            },
            {
              type: 'image_url',
              image_url: {
                url: editor.movie.reURL(img1),
              },
            },
          ],
          ratio: formData.size,
          duration: formData.duration,
          fps: 24,
          resolution: formData.clarity,
          // seed: 11,
        },
      };
      break;
    case 'image-to-video':
      params = {
        task_type: 'huoshan_video',
        params: {
          model: 'doubao-seedance-1-5-pro-251215',
          content: [
            {
              type: 'text',
              text: formData.description,
            },
            ...formData.urls.map(d => {
              return {
                type: 'image_url',
                image_url: {
                  url: editor.movie.reURL(d),
                },
                // role: 'reference_image',
              };
            }),
          ],
          ratio: formData.size,
          duration: formData.duration,
          fps: 24,
          resolution: formData.clarity,
          // seed: 11,
        },
      };
      break;
    case 'text-to-video':
      params = {
        task_type: 'huoshan_video',
        params: {
          model: 'doubao-seedance-1-5-pro-251215',
          content: [
            {
              type: 'text',
              text: formData.description,
            },
          ],
          ratio: formData.size,
          duration: formData.duration,
          fps: 24,
          resolution: formData.clarity,
          // seed: 11,
        },
      };
      break;
  }
  return params;
}
