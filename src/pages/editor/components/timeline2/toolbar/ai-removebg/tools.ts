import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';
import { util } from '@utils/index';
import { utils } from 'video-core-sdk';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

/**
 * 1、解码视频
 * 2、对每帧进行抠图
 * 3、编码成新的视频
 */

export interface Options {
  onReady: (d: any) => void;
  onProgress: (v: number) => void;
  onSuccess: (d: any) => void;
}

export class RemoveBgVideo {
  private _resourceURL: string = '';
  private _videoWorker: any = null;
  private _duration: number = 0;
  private _canvas: HTMLCanvasElement = null;
  private _video: HTMLVideoElement = null;
  private _ctx: CanvasRenderingContext2D = null;
  private _imageSegmenter: any = null;
  private _offscreen: any = null;
  //   private _tempCanvas: any = null;
  private _frameIndex: number = 0;
  private _muxer: any = 0;
  private _encoder: VideoEncoder = null;
  private _endMark: boolean = false;
  private _targetBuffer: any = null;
  private _bitmap: any = null;
  private _mediaInfo: any = null;
  private _fps: number = 30;
  private _options: Options = null;
  private _noAudioTracks: boolean = false;

  constructor(url: string, options: Options) {
    this._resourceURL = url;
    this._options = options;
  }

  get fps() {
    return this._fps;
  }

  destroy = () => {
    if (this._options) {
      this._options = null;
    }

    if (this._encoder) {
      // this._encoder.close();
      this._encoder = null;
    }

    if (this._video) {
      this._video.remove();
      this._video = null;
    }

    if (this._bitmap) {
      this._bitmap = null;
    }

    if (this._targetBuffer) {
      this._targetBuffer = null;
    }

    if (this._videoWorker) {
      this._videoWorker.terminate();
      this._videoWorker = null;
    }
    if (this._canvas) {
      this._canvas.remove();
      this._canvas.width = 0;
      this._canvas.height = 0;
      this._canvas = null;
    }
    if (this._muxer) {
      this._muxer = null;
    }
    if (this._mediaInfo) {
      this._mediaInfo = null;
    }
    if (this._imageSegmenter) {
      this._imageSegmenter.close();
      this._imageSegmenter = null;
    }
    if (this._offscreen) {
      this._offscreen.width = 0;
      this._offscreen.height = 0;
      this._offscreen = null;
    }
  };

  private _startDecodeFrame: boolean;
  decodeTime = async (time: number) => {
    this._startDecodeFrame = true;
    this._videoWorker.postMessage({
      type: 'decodeFrameByTime',
      time,
      // time: utils.toNum(relativeTime + element.clipTime, 3),
      relativeTime: time,
      duration: this._duration,
    });
    while (this._startDecodeFrame) {
      await utils.sleep(1000 / 60);
    }
    return this._endMark;
  };

  callbackForVideo = async result => {
    this._ctx.drawImage(this._bitmap, 0, 0, this._bitmap.width, this._bitmap.height);
    let imageData = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height).data;
    const mask: Number[] = result.categoryMask.getAsFloat32Array();
    let j = 0;
    let backgroundLabelIndex = 0;
    for (let i = 0; i < mask.length; ++i) {
      // 如果是背景，保留原图像素；否则设置为透明或其他颜色
      const maskVal = Math.round(Number(mask[i]) * 255.0);
      if (maskVal !== backgroundLabelIndex) {
        // 保留背景（不修改 imageData）
        j += 4;
      } else {
        // 设置前景为绿色（或其他颜色）
        imageData[j] = 0; // R
        imageData[j + 1] = 255; // G
        imageData[j + 2] = 0; // B
        imageData[j + 3] = 255; // A (0 = 完全透明)
        j += 4;
      }
    }
    const uint8Array = new Uint8ClampedArray(imageData.buffer);
    const dataNew = new ImageData(uint8Array, this._canvas.width, this._canvas.height);
    this._ctx.putImageData(dataNew, 0, 0);

    // 将处理后的帧编码回视频
    // const timestamp = (this._frameIndex / 30) * 1000_000;
    const processedFrame = new VideoFrame(this._canvas, {
      timestamp: utils.toNum((this._frameIndex / this._fps) * 1000_000, 0),
    });
    // 关键帧
    const keyFrame = this._frameIndex % 25 === 0;
    this._encoder.encode(processedFrame, { keyFrame });
    // if (this._muxer) {
    //    this._muxer.addFrame(processedFrame);
    // }
    processedFrame.close();

