import styles from './recordAudio.module.less';
import Recorder from 'js-audio-recorder';
import { useEffect, useMemo, useState, useRef, useReducer } from 'react';
import AudioItem from '../audio/AudioItem';
import { theme } from '@theme';
import { Voice, PauseOne, Redo, CheckSmall } from '@icon-park/react';
import { utils } from 'video-core-sdk';
import { Space, Button, Toast } from '@douyinfe/semi-ui';
import { util } from '@utils/index';
import { getUploadBeforeData } from '@pages/editor/tools/uploadBeforeData';
import { addImageVideoAudioItem } from '../addItem';
import { language } from '@language/language';
import { config } from '@config/index';
import { stores } from '@stores/index';

const lamejs = (window as any).lamejs;

export interface IProps {
  addItem: (item: any) => void;
  onCancel: () => void;
}

export default function RecordAudioBox(props: IProps) {
  const { editor } = stores;
  const ref = useRef<HTMLCanvasElement>();
  const drawWaveRef = useRef<() => void>();
  const [status, setStatus] = useState(0); // 0 准备，1录制中，2 暂停 3 完成
  const animationLockRef = useRef(false);
  const [restartKey, setRestartKey] = useState(1);
  const [audioInfo, setAudioInfo] = useState(null);
  const [dur, setDur] = useState(0);

  const recorder = useMemo(() => {
    return new Recorder();
  }, [restartKey]);

  const recorderEnd = () => {
    const wavBlob = recorder.getWAV();
    // MP3
    const mp3bolb = convertWavToMp3(wavBlob);
    const url = URL.createObjectURL(mp3bolb);

    setAudioInfo({
      id: utils.createID(),
      name: `${+new Date()}.mp3`,
      attrs: { duration: recorder.duration },
      urls: { url: url },
    });
  };

  useEffect(() => {
    const cav = ref.current;
    const ctx = ref.current.getContext('2d');

    const tm = theme.getTheme();
    let anim = null;

    const fillStyle = tm === 'dark' ? 'rgb(53, 54, 60)' : 'rgb(255,255,255)';
    const strokeStyle = tm === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';

    recorder.onprogress = d => {
      setDur(~~d.duration);
    };

    drawWaveRef.current = () => {
      if (animationLockRef.current) return;
      anim = requestAnimationFrame(drawWaveRef.current);
      let dataArray = recorder.getRecordAnalyseData(),
        bufferLength = dataArray.length;

      // 填充背景色
      ctx.fillStyle = '#0a0c13';
      ctx.fillRect(0, 0, cav.width, cav.height);

      ctx.fillStyle = fillStyle;
      // 设定波形绘制颜色
      ctx.lineWidth = 1;
      ctx.strokeStyle = strokeStyle;

      ctx.beginPath();

      let sliceWidth = (cav.width * 1.0) / bufferLength, // 一个点占多少位置，共有bufferLength个点要绘制
        x = 0; // 绘制点的x轴位置

      for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
        let y = (v * cav.height) / 2;
        if (i === 0) {
          // 第一个点
          ctx.moveTo(x, y);
        } else {
          // 剩余的点
          ctx.lineTo(x, y);
        }
        // 依次平移，绘制所有点
        x += sliceWidth;
      }
      ctx.lineTo(cav.width, cav.height / 2);
      ctx.stroke();
    };

    return () => {
      recorder.destroy();
      cancelAnimationFrame(anim);
    };
  }, [recorder]);

  return (
    <div className={styles.content}>
      <div className={styles.times}>{utils.secToTime(dur, 'hh:mm:ss')}</div>
      <canvas width={256} height={60} ref={ref}></canvas>
      <Space className={styles.btns}>
        {status === 0 && (
          <a
            onClick={() => {
              recorder.start();
              animationLockRef.current = false;
              drawWaveRef.current();
              setStatus(1);
            }}
          >
            <Voice theme="outline" size="40" fill="var(--theme-icon)" />
          </a>
        )}
        {status === 1 && (
          <a
            onClick={() => {
              recorder.pause();
              animationLockRef.current = true;
              setStatus(2);
            }}
          >
            <PauseOne theme="outline" size="40" fill="var(--theme-icon)" />
          </a>
        )}
        {status === 2 && (
          <a
            onClick={() => {
              recorder.start();
              animationLockRef.current = false;
              drawWaveRef.current();
              setStatus(1);
            }}
          >
            <Voice theme="outline" size="40" fill="var(--theme-icon)" />
          </a>
        )}
        {status === 3 && (
          <a
            onClick={() => {
              setRestartKey(+new Date());
              setAudioInfo(null);
              setStatus(0);
              setDur(0);
            }}
          >
            <Redo theme="outline" size="40" fill="var(--theme-icon)" />
          </a>
        )}
        {status !== 0 && status !== 3 && (
          <a
            onClick={() => {
              recorder.stop();
              animationLockRef.current = true;
              setStatus(3);
              // 获取音波数
              recorderEnd();
            }}
          >
            {/* <CheckSmall theme="outline" size="30" fill="var(--theme-icon)" /> */}
            完成
          </a>
        )}
      </Space>
      <div className={styles.result}>
        {/* {id, name, attrs: {duration}, urls: {url }} */}
        {audioInfo && (
          <>
            <AudioItem item={{ ...audioInfo }} />
            <div style={{ marginTop: 20 }}>
              <Button
                block
                theme="solid"
                onClick={async () => {
                  const formdata = new FormData();
                  const wavBlob = recorder.getWAV();
                  const mp3bolb = convertWavToMp3(wavBlob);
                  const name = `${util.formatDate(new Date(), 'YYYYMMDDHHmmss')}.mp3`;
                  formdata.append('file', mp3bolb, name);
                  const [res] = await editor.apiServer.formUpdate(formdata);
                  const info = await getUploadBeforeData({
                    url: editor.movie.reURL(res.storage_path),
                    type: 'audio',
                    workerPath: config.workerPath,
                    uploadBase64: editor.apiServer.uploadBase64,
                    file: null,
                    reURL: editor.movie.reURL,
                  });
                  // console.log('info=========>', info, res.storage_path);
                  // 添加素材
                  // 保存到素材库
                  const [item, err] = await editor.apiServer.createUserMaterial({
                    name: name,
                    app_id: editor.appid,
                    urls: { url: res.storage_path },
                    attrs: { duration: info.duration, wave: info.wave },
                  });
                  props.addItem(item);
                  await addImageVideoAudioItem(item);
                  Toast.success(language.val('source_record_success'));
                  // 插入到轨道>
                  props.onCancel();
                }}
              >
                上传
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function convertWavToMp3(wavDataView) {
  const wav = lamejs.WavHeader.readHeader(wavDataView);
  const samples = new Int16Array(wavDataView.buffer, wav.dataOffset, wav.dataLen / 2);
  const { channels, sampleRate } = wav;
  const buffer = [];
  const mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128);
  let remaining = samples.length;
  const maxSamples = 1152;
  for (let i = 0; remaining >= maxSamples; i += maxSamples) {
    const mono = samples.subarray(i, i + maxSamples);
    const mp3buf = mp3enc.encodeBuffer(mono);
    if (mp3buf.length > 0) {
      buffer.push(new Int8Array(mp3buf));
    }
    remaining -= maxSamples;
  }
  const d = mp3enc.flush();
  if (d.length > 0) {
    buffer.push(new Int8Array(d));
  }
  return new Blob(buffer, { type: 'audio/mp3' });
}
