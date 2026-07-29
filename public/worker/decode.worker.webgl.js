importScripts('./demuxer.worker.js');
importScripts('./webgl2d.js');

/**
 * 解码指定的视频，返回帧用于绘制到画布上
  eg:
   const canvas = document.createElement('canvas');
   canvas.width = width;
   canvas.height = height;
   const ctx = canvas.getContext('2d');
   // const ctx = new WebGL2D(canvas);
   const offscreen = (canvas as any).transferControlToOffscreen();

   // 创建worker
   const dv = new Worker('./worker/decode.worker.js');

   // 准备解码
   dv.postMessage({
    canvas: offscreen, // offscreen 或者 canvas对象
    type: 'initDecodeVideo',
    options: {url: 'https://xxx.com/mp4', clipTime: 0 }
  }, [offscreen]); // canvas的所有权转移给Worker，相当于是共享canvas，避免重复创建实例

   // 准备OK会触发ready
   function readyFun() {
      // 准备就绪后就要开始解码帧
      for(let i = 0; i < 10; i+=0.1) {
        dv.postMessage({type: 'decodeFrameByTime', time: i });
        // 每次调用decodeFrameByTime都会触发 draw 事件，触发draw之后会开始绘制帧图
      }
   }

   // 事件 ready 准备就绪  draw 去绘制
   dv.onmessage = async (event) => {
       switch(event.data.type) {
          case 'ready':
            console.log('准备就绪，是否有音频：', event.data.noAudioTracks);
            readyFun();
            break;
          case 'draw':
            console.log('绘制帧到canvas了');
            const {frameIndex} = event.data;
            break;
          case 'end':
            console.log('绘制&解码已经结束');
            break;
       }
 *  }
 *
 */
// Listen for the start request.
self.addEventListener('message', e => {
  switch (e.data.type) {
    case 'initDecodeVideo': // 准备解码视频
      //  options: {url, clipTime}
      initDecodeVideo(e.data.options, e.data.canvas);
      break;
    case 'decodeFrameByTime': // 解码指定时间的帧，解码成功后会触发 draw 事件，把frame返回给画布
      decodeFrameByTime(e.data);
      break;
    case 'decodeFrameImage': // 将视频解码成指定的每隔1s的帧图
      // options: { frameWidth, frameHeight, maxCanvasSize }
      decodeFrameImage(e.data.options, e.data.canvas);
      break;
    case 'destroy': // 销毁
      for (const i in self.frames) {
        if (self.frames[i]) {
          self.frames[i].close();
          delete self.frames[i];
        }
      }
      self.frames = null;
      // 删除自定义的变量
      delete self.frames;
      delete self.frameIndex;
      delete self.hasDrawFrameIndex;
      delete self.noAudioTracks;
      delete self.startFrameIndex;
      if (self.canvas) {
        delete self.canvas; // 外部去处理canvas.remove()
        delete self.ctx;
      }
      break;
  }
});

/**
 * 解码视频，返回时间轴的帧图
 * @param {*} options { url, canvas, frameHeight, aspectRatio}
 * frameHeight 单帧高度
 * aspectRatio 浏览器中视频的宽高比
 */
