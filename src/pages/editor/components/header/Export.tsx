import styles from './export.module.less';
import { observer } from 'mobx-react';
import { SendOne, Check, Write, Diamond } from '@icon-park/react';
import { useEffect, useState, useRef } from 'react';
import { MovieEncoding, utils } from 'video-core-sdk';
import { Form as IForm, Button, Modal, Progress, Spin, Toast, Space } from '@douyinfe/semi-ui';
// import classNames from 'classnames';
import { config } from '@config/index';
import CapturePoster from './CapturePoster';
import { Intl, language } from '@language/index';
import { stores } from '@stores/index';
import { plugins } from '@plugins/index';
import { getMaterialFileUrl } from '@services/localStorageService';
import { pubsub } from '@utils/pubsub';

export interface IProps {}

function Export(props: IProps) {
  const { editor } = stores;
  const Form = IForm as any;
  const [visible, setVisible] = useState(false);
  const me = useRef<any>(null);
  const [initValues, setInitValues] = useState({
    title: '',
    resolution: '720P',
    fps: 30,
    format: 'mp4',
  });
  const formRef = useRef<any>();
  const [mp4URL, setMp4URL] = useState('');
  const [progress, setProgress] = useState<any>({
    start: false,
    sourceLoad: 0,
    encoderAudio: 0,
    encoderVideo: 0,
    totalTime: 0,
  });

  // 本地合成视频
  const encoderVideoLocal = async (values: any) => {
    // 二次点击销毁上一个任务
    if (me.current) {
      clearProgress();
      return;
    }

    setMp4URL('');
    setProgress({ start: true, sourceLoad: 0, encoderAudio: 0, encoderVideo: 0, totalTime: 0 });

    console.log('appdata', editor.data);
    console.time('export');
    me.current = new MovieEncoding({
      workerPath: config.workerPath + '/decode.worker.js',
      EModuleEffectSourcePath: config.EModuleEffectSourcePath,
      resourceHost: config.resourcesHost,
      format: values.format || 'mp4',
      fps: values.fps || 30,
      renderEnv: 'web',
      resolution: values.resolution || '720P',
      getMaterialFileUrl: getMaterialFileUrl,
      plugins: plugins,
      watermark: {
        src: '',
        width: 0,
        height: 0,
        setPosition: () => ({x: 0, y: 0}),
        hide: true,
      },
      movieData: utils.toJS(editor.data),
      initSuccess: () => {
        console.log('initSuccess');
      },
      onReady: async () => {
        await me.current.run();
        // console.timeEnd('run');
      },
      onProgress: v => {
        progress[v.type] = v.progress;
        console.log('onProgress', v);
        setProgress({ ...progress, start: true });
      },
      onError: err => {
        console.error('encoderVideoLocal error', err);
        Toast.error(err);
        clearProgress();
        return;
      },
      onFinish: videoAndAudioRemixURL => {
        // setMp4URL(videoAndAudioRemixURL);
        Toast.success(language.val('export_video_synthesis_success'));
        window.URL.revokeObjectURL(videoAndAudioRemixURL);
        clearProgress();
      },
    });
  };

  const onSubmit = async (values: any) => {
    if (!editor.movie) return;
    // VIP权限检查：1080P和2K需要VIP
    // const vipResolutions = ['1080P', '2K'];
    // if (vipResolutions.includes(values.resolution) && editor.userInfo?.vip_status !== 1) {
    //   pubsub.publish('showVipRecharge');
    //   return;
    // }
    await editor.saveApp();
    values = { ...initValues, ...values, title: editor.data.title };
    // const totalTime = editor.movie.getTotalTime();
    values.appid = editor.appid;
    values.token = editor.token;

    const { title, ...rest } = values;

    // 判断是否是iframe
    const isInIframe = window.self !== window.top;
    if (!isInIframe) {
      encoderVideoLocal(values);
      return;
    }

    // 为了兼容iframe使用了window.open
    if (location.hash) {
      window.open(
        location.href.split('#')[0] + `#/export?params=${JSON.stringify(rest)}`,
        '_blank',
        'width=600,height=400,top=100,left=100,scrollbars=yes',
      );
    } else {
      window.open(
        `/editor/export?params=${JSON.stringify(rest)}`,
        '_blank',
        'width=600,height=400,top=100,left=100,scrollbars=yes',
      );
    }
  };

  const renderInServer = async () => {
    // VIP权限检查：云合成需要VIP
    if (editor.userInfo?.vip_status !== 1) {
      pubsub.publish('showVipRecharge');
      return;
    }
    formRef.current.formApi.validate().then(async (values: any) => {
      values = { ...initValues, ...values, title: editor.data.title };
      const totalTime = editor.movie.getTotalTime();
      values.appid = editor.appid;
      const res = await editor.saveApp();
      if (res) {
        await editor.apiServer.createTask({
          source: 'user_app',
          source_id: editor.appid,
          params: {
            fps: values.fps,
            resolution: values.resolution,
            jsonUrl: editor.movie.reURL(res.url),
          },
        });
        Toast.success(language.val('export_success_info'));
        setTimeout(() => {
          location.href = '/workspace/user/product';
        }, 2000);
      } else {
        Toast.error('Network Error!');
      }
      // await onSubmit(values);
    });
  };

  const clearProgress = () => {
    if (me.current) {
      me.current.destroy();
      me.current = null;
    }
    setProgress({
      start: false,
      sourceLoad: 0,
      encoderAudio: 0,
      encoderVideo: 0,
      totalTime: 0,
    });
  };

  useEffect(() => {
    return () => {
      clearProgress();
    };
  }, []);

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
        <Intl name="header_export" />
      </Button>
      <Modal
        width={500}
        keepDOM={false}
        title={null}
        footer={null}
        visible={visible}
        className={styles.exportModal}
        onCancel={() => {
          setVisible(false);
          clearProgress();
        }}
        maskClosable={false}
      >
        <>
          {/* <div className={styles.times}></div> */}
          {progress.start && (
            <div className={styles.progress}>
              <div>
                <Progress
                  percent={Number((progress.sourceLoad * 0.3 * 100 + progress.encoderVideo * 0.7 * 100).toFixed(0))}
                  showInfo
                  // orbitStroke="#fff"
                  stroke="var(--theme-main)"
                  strokeWidth={4}
                  type="circle"
                  format={per => per + '%'}
                  width={200}
                  style={{ margin: 10 }}
                />
              </div>
              <div>
                <div className={styles.sourceLoad}>
                  {mp4URL ? (
                    <>
                      <p>
                        {language.val('export_video_synthesis_success')}
                        <br />
                        <br />
                        <a className={styles.down} download={initValues.title + '.mp4'} href={mp4URL}>
                          {language.val('export_again_download')}
                        </a>
                      </p>
                    </>
                  ) : (
                    <>
                      {/* <p>{language.val('export_video_synthesis_process')}</p> */}
                      <p>{language.val('export_export_process_tips')}</p>
                    </>
                  )}
                </div>
                <Button
                  onClick={() => {
                    clearProgress();
                  }}
                >
                  终止
                </Button>
              </div>
            </div>
          )}
          <Form
            style={{ display: progress.start ? 'none' : 'block' }}
            initValues={{
              title: editor.data.title,
              ...initValues,
              // times: [0, 20],
            }}
            ref={formRef}
            labelPosition="top"
            labelAlign="left"
            labelWidth={100}
            onSubmit={onSubmit}
          >
            {({ formState }) => (
              <>
                <Form.Slot label={{ text: language.val('export_poster') }}>
                  <CapturePoster />
                </Form.Slot>
                <Form.Input
                  placeholder={language.val('export_title_placeholder')}
                  onChange={e => {
                    editor.data.title = e;
                    editor.updateComponent('header');
                  }}
                  style={{ width: '100%' }}
                  label={language.val('export_title')}
                  field="title"
                ></Form.Input>
                {['mp4'].includes(formState.values.format) && (
                  <>
                    <Form.Select
                      initValue={initValues.resolution}
                      style={{ width: '100%' }}
                      label={language.val('export_size')}
                      field="resolution"
                    >
                      {['480P', '720P', '1080P', '2K', '4k'].map((name: string) => {
                        // const isVip = ['1080P', '2K', '4k'].includes(name);
                        return (
                          <Form.Select.Option key={name} value={name}>
                            {name}
                            {/* {isVip && (
                              <Diamond
                                theme="two-tone"
                                size="12"
                                fill={['#f8e71c', '#f5a623']}
                                strokeWidth={3}
                                style={{ marginLeft: 4, verticalAlign: 'middle' }}
                              />
                            )} */}
                          </Form.Select.Option>
                        );
                      })}
                    </Form.Select>
                    <Form.Select
                      initValue={initValues.fps}
                      style={{ width: '100%' }}
                      label={language.val('export_fps')}
                      field="fps"
                    >
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
                <Form.Select
                  style={{ width: '100%' }}
                  label={language.val('export_format')}
                  labelWidth={'100%'}
                  field="format"
                  onChange={(e: string) => {
                    setInitValues({ ...initValues, format: e });
                  }}
                >
                  <Form.Select.Option value={'mp4'}>MP4</Form.Select.Option>
                  <Form.Select.Option value={'mp3'}>MP3</Form.Select.Option>
                  {/* <Form.Select.Option value={'webm'}>WEBM</Form.Select.Option> */}
                </Form.Select>
                {/* <Form.Slider min={0} max={20} label="编码区间" field="times" range /> */}
                <div className={styles.submit}>
                  {/* <Button theme="light" type="primary" block={true} onClick={renderInServer}>
                    <Intl name="export_cloud_button" />
                    <Diamond
                      theme="two-tone"
                      size="12"
                      fill={['#f8e71c', '#f5a623']}
                      strokeWidth={3}
                      style={{ marginLeft: 4, verticalAlign: 'middle' }}
                    />
                  </Button> */}
                  <Button style={{ width: '100%' }} theme="solid" type="primary" block={true} htmlType="submit">
                    <Intl name="export_button" />
                    <i className={styles.free}>Free</i>
                  </Button>
                </div>
              </>
            )}
          </Form>
        </>
      </Modal>
    </>
  );
}

export default observer(Export);
