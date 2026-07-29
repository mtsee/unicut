import { Button, Space } from '@douyinfe/semi-ui';
import { useHistory } from 'react-router';
import { util } from '@utils/index';

type Props = {
  editor: any;
};

const Custom = (props: Props) => {
  const { editor } = props;
  const history = useHistory();
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <Space>
        <Button
          onClick={() => {
            const totalTime = editor.movie.getTotalTime();
            alert(totalTime);
          }}
        >
          视频时长
        </Button>
        <Button
          onClick={async () => {
            // 创建一个图片元素
            console.log('editor', editor);
            const resource = {
              id: 'WXTbV1Vu5i',
              name: 'lemons-986304.jpg',
              type: 'image',
              url: 'https://cdn.jme-aigc.com/video/uploads/1/20251230/930365516326305792.svg',
              originId: '656104432542244864',
              thumb: '/video/materials/images/lemons-986304_thumb.jpg',
              styleSize: {
                width: 215,
                height: 570,
              },
              noAudioTracks: true,
              fileType: 'image',
              from: 'system',
              mustFetch: true,
              duration: null,
              attrs: {
                width: 215,
                height: 570,
              },
            };
            const elementData = await editor.movie.addElementByResource(resource as any, {
              time: editor.currentTime,
              trackIndex: 0.5,
              elementType: 'image',
              duration: util.timeToNum(10),
            });
            // 选中元素
            editor.setContorlAndSelectedElemenent([elementData.id]);
            editor.updateTimeline();
          }}
        >
          添加图片
        </Button>
        <Button
          onClick={async () => {
            try {
              const resource = {
                id: '01K627EEQZCCXQM064W6Q9W4TK',
                originId: '01K627EEQZCCXQM064W6Q9W4TK',
                from: 'user',
                mustFetch: true,
                name: 'video',
                type: 'video',
                fileType: 'video',
                url: 'https://h5ds-cdn.oss-cn-beijing.aliyuncs.com/98444f35-4628-4d50-82bb-531b97ead37a.mp4',
                thumb:
                  'https://static-jiemo-dev.wanjiedata.com/asset/20251211/47bdfabb-b026-57be-80e1-fbc66f23de2f.png',
                duration: 5,
                styleSize: { width: 720, height: 1264 },
                noAudioTracks: false,
                attrs: { width: 720, height: 1264, duration: 5 },
              };

              resource.duration = util.timeToNum(resource.duration);
              const elementData = await editor.movie.addElementByResource(resource as any, {
                time: editor.currentTime,
                trackIndex: 0.5,
                elementType: resource.type,
                duration: resource.duration,
              });
              editor.setContorlAndSelectedElemenent([elementData.id]);
              editor.updateTimeline();
            } catch (error) {
              console.error('导入媒体失败:', error);
            }
          }}
        >
          添加视频
        </Button>
        <Button
          onClick={() => {
            history.push('/upload');
          }}
        >
          upload
        </Button>
      </Space>
    </div>
  );
};

export default Custom;