function decodeFrameImage(options, canvas) {
  const { url, startTime = 0, noAudioTracks, aspectRatio = 1, frameScale = 1, videoRotation = 0 } = options;
  const frameHeight = options.frameHeight * frameScale;
  const frameWidth = frameHeight * aspectRatio;
  self.frames = {};
  self.canvas = canvas;
  // 绘制帧图完成
  const decoderFrameEnd = debounce(() => {
    self.drawIndex = 0;
    self.frameIndex = 0;
    self.canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 }).then(res => {
      self.postMessage({
        type: 'drawFrameImageSuccess',
        data: { url: URL.createObjectURL(res), rotate: self.rotate, noAudioTracks },
      });
    });
  }, 500);

  // 创建 OffscreenCanvas
  const offscreenCanvas = new OffscreenCanvas(frameHeight, frameWidth);
  // const offscreenCtx = offscreenCanvas.getContext('2d');
  const offscreenCtx = new WebGL2D(offscreenCanvas);

  const decoder = new VideoDecoder({
    output: async frame => {
      // 绘制
      if (self.frameIndex % self.fps === 0) {
        console.log('self.rotate--->', self.rotate, videoRotation);

        if (self.rotate) {
          // 旋转帧图像
          offscreenCtx.save();
          offscreenCtx.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2);
          offscreenCtx.rotate((videoRotation * Math.PI) / 180);
          offscreenCtx.drawImage(frame, -frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight);
          offscreenCtx.restore();
          // 将旋转后的帧图像转换为 ImageBitmap
          const rotatedFrame = await createImageBitmap(offscreenCanvas);
          self.ctx.drawImage(rotatedFrame, self.drawIndex * frameWidth, 0, frameWidth, frameHeight);
        } else {
          self.ctx.drawImage(frame, self.drawIndex * frameWidth, 0, frameWidth, frameHeight);
        }

        self.drawIndex++;
      }
      self.frames[self.frameIndex] = frame;
      self.frameIndex++;
      frame.close();
      // output是连续的，加个防抖函数判断解码是否完成
      decoderFrameEnd();
    },
    error(e) {
      // setStatus('decode', e);
      console.error('decode error:', e);
      postMessage({ type: 'end' });
    },
  });

  // 此方法会将视频全部fetch下来，所以该方法只能在预览模式下使用
  new MP4Demuxer(url, {
    onConfig: config => {
      console.log('开始解码2', config, url);
      if (!config.error) {
        if (['hev', 'hvc'].includes(config.codec.substring(0, 3))) {
          // h265不做处理
          console.log(config.codec);
        } else {
          // h264使用avc1.420034解码器
          config.codec = 'avc1.420034';
          // config.codec = 'avc1.420034';
        }
        // config.codec = 'avc1.420034'; // avc1.42001f 的编码级别比较低，没法编码2K视频
        decoder.configure(config);
        // 'avc1.420034', // right  420034 和 42001f 都可以用
        self.totalFrame = config.nb_samples - 2; // 假设有4帧误差
        self.duration = config.movie_duration / config.movie_timescale;
        // 定义变量
        // self.noAudioTracks = !config.hasAudio;
        // if (config.volume !== 0 && config.hasAudio?.duration) {
        //   self.noAudioTracks = true;
        // }
        self.noAudioTracks = noAudioTracks;
        self.startFrameIndex = Math.floor((startTime / self.duration) * self.totalFrame);
        // 旋转的判断依据是误差不能超过0.5
        const rote = Number((config.codedWidth / config.codedHeight).toFixed(1)) - Number(aspectRatio.toFixed(1));
        self.rotate = Math.abs(rote) > 0.5 ? true : false;
        self.fps = Math.ceil(self.totalFrame / self.duration);
        self.canvas.width = self.duration * frameWidth;
        self.canvas.height = frameHeight;
        // self.ctx = self.canvas.getContext('2d');
        self.ctx = new WebGL2D(self.canvas);
        self.drawIndex = 0;
        self.frameIndex = 0;
        // 解码准备工作完成
        postMessage({
          type: 'drawFrameImageBefore',
          data: {
            noAudioTracks: self.noAudioTracks,
            totalFrame: self.totalFrame,
            duration: self.duration,
            startFrameIndex: self.startFrameIndex,
            rotate: self.rotate,
            frameScale,
          },
        });
      } else {
        console.error('不支持的编码格式', config);
        postMessage({ type: 'end' });
      }
    },
    onChunk: chunk => {
      decoder.decode(chunk);
    },
    setStatus: (_type, msg) => {
      console.log('msg', _type, msg);
    },
  });
}

// 移除index之前的帧
function removeFrame(index) {
  for (let i in self.frames) {
    if (self.frames[i] !== undefined && Number(i) < index) {
      self.frames[i].close();
      delete self.frames[i];
    }
  }
}

function removeFrameAll() {
  for (let i in self.frames) {
    if (self.frames[i] !== undefined) {
      self.frames[i].close();
    }
    delete self.frames[i];
  }
}

// 只执行一次
async function decodeClipTime() {
  if (!self.decodeClipTimeLock) {
    self.decodeClipTimeLock = true;
    // close clipTime部分的帧
    // console.log('******************', self.elementId, self.startFrameIndex, Object.keys(self.frames));
    // 首次需要解码到startFrameIndex这个下标
    while (!self.frames[self.startFrameIndex]) {
      removeFrame(Math.max(self.startFrameIndex, 0));
      await sleep(8);
    }
  }
}

/**
 * 解码指定时间的帧
 * @param {*} frameIndex
 */
async function decodeFrameByTime(data) {
  const { time, duration, relativeTime } = data;
  // console.log('decodeFrameByTime>', self.elementId, relativeTime);
  // 时间转化成帧
  const frameIndex = time ? Math.floor((time / self.duration) * self.totalFrame) : 0;
  // console.log(
  //   '------------------------------->',
  //   self.elementId,
  //   'time:' + time,
  //   'duration:' + duration,
  //   'relativeTime:' + relativeTime,
  //   'frameIndex:' + frameIndex,
  //   Object.keys(self.frames),
  // );
  if (!self.frames) {
    console.error('解码time失败，worker已经回收', time, self.elementId);
    postMessage({ type: 'end' });
    return;
  }

  // 绘制帧
  const frame = self.frames[frameIndex];

  // 重复的帧不用重复绘制，直接截图即可
  if (frame && self.hasDrawFrameIndex !== frameIndex && self.canvas) {
    // 如果传入了canvas，就直接绘制到canvas上面
    self.ctx.drawImage(frame, 0, 0, self.canvas.width, self.canvas.height);
    // 记录绘制过的帧
    self.hasDrawFrameIndex = frameIndex;
  }
  postMessage({
    type: 'draw',
    data: { frameIndex, bitmap: self.returnBitmap ? self.canvas.transferToImageBitmap() : null },
  });

  // 时间超出全部清空
  if (relativeTime > duration) {
    console.log('超出时间了');
    removeFrameAll();
  } else {
    // 清空帧之前的数据
    removeFrame(frameIndex);
  }

  // 解码完成，这里判断是最后一帧绘制完成后判定为解码完成，
  // 实际操作中可能不需要解码到最后一帧，这时候需要调用destroy去手动销毁
  // 手动销毁： dv.postMessage({type: 'destroy' });
  if (frameIndex >= self.totalFrame) {
    removeFrameAll();
    self.frames = {};
    postMessage({ type: 'end' });
  }
}

