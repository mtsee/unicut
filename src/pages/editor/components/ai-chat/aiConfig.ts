import { Toast } from '@douyinfe/semi-ui';
import { stores } from '@stores/index';
import { util } from '@utils/index';

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