    await this._encoder.flush(); // 清空缓冲区数据
  };

  public async fetchFileBuffer(url: String) {
    return await fetch(url as any).then(async response => {
      let buffer = await response.arrayBuffer();
      return buffer;
    });
  }

  /**
   * 创建编码器
   */
  createMuxer = async () => {
    this._targetBuffer = new ArrayBufferTarget();
    this._muxer = new Muxer({
      target: this._targetBuffer,
      video: {
        codec: 'avc', // 'avc' | 'hevc' | 'vp9' | 'av1',
        frameRate: utils.toNum(this._fps),
        width: this._video.videoWidth,
        height: this._video.videoHeight,
        // bitrate: 1_000_000,
      },
      audio: !this._noAudioTracks
        ? {
            codec: 'aac', // opus
            numberOfChannels: 2,
            sampleRate: 128_000,
          }
        : undefined,
      fastStart: 'in-memory', // 'in-memory', false  ArrayBufferTarget 的时候使用 'in-memory'
      firstTimestampBehavior: 'offset',
    });
    this._encoder = new VideoEncoder({
      output: (chunk: EncodedVideoChunk, meta: any) => {
        if (this._endMark) return;
        this._muxer.addVideoChunk(chunk, meta);
      },
      error: e => {
        console.log(e.message);
      },
    });
    this._encoder.configure({
      codec: 'avc1.420034', // 'avc1.420034', // avc1.42001f 的编码级别比较低，没法编码2K视频  avc1.420034
      width: this._video.videoWidth,
      height: this._video.videoHeight,
    });

    if (!this._noAudioTracks) {
      const u8Arr = await this.fetchFileBuffer(this._video.src);
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(u8Arr);

      // 解码音频合成
      const audioEncoder = new AudioEncoder({
        output: (chunk, meta) => this._muxer.addAudioChunk(chunk, meta),
        error: e => console.error(e),
      });
      audioEncoder.configure({
        codec: 'mp4a.40.2',
        numberOfChannels: 1,
        sampleRate: audioBuffer.sampleRate,
        bitrate: 128_000,
      });
      var audiodata = new AudioData({
        format: 'f32',
        sampleRate: audioBuffer.sampleRate,
        data: audioBuffer.getChannelData(0),
        numberOfChannels: 1,
        numberOfFrames: ~~(audioBuffer.sampleRate * audioBuffer.duration),
        timestamp: ~~(audioBuffer.duration * 100000),
      });
      audioEncoder.encode(audiodata);
      await audioEncoder.flush();
    }
  };

  /**
   * 创建Ai推理
   */
  createImageSegmenter = async () => {
    const wasm = await FilesetResolver.forVisionTasks('/assets/ai/wasm');
    this._imageSegmenter = await ImageSegmenter.createFromOptions(wasm, {
      baseOptions: {
        // modelAssetPath: `/assets/ai/removebg/selfie_segmenter.tflite`,  // 模型比较粗糙
        // modelAssetPath: `/assets/ai/removebg/hair_segmenter.tflite`,  // 头发
        modelAssetPath: `/assets/ai/removebg/selfie_multiclass_256x256.tflite`,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    });
    console.log('labels', this._imageSegmenter.getLabels());
  };

  /**
   * 创建worker
   * @param workerPath
   */
  createWorder = async (workerPath: string, reURL: any) => {
    // const blobURL = editor.movie.resourceManage.getBlobURLBySourceId(this._resourceId);
    this._video = (await utils.mediaLazy(reURL(this._resourceURL))) as HTMLVideoElement;
    this._duration = this._video.duration;
    this._canvas = document.createElement('canvas');
    this._canvas.width = this._video.videoWidth;
    this._canvas.height = this._video.videoHeight;
    this._ctx = this._canvas.getContext('2d');

    // this._tempCanvas = document.createElement('canvas');
    // this._tempCanvas.width = this._video.videoWidth;
    // this._tempCanvas.height = this._video.videoHeight;

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.id = 'offscreenCanvas';
    offscreenCanvas.width = this._video.videoWidth;
    offscreenCanvas.height = this._video.videoHeight;
    offscreenCanvas.style.background = '#000';

    // document.getElementById('testDiv').innerHTML = '';
    // document.getElementById('testDiv').append(this._canvas);

    this._offscreen = offscreenCanvas.transferControlToOffscreen();
    this._videoWorker = new Worker(workerPath ? workerPath : '/worker/decode.worker.js');
    this._videoWorker.onmessage = async (event: any) => {
      if (event.data.type === 'ready') {
        // ready
      } else if (event.data.type === 'decodeMP4DemuxerSuccess') {
        console.log('准备好了!');
      } else if (event.data.type === 'draw') {
        // 模拟异步绘制，canvas 更新了
        this._bitmap = event.data.data.bitmap;
        this._frameIndex = event.data.data.frameIndex;
        const frameCount = Number(this._mediaInfo.FrameCount);
        // console.log(utils.toNum((this._frameIndex / frameCount) * 100, 1) + '%');
        this._imageSegmenter.segmentForVideo(this._bitmap, performance.now(), this.callbackForVideo);
        let num = this._frameIndex / frameCount;
        if (num > 1) {
          num = 1;
        }
        this._options.onProgress(utils.toNum(num * 100, 2));
      } else if (event.data.type === 'end') {
        if (this._endMark) return;
        this._muxer.finalize();
        this._endMark = true;
        setTimeout(() => {
          const blob = new Blob([this._targetBuffer.buffer], { type: 'video/mp4' });
          this._options.onSuccess(blob);
        }, 300);
      }
      this._startDecodeFrame = false;
    };
    const res = (await utils.mediaInfo(this._resourceURL)) as any;
    const noAudioTracks = !res.media.track.find((d: any) => d['@type'] === 'Audio');
    const videoTrack = res.media.track.find((d: any) => d['@type'] === 'Video');
    this._mediaInfo = videoTrack;
    this._noAudioTracks = noAudioTracks;
    this._fps = Number(this._mediaInfo.FrameRate);
    this._options.onReady({
      fps: this._fps,
      mediaInfo: videoTrack,
      rotation: Number(videoTrack.Rotation) || 0,
      noAudioTracks: noAudioTracks,
    });
    this._videoWorker.postMessage(
      {
        canvas: this._offscreen, // offscreen 或者 canvas对象
        type: 'initDecodeVideo',
        options: {
          url: this._resourceURL,
          returnBitmap: true,
          rotation: Number(videoTrack.Rotation) || 0,
          noAudioTracks: noAudioTracks,
          clipTime: 0,
          elementId: this._resourceURL,
          aspectRatio: this._video.videoWidth / this._video.videoHeight,
        },
      },
      [this._offscreen],
    );
  };
}