/**
 * 清理画布
 */
function clearCanvas() {
  self.ctx.fillStyle = 'rgba(0,0,0,1)';
  self.ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
}

/**
 * 准备解码视频，从clipTime开始解码
 * url: 解码视频的url
 * clipTime: 解码开始时间
 * aspectRatio: 浏览器中视频的宽高比
 * @param {*} params { url, clipTime, aspectRatio }
 */
function initDecodeVideo(params, canvas) {
  const { url, clipTime = 0, aspectRatio = 1, rotation = 0, noAudioTracks, elementId, returnBitmap } = params;
  // console.log('初始化----->', params);
  self.noAudioTracks = noAudioTracks;
  self.elementId = elementId;
  self.returnBitmap = returnBitmap;
  self.frames = {};
  self.frameIndex = 0;
  self.hasDrawFrameIndex = -1;
  if (canvas) {
    self.canvas = canvas;
    // self.ctx = canvas.getContext('2d');
    self.ctx = new WebGL2D(self.canvas);
  }

  /**
   * 每次最多解码大概10帧左右，只有销毁了才会继续往后解码
   */
  const decoder = new VideoDecoder({
    output: frame => {
      self.frames[self.frameIndex] = frame;
      self.frameIndex++;
      // console.log('jm->', self.elementId, self.frameIndex, Object.keys(self.frames));
    },
    error(e) {
      console.error('decode', e, params);
      // setStatus('decode', e);
    },
  });

  // 此方法会将视频全部fetch下来，所以该方法只能在预览模式下使用
  new MP4Demuxer(url, {
    onConfig: config => {
      // config.codec = 'avc1.420034';
      console.log('MP4Demuxer->config', { ...config });
      if (!config.error) {
        if (['hev', 'hvc'].includes(config.codec.substring(0, 3))) {
          // h265不做处理
          console.log(config.codec);
        } else {
          // h264使用avc1.420034解码器
          config.codec = 'avc1.420034';
        }
        decoder.configure(config);
        self.totalFrame = config.nb_samples - 2; // 假设有4帧误差
        self.duration = config.movie_duration / config.movie_timescale;
        // 定义变量
        self.noAudioTracks = noAudioTracks;
        self.startFrameIndex = Math.floor((clipTime / self.duration) * self.totalFrame);
        // self.rotate = config.codedWidth / config.codedHeight !== aspectRatio;
        // const rote = Number((config.codedWidth / config.codedHeight).toFixed(1)) - Number(aspectRatio.toFixed(1));
        // self.rotate = Math.abs(rote) > 0.5 ? true : false;
        self.rotate = rotation % 360 === 0 ? false : true;
        if (rotation) {
          // 旋转90度
          const scalex = self.canvas.width / self.canvas.height;
          self.ctx.translate(self.canvas.width / 2, self.canvas.height / 2);
          self.ctx.scale(scalex, self.canvas.height / self.canvas.width);
          self.ctx.rotate((rotation * Math.PI) / 180);
          self.ctx.translate(-self.canvas.width / 2, -self.canvas.height / 2);
        }
        console.log('开始解码？？？？？', self.rotate, config, self.startFrameIndex);
        postMessage({ type: 'decodeMP4DemuxerSuccess' });
      } else {
        console.error('不支持的编码格式', config);
        postMessage({ type: 'end' });
      }
    },
    onChunk: chunk => {
      decoder.decode(chunk);
    },
    setStatus: async (_type, msg) => {
      console.log(_type, msg);
      if (msg === 'Ready') {
        // 解码准备工作完成
        await decodeClipTime();
        console.log('解码准备工作完成', self);
        postMessage({
          type: 'ready',
          data: {
            noAudioTracks: self.noAudioTracks,
            totalFrame: self.totalFrame,
            duration: self.duration,
            startFrameIndex: self.startFrameIndex,
            rotate: self.rotate,
          },
        });
      }
    },
  });
}

function debounce(fn, delay) {
  let timer = null;
  // 所以这个函数就可以使用...运算符收集js自动添加的参数到一个数组中
  return function _debounce(...arg) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      // 通过apply绑定this和传递参数，apply第二个参数正好是传数组嘛
      fn.apply(this, arg);
    }, delay);
  };
}

function sleep(t) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}
