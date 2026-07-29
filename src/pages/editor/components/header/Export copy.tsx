import styles from './export.module.less';
import { observer } from 'mobx-react';
import { SendOne, Check, Write } from '@icon-park/react';
import { useEffect, useState, useRef } from 'react';
import { MovieEncoding, utils } from 'video-core-sdk';
import { Form as IForm, Button, Modal, Progress, Spin, Toast } from '@douyinfe/semi-ui';
// import classNames from 'classnames';
import { config } from '@config/index';
import CapturePoster from './CapturePoster';
import { stores } from '@stores/index';

export interface IProps {}

function Export(props: IProps) {
  const { editor } = stores;
  const Form = IForm as any;
  const [visible, setVisible] = useState(false);
  const me = useRef<any>();

  const [mp4URL, setMp4URL] = useState('');
  const [step, setStep] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [initValues, setInitValues] = useState({
    resolution: '720P',
    fps: 30,
    format: 'mp4',
    gifFps: 10,
    gifSpeed: 1,
    gifWidth: 300,
    gifTimes: [0, 10],
  });
  const totalResource = useRef(1);
  const [progress, setProgress] = useState<{
    eachSourceName: string;
    eachSourceLoad: number;
    sourceLoad: number;
    encoderAudio: number;
    encoderVideo: number;
  }>({
    eachSourceLoad: 0,
    eachSourceName: '',
    sourceLoad: 0,
    encoderAudio: 0,
    encoderVideo: 0,
  });

  const onSubmit = (values: any) => {
    values = { ...initValues, ...values };
    console.log(values, initValues);
    const totalTime = editor.movie.getTotalTime();
    values.gifTimes[1] = totalTime;
    setInitValues({ ...values });
    setMp4URL('');
    setProgress({
      eachSourceLoad: 0,
      eachSourceName: '',
      sourceLoad: 0,
      encoderAudio: 0,
      encoderVideo: 0,
    });
    if (me.current) {
      me.current.destroy();
      me.current = null;
    }
    setTotalTime(totalTime);
    me.current = new MovieEncoding({
      // id: 'Stats-output',
      gifWorkerPath: config.workerPath + '/gif.worker.js',
      workerPath: config.workerPath + '/decode.worker.js',
      ...values,
      resourceHost: editor.resourcesHost,
      plugins: editor.pluginsConfig,
      movieData: utils.toJS(editor.data),
      times: values.format === 'gif' ? values.gifTimes : undefined,
      initSuccess: () => {
        setStep(1);
      },
      onReady: async () => {
        // 判断是否有缓存数据
        // if (await me.current.getCacheIndexDBData()) {
        //   Toast.warning('浏览器发生过意外关闭，将从上次任务继续导出');
        // }
        console.log('onReady=---->', values);

        if (values.format === 'mp4') {
          await me.current.run();
        }

        if (values.format === 'mp3') {
          const audioURL = await me.current.encoderAudio();
          // console.log('audioURL', audioURL);
          me.current.downURL(audioURL, `${values.name || +new Date()}.mp3`);
        }
        if (values.format === 'gif') {
          // 合成gif
          const gifURL = await me.current.encoderGIF({
            gifWidth: values.gifWidth,
            gifFps: values.gifFps,
            gifTimes: values.gifTimes,
            gifSpeed: values.gifSpeed,
          });
          setMp4URL(gifURL);
          me.current.downURL(gifURL, `${values.name || +new Date()}.gif`);
        }
        // console.timeEnd('run');
      },
      onEachSourceProgress: n => {
        // console.log('当前加载--->', n);
        totalResource.current = n.total;
        progress.eachSourceLoad = n.p;
        progress.eachSourceName = n.src.split('/').pop();
        setProgress({ ...progress });
      },
      onProgress: v => {
        // console.log(v);
        // setMp4URL(url);
        if (values.format === 'mp3' && v.type === 'encoderAudio' && v.progress === 1) {
          // 音频合成over
          setTimeout(() => {
            setMp4URL(me.current.remixAudioURL);
          }, 1000);
        }
        progress[v.type] = v.progress;
        setProgress({ ...progress });
      },
      onFinish: url => {
        console.log('finish', url);
        setMp4URL(url);
        // let a = document.createElement('a');
        // a.style.display = 'none';
        // a.href = videoAndAudioRemixURL;
        // a.download = 'davinci.mp4';
        // document.body.appendChild(a);
        // a.click();
        // window.URL.revokeObjectURL(videoAndAudioRemixURL);
      },
    });
  };

  useEffect(() => {
    return () => {
      if (me.current) {
        me.current.destroy();
        me.current = null;
      }
    };
  }, []);

  const stopEncoder = async () => {
    setStep(0);

    await utils.sleep(1000);

    if (me.current) {
      me.current.destroy();
      me.current = null;
    }
    setProgress({
      eachSourceLoad: 0,
      eachSourceName: '',
      sourceLoad: 0,
      encoderAudio: 0,
      encoderVideo: 0,
    });
    setMp4URL('');
  };

  // console.log('initValues', initValues);

  return (
    <>
      <Button
        onClick={() => setVisible(true)}
        theme="solid"
        type="primary"
        className={styles.exportBtn}
        icon={<SendOne theme="filled" size="20" fill="#fff" />}
      >
        导出
      </Button>
      <Modal
        width={500}
        keepDOM={false}
        title={null}
        footer={null}
        visible={visible}
        className={styles.exportModal}
        onCancel={() => {
          stopEncoder();
          setVisible(false);
        }}
        maskClosable={false}
      >
        {step === 1 && (
          <>
            {(() => {
              let p = 0;

              if (progress.sourceLoad !== 1) {
                p = progress.sourceLoad * 0.3 + (0.3 / totalResource.current) * progress.eachSourceLoad;
              } else {
                if (initValues.format === 'mp3') {
                  p = Math.min(progress.encoderAudio, 1);
                } else if (initValues.format === 'mp4') {
                  p = Math.min(progress.encoderAudio, progress.encoderVideo, 1);
                } else if (initValues.format === 'gif') {
                  p = Math.min(progress.encoderVideo, 1);
                }
                p = p * 0.7 + 0.3;
              }

              return (
                <div className={styles.infos}>
                  <span className={styles.name}>
                    合成视频{' '}
                    <a className={styles.stopButton} onClick={stopEncoder}>
                      终止合成
                    </a>
                  </span>
                  <span className={styles.progress}>
                    <Progress
                      width={200}
                      showInfo
                      key={step}
                      type="circle"
                      percent={mp4URL ? 100 : ~~(p * 99)}
                      format={per => {
                        if (per === 100) {
                          return <Check theme="filled" size="60" fill="var(--semi-color-success)" />;
                        }
                        return (
                          <span>
                            {per}
                            <i style={{ fontSize: 18 }}>%</i>
                          </span>
                        );
                      }}
                      style={{ margin: 10, fontSize: 60, fontWeight: 'bolder' }}
                    />
                  </span>
                  {progress.sourceLoad !== 1 ? (
                    <span className={styles.sourceLoad}>
                      加载资源 {progress.eachSourceName}({~~(progress.eachSourceLoad * 100)}%)
                    </span>
                  ) : (
                    <span className={styles.sourceLoad}>
                      {mp4URL ? (
                        <>
                          <p>
                            视频已下载到指定目录 <br />
                            <a className={styles.down} download={editor.data.title + '.mp4'} href={mp4URL}>
                              再次下载
                            </a>
                          </p>
                        </>
                      ) : (
                        '视频合成中...'
                      )}
                    </span>
                  )}
                </div>
              );
            })()}
          </>
        )}
        {step === 0 && (
          <>
            {/* <div className={styles.times}></div> */}
            <Form
              initValues={{
                name: editor.data.title,
                ...initValues,
                // times: [0, 20],
              }}
              labelPosition="top"
              labelAlign="left"
              labelWidth={100}
              onSubmit={onSubmit}
            >
              {({ formState }) => (
                <>
                  <Form.Slot label={{ text: '视频封面' }}>
                    <CapturePoster />
                  </Form.Slot>
                  <Form.Input
                    placeholder="请输入视频名称"
                    onChange={e => {
                      editor.data.title = e;
                      editor.updateComponent('header');
                    }}
                    style={{ width: '100%' }}
                    label="视频名称"
                    field="name"
                  ></Form.Input>
                  {formState.values.format === 'mp4' && (
                    <>
                      <Form.Select
                        initValue={initValues.resolution}
                        style={{ width: '100%' }}
                        label="分辨率"
                        field="resolution"
                      >
                        {['480P', '720P', '1080P', '2K', '4K'].map((name: string) => {
                          return (
                            <Form.Select.Option key={name} value={name}>
                              {name}
                            </Form.Select.Option>
                          );
                        })}
                      </Form.Select>
                      <Form.Select initValue={initValues.fps} style={{ width: '100%' }} label="帧率" field="fps">
                        {[24, 25, 30, 50, 60].map((name: number) => {
                          return (
                            <Form.Select.Option key={name} value={name}>
                              {name}
                            </Form.Select.Option>
                          );
                        })}
                      </Form.Select>
                    </>
                  )}
                  {formState.values.format === 'gif' && (
                    <>
                      <Form.InputNumber
                        suffix="px"
                        initValue={initValues.gifWidth}
                        hideButtons={true}
                        style={{ width: '100%' }}
                        label="画布宽度"
                        field="gifWidth"
                      />
                      <Form.Slider
                        min={0}
                        max={editor.movie.getTotalTime()}
                        range
                        step={0.1}
                        initValue={[...initValues.gifTimes]}
                        style={{ width: '92%', marginLeft: 10 }}
                        labelWidth={'100%'}
                        label={`时间:${(formState.values.gifTimes || [])
                          .map(d => {
                            let dot = String(d).split('.')[1];
                            if (dot) {
                              dot = '.' + dot;
                            } else {
                              dot = '';
                            }
                            return utils.secToTime(d, 'mm:ss') + dot;
                          })
                          .join('-')}`}
                        field="gifTimes"
                      />
                      <Form.Select initValue={initValues.gifFps} style={{ width: '100%' }} label="帧率" field="gifFps">
                        {[5, 10, 15, 20, 30].map((name: number) => {
                          return (
                            <Form.Select.Option key={name} value={name}>
                              {name}
                            </Form.Select.Option>
                          );
                        })}
                      </Form.Select>
                      <Form.Select
                        initValue={initValues.gifSpeed}
                        style={{ width: '100%' }}
                        label="速度"
                        field="gifSpeed"
                      >
                        {[0.5, 1, 1.2, 1.5, 2, 4].map((name: number) => {
                          return (
                            <Form.Select.Option key={name} value={name}>
                              {name}x
                            </Form.Select.Option>
                          );
                        })}
                      </Form.Select>
                    </>
                  )}
                  <Form.Select
                    style={{ width: '100%' }}
                    label="导出格式"
                    field="format"
                    onChange={(e: string) => {
                      if (e === 'gif') {
                        const totalTime = editor.movie.getTotalTime();
                        initValues.gifTimes[1] = totalTime;
                      }
                      setInitValues({ ...initValues, format: e });
                    }}
                  >
                    <Form.Select.Option value={'mp4'}>MP4</Form.Select.Option>
                    <Form.Select.Option value={'mp3'}>MP3</Form.Select.Option>
                    <Form.Select.Option value={'gif'}>GIF</Form.Select.Option>
                  </Form.Select>
                  {/* <Form.Slider min={0} max={20} label="编码区间" field="times" range /> */}
                  <div className={styles.submit}>
                    <Button theme="solid" type="primary" block={true} htmlType="submit">
                      开始合成
                    </Button>
                  </div>
                </>
              )}
            </Form>
          </>
        )}
      </Modal>
    </>
  );
}

export default observer(Export);
