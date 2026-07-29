import styles from './styles.module.less';
import { useCallback, useState } from 'react';
import { observer } from 'mobx-react';
import { Button, InputNumber, Space, Upload, Toast, Modal } from '@douyinfe/semi-ui';
import { language } from '@language/language';
import JSZip from 'jszip';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export interface IProps {}

/**
 * AI 人像分割
 * @param props
 * @returns
 */
function PictureSplit(props: IProps) {
  const [imgURL, setImgURL] = useState('');
  const [key, setKey] = useState(1);
  const [num, setNum] = useState({
    x: 3,
    y: 3,
    padding: 0,
  });
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState<Crop | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [croppedImage, setCroppedImage] = useState('');

  const getBase64 = file => {
    return new Promise(resolve => {
      var reader = new FileReader();
      reader.onload = function (e) {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  };

  const splitAndDownload = useCallback(async () => {
    if (!imgURL) {
      Toast.error('请先上传图片');
      return;
    }

    setLoading(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgURL;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const scale = img.naturalWidth / 1000;

      const padding = num.padding * scale;
      const pieceWidth = Math.floor((img.width - padding * (num.x + 1)) / num.x);
      const pieceHeight = Math.floor((img.height - padding * (num.y + 1)) / num.y);

      canvas.width = pieceWidth;
      canvas.height = pieceHeight;

      const zip = new JSZip();
      const imgFolder = zip.folder('split_images');

      for (let row = 0; row < num.y; row++) {
        for (let col = 0; col < num.x; col++) {
          ctx.clearRect(0, 0, pieceWidth, pieceHeight);

          const sx = padding + col * (pieceWidth + padding);
          const sy = padding + row * (pieceHeight + padding);

          ctx.drawImage(img, sx, sy, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);

          const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
          });

          const index = row * num.x + col + 1;
          imgFolder.file(`image_${index}.png`, blob as Blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'split_images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      Toast.success('图片分割完成，已开始下载');
    } catch (error) {
      console.error('分割图片失败:', error);
      Toast.error('分割图片失败');
    } finally {
      setLoading(false);
    }
  }, [imgURL, num.x, num.y, num.padding]);

  const handleCropChange = useCallback((crop: any) => {
    setCrop(crop);
  }, []);

  const handleCropComplete = useCallback(
    async (crop: any) => {
      if (!crop || !imgURL) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgURL;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const scale = img.naturalWidth / 1000;
      canvas.width = crop.width * scale;
      canvas.height = crop.height * scale;

      ctx.drawImage(
        img,
        crop.x * scale,
        crop.y * scale,
        crop.width * scale,
        crop.height * scale,
        0,
        0,
        crop.width * scale,
        crop.height * scale,
      );

      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCroppedImage(url);
        }
      }, 'image/png');
    },
    [imgURL],
  );

  const downloadCroppedImage = useCallback(() => {
    if (!croppedImage) {
      Toast.error('请先完成裁剪');
      return;
    }

    const link = document.createElement('a');
    link.href = croppedImage;
    link.download = 'cropped_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(croppedImage);
  }, [croppedImage]);

  return (
    <div className={styles.body}>
      <Upload
        action="/"
        accept=".gif, .png, .jpeg, .jpg"
        showUploadList={false}
        beforeUpload={obj => {
          getBase64(obj.file.fileInstance).then(res => {
            setKey(+new Date());
            setImgURL(res as string);
          });
          return true;
        }}
        customRequest={() => {}}
        draggable={true}
        style={{ height: 200 }}
        dragMainText={language.val('ai_upload_tip')}
        dragSubText={language.val('ai_upload_sub_tip', {
          format: 'PNG/GIF/JPG',
        })}
      ></Upload>
      <div className={styles.tools}>
        <Space>
          <InputNumber
            style={{ width: 120 }}
            value={num.x}
            onChange={value => {
              setNum({ ...num, x: Number(value) });
            }}
            min={1}
            max={20}
            step={1}
          />
          <span style={{ color: 'var(--theme-text)' }}>x</span>
          <InputNumber
            style={{ width: 120 }}
            value={num.y}
            onChange={value => {
              setNum({ ...num, y: Number(value) });
            }}
            min={1}
            max={20}
            step={1}
          />
          <span style={{ color: 'var(--theme-text)' }}>padding:</span>
          <InputNumber
            style={{ width: 120 }}
            value={num.padding}
            onChange={value => {
              setNum({ ...num, padding: Number(value) });
            }}
            min={0}
            max={100}
            step={1}
            suffix="px"
          />
          <Button onClick={splitAndDownload} loading={loading}>
            分割图片
          </Button>
          <Button onClick={() => setShowCrop(true)} disabled={!imgURL}>
            自由裁剪
          </Button>
        </Space>
      </div>
      {!!imgURL && (
        <div className={styles.videoBox}>
          {Array(num.x * num.y)
            .fill(1)
            .map((_, i) => {
              const row = Math.floor(i / num.x);
              const col = i % num.x;
              const padding = num.padding;
              return (
                <span
                  className={styles.span}
                  style={{
                    width: `calc((100% - ${padding * (num.x + 1)}px) / ${num.x})`,
                    height: `calc((100% - ${padding * (num.y + 1)}px) / ${num.y})`,
                    top: `calc(${padding}px + ${row} * (100% - ${padding * (num.y + 1)}px) / ${num.y} + ${row} * ${padding}px)`,
                    left: `calc(${padding}px + ${col} * (100% - ${padding * (num.x + 1)}px) / ${num.x} + ${col} * ${padding}px)`,
                  }}
                  key={i}
                >
                  {/* {i + 1} */}
                </span>
              );
            })}
          <img style={{ width: '100%' }} src={imgURL} alt="" />
        </div>
      )}
      <Modal title="自由裁剪" visible={showCrop} onCancel={() => setShowCrop(false)} footer={null} width={1100}>
        {imgURL && (
          <div style={{ paddingBottom: 20, textAlign: 'center' }}>
            <ReactCrop crop={crop} onChange={handleCropChange} onComplete={handleCropComplete} keepSelection>
              <img style={{ width: 1000 }} src={imgURL} alt="" />
            </ReactCrop>
            {croppedImage && (
              <Button onClick={downloadCroppedImage} style={{ marginTop: 10 }}>
                下载裁剪图片
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default observer(PictureSplit);
