import styles from './cropUpload.module.less';
import React, { useEffect, useState } from 'react';
import { Avatar, Upload, Toast, Modal, Slider } from '@douyinfe/semi-ui';
import { user } from '@stores/user';
import { getUrl } from '@utils/getUrl';
import server from './server';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop/types';
import { util } from '@utils/index';

const CropUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [boxScale, setBoxScale] = useState(1);
  const [cropArea, setCropArea] = useState<Area>();
  const boxSize = { width: 550, height: 400 };

  const uploadChange = async file => {
    const url = URL.createObjectURL(file.currentFile.fileInstance);
    const _img = await util.imgLazy(url);
    const scale = Math.max(_img.naturalWidth / boxSize.width, _img.naturalHeight / boxSize.height, 1);
    console.log('ssssssss', _img.naturalWidth, _img.naturalHeight);
    setBoxScale(scale);
    setSelectedImage(url);
  };

  const beforeUpload = ({ file }) => {
    const { fileInstance } = file;
    const isJpgOrPng =
      fileInstance.type === 'image/jpeg' || fileInstance.type === 'image/png' || fileInstance.type === 'image/jpg';
    if (!isJpgOrPng) {
      Toast.error('只能上传png/jpeg/jpg格式');
    }
    return isJpgOrPng;
  };

  const getBase64 = () => {
    return new Promise(resolve => {
      const image = new Image();
      image.src = selectedImage;
      image.onload = () => {
        // 图片最大宽度高度不能超过200px
        const maxSize = 200;
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(cropArea.width, maxSize);
        canvas.height = Math.min(cropArea.height, maxSize);
        const ctx = canvas.getContext('2d');

        // 设置背景颜色为白色
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(
          image,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          canvas.width,
          canvas.height,
        );
        const base64Image = canvas.toDataURL('image/png');
        resolve(base64Image);
      };
    });
  };

  const uploadCropImage = async () => {
    const croppedImage = await getBase64();
    const [uploadRes, uploadErr] = await server.uploadBase64({ content: croppedImage });

    if (uploadErr) {
      Toast.success('头像上传失败');
      return;
    }

    const [updateRes, updateErr] = await server.accountUpdate({
      avatar: uploadRes.storage_path,
    });

    if (updateErr) {
      Toast.success('头像更新失败');
      return;
    }

    user.info.avatar = uploadRes.storage_path;
    Toast.success('头像修改成功');
    setSelectedImage(null);
  };

  return (
    <div className={styles.cropUpload}>
      <Upload
        name="avatar"
        action="/api/v1/common/upload/form"
        customRequest={() => {}}
        headers={{
          Authorization: user.token,
        }}
        onChange={uploadChange}
        showUploadList={false}
        beforeUpload={beforeUpload}
        accept=".png,.jpg,.jpeg,.gif,.svg"
      >
        <div className={styles.avatarContent}>
          <Avatar size="extra-large" src={user.info.avatar ? getUrl(user.info.avatar) : ''} />
        </div>
      </Upload>
      <Modal
        width={600}
        closable={false}
        visible={!!selectedImage}
        onCancel={() => setSelectedImage(null)}
        onOk={uploadCropImage}
      >
        <div
          style={{
            width: boxSize.width,
            height: boxSize.height,
            overflow: 'hidden',
          }}
        >
          <div
            className={styles.cropBox}
            style={{
              width: boxSize.width * boxScale,
              height: boxSize.height * boxScale,
              transform: `scale(${1 / boxScale})`,
            }}
          >
            <Cropper
              key={Number(!!selectedImage)}
              image={selectedImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              minZoom={1}
              maxZoom={5}
              cropSize={{ width: 200 * boxScale, height: 200 * boxScale }}
              restrictPosition={true}
              cropShape="round"
              onCropChange={setCrop}
              onCropComplete={(croppedArea: Area, croppedAreaPixels: Area) => {
                //croppedArea百分比单位 croppedAreaPixels像素为单位
                setCropArea(croppedAreaPixels);
              }}
              onZoomChange={setZoom}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CropUpload;
