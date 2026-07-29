importScripts('./demuxer.worker.js');
// importScripts('./webm-demuxer.umd.js');

/**
 * 解码指定的视频，返回帧用于绘制到画布上
  eg:
   const canvas = document.createElement('canvas');
   canvas.width = width;
   canvas.height = height;
   const ctx = canvas.getContext('2d');
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
  // console.log('收到消息????', e.data);

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
  const { url, startTime = 0, duration, noAudioTracks, aspectRatio = 1, frameScale = 1, videoRotation = 0 } = options;
  const frameHeight = options.frameHeight * frameScale;
  const frameWidth = frameHeight * aspectRatio;

  self.frames = {};
  self.canvas = canvas;
  // 绘制帧图完成
  const decoderFrameEnd = debounce(() => {
    self.drawIndex = 0;
    self.frameIndex = 0;
    // self.canvas.height = frameHeight.toFixed(0);
    // self.canvas.width = frameWidth.toFixed(0);
    self.canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 }).then(res => {
      self.postMessage({
        type: 'drawFrameImageSuccess',
        data: { url: URL.createObjectURL(res), rotate: self.rotate, noAudioTracks },
      });
    });
  }, 500);

  // 创建 OffscreenCanvas
  const offscreenCanvas = new OffscreenCanvas(frameHeight, frameWidth);
  const offscreenCtx = offscreenCanvas.getContext('2d');

  let stepFrameDraw = options.stepFrameDraw;
  self.stepFrameDrawMark = !!options.stepFrameDraw;

  self.decoder = new VideoDecoder({
    output: async frame => {
      // 绘制, 每间隔stepFrameDraw帧绘制一次
      if (self.frameIndex % stepFrameDraw === 0) {
        console.log('self.rotate--->', self.rotate, videoRotation);

        let rotatedFrame = frame;
        if (self.rotate) {
          // 旋转帧图像
          offscreenCtx.save();
          offscreenCtx.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2);
          offscreenCtx.rotate((videoRotation * Math.PI) / 180);
          offscreenCtx.drawImage(frame, -frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight);
          offscreenCtx.restore();
          // 将旋转后的帧图像转换为 ImageBitmap
          rotatedFrame = await createImageBitmap(offscreenCanvas);
        }
        // 绘制帧图
        if (self.stepFrameDrawMark) {
          if (!options.drawRectangle) {
            self.ctx.drawImage(rotatedFrame, self.drawIndex * frameWidth, 0, frameWidth, frameHeight);
          } else {
            // 绘制到正方形画布上, self.cavnasSizeSqrt 为正方形画布每行绘制的帧图数量
            const dIndex = self.drawIndex % self.cavnasSizeSqrt;
            self.ctx.drawImage(
              rotatedFrame,
              dIndex * frameWidth,
              Math.floor(self.drawIndex / self.cavnasSizeSqrt) * frameHeight,
              frameWidth,
              frameHeight,
            );
          }
        } else {
          self.ctx.drawImage(rotatedFrame, self.drawIndex * frameWidth, 0, frameWidth, frameHeight);
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
      console.log('开始解码22222', JSON.parse(JSON.stringify(config)), url);

      if (!config.error) {
        // 部分AI视频因为信息不全获取不到duration
        config.movie_duration = duration;
        if (['hev', 'hvc'].includes(config.codec.substring(0, 3))) {
          // h265不做处理
          console.log(config.codec);
        } else {
          // h264使用avc1.420034解码器
          config.codec = 'avc1.420034';
        }
        if (duration) {
          config.movie_duration = duration * config.movie_timescale;
        }
        // 以默认30fps计算视频时长
        if (!config.movie_duration) {
          config.movie_duration = (config.nb_samples / 30) * config.movie_timescale;
        }
        // 脏数据纠正
        if (!config.hasAudio) {
          self.noAudioTracks = true;
        } else if (isNaN(config.hasAudio.bitrate)) {
          self.noAudioTracks = true;
        } else if (!config.hasAudio.duration) {
          self.noAudioTracks = true;
        }
        if (self.noAudioTracks) {
          config.hasAudio = false;
        }

        // config.codec = 'avc1.420034'; // avc1.42001f 的编码级别比较低，没法编码2K视频
        decoder.configure(config);
        // 'avc1.420034', // right  420034 和 42001f 都可以用
        self.totalFrame = config.nb_samples - 2; // 假设有4帧误差
        // self.duration = config.movie_duration / config.movie_timescale;
        self.duration = duration;
        // 定义变量
        // self.noAudioTracks = !config.hasAudio;
        // if (config.volume !== 0 && config.hasAudio?.duration) {
        //   self.noAudioTracks = true;
        // }
        // self.noAudioTracks = noAudioTracks;

        // 旋转的判断依据是误差不能超过0.5
        const rote = Number((config.codedWidth / config.codedHeight).toFixed(1)) - Number(aspectRatio.toFixed(1));
        self.rotate = Math.abs(rote) > 0.5 ? true : false;
        self.fps = Math.ceil(self.totalFrame / self.duration);
        // 默认每隔1秒绘制一次帧
        if (!stepFrameDraw) {
          stepFrameDraw = self.fps;
        }

        // self.canvas.width = Math.ceil(self.totalFrame / stepFrameDraw) * frameWidth;
        // 如果options.stepFrameDraw存在，帧图从左往右，从上往下依次绘制，画布的宽高一样

        if (!self.stepFrameDrawMark) {
          self.canvas.width = self.duration * frameWidth;
          self.canvas.height = frameHeight;
        } else {
          // self.totalFrame张帧图绘制到正方形画布上
          if (options.drawRectangle) {
            const sqrt = Math.ceil(Math.sqrt(Math.ceil(self.totalFrame / stepFrameDraw)));
            self.cavnasSizeSqrt = sqrt;
            self.canvas.width = sqrt * frameWidth;
            self.canvas.height = sqrt * frameHeight;
          } else {
            self.canvas.width = Math.ceil(self.totalFrame / stepFrameDraw) * frameWidth;
            self.canvas.height = frameHeight;
          }
        }

        self.ctx = self.canvas.getContext('2d');
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
      self.decoder.decode(chunk);
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
  const { time, duration, relativeTime, webm } = data;

  
  // 时间转化成帧（time 可能为 0，不能用 truthy 判断）
  const frameIndex = time !== undefined ? Math.floor((time / self.duration) * self.totalFrame) : 0;
  
  self.decodeFrameByTimeFrameIndex = frameIndex;

  if (!self.frames) {
    console.error('解码time失败，worker已经回收', time, self.elementId);
    postMessage({ type: 'end' });
    return;
  }

  // 等待帧解码就绪，否则 frameIndex 为 0 时帧可能还未解码导致空白
//   while (self.frames && !self.frames[frameIndex]) {
//     await sleep(8);
//   }

  // 绘制帧
  const frame = self.frames[frameIndex];

  // 重复的帧不用重复绘制，直接截图即可
  if (frame && self.hasDrawFrameIndex !== frameIndex && self.canvas) {
    // 如果传入了canvas，就直接绘制到canvas上面
    self.ctx.drawImage(frame, 0, 0, self.canvas.width, self.canvas.height);
    // 记录绘制过的帧
    self.hasDrawFrameIndex = frameIndex;
  }

  // 首图强制渲染，避免出现丢帧的情况
  if (frameIndex < 1) {
    await self.canvas.convertToBlob({ type: 'image/png' });
    //   const blobUrl = URL.createObjectURL(blob);
    //   console.log('drawxxxxxxxx', self.hasDrawFrameIndex, frameIndex, blobUrl);
  }
  postMessage({
    type: 'draw',
    data: { frameIndex: frameIndex, bitmap: self.returnBitmap ? self.canvas.transferToImageBitmap() : null },
  });

  // 时间超出全部清空
  if (relativeTime > duration) {
    console.log('超出时间了');
    removeFrameAll();
  } else {
    // 清空帧之前的数据（removeFrame 只删 index 小于传入值的帧）
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

function getFPS(mediaInfo) {
  const videoStream = mediaInfo.streams.find(stream => stream.codec_type_string === 'video');

  let fps = 30;
  if (videoStream && videoStream.r_frame_rate) {
    const [numerator, denominator] = videoStream.r_frame_rate.split('/').map(Number);
    if (denominator && denominator > 0) {
      fps = numerator / denominator;
    }
  } else if (videoStream && videoStream.avg_frame_rate) {
    const [numerator, denominator] = videoStream.avg_frame_rate.split('/').map(Number);
    if (denominator && denominator > 0) {
      fps = numerator / denominator;
    }
  }
  return fps;
}

async function waittingFrame() {
  while (self.waittingFrameLock) {
    await sleep(8);
  }
  return true;
}

/**
 * 准备解码视频，从clipTime开始解码
 * url: 解码视频的url
 * clipTime: 解码开始时间
 * aspectRatio: 浏览器中视频的宽高比
 * @param {*} params { url, clipTime, aspectRatio }
 */
function initDecodeVideo(params, canvas) {
  const {
    url,
    clipTime = 0,
    duration = 0,
    aspectRatio = 1,
    rotation = 0,
    noAudioTracks,
    elementId,
    returnBitmap,
    webm = false,
  } = params;
  // console.log('initDecodeVideo----->', params);
  self.noAudioTracks = noAudioTracks;
  self.elementId = elementId;
  self.returnBitmap = returnBitmap;
  self.frames = {};
  self.frameIndex = 0;
  self.hasDrawFrameIndex = -1;
  if (canvas) {
    self.canvas = canvas;
    self.ctx = canvas.getContext('2d', { alpha: true });
  }

  if (webm) {
    fetch(url)
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP 错误！状态：${response.status}`);
        }
        const blob = await response.blob();
        const fileName = 'video.webm';
        const selectedFile = new File([blob], fileName, { type: blob.type });
        return selectedFile;
      })
      .then(async buffer => {
        self.demuxer = new WebDemuxer({
          wasmFilePath: location.origin + '/worker/web-demuxer.wasm', // 你的有效 wasm 路径
        });
        await self.demuxer.load(buffer);
        const mediaInfo = await demuxer.getMediaInfo();
        const fps = getFPS(mediaInfo);
        const videoDecoderConfig = await self.demuxer.getDecoderConfig('video');

        let firstDot = null;
        self.decoder = new VideoDecoder({
          output: frame => {
            self.ctx.clearRect(0, 0, canvas.width, canvas.height);
            const scale = Math.min(self.canvas.width / frame.displayWidth, self.canvas.height / frame.displayHeight);
            self.ctx.drawImage(frame, 0, 0, frame.displayWidth * scale, frame.displayHeight * scale);

            // 获取0 0 位置的像素数据
            if (!firstDot) {
              const imageData1 = ctx.getImageData(0, 0, 1, 1);
              firstDot = imageData1.data;
              // console.log('0 0 位置像素数据', firstDot);
            }
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const ex = 20;
            for (let i = 0; i < data.length; i += 4) {
              // console.log('data', data[i]);
              if (data[i] < firstDot[0] + ex && data[i + 1] < firstDot[1] + ex && data[i + 2] < firstDot[2] + ex) {
                data[i + 3] = 0; // 设置 alpha 通道为 0，即透明
              }
            }
            ctx.putImageData(imageData, 0, 0);

            frame.close();
            postMessage({
              type: 'draw',
              data: {
                frameIndex: self.decodeFrameByTimeFrameIndex,
                bitmap: self.returnBitmap ? self.canvas.transferToImageBitmap() : null,
              },
            });
          },
          error: e => {
            console.error('video decoder error:', e);
          },
        });
        self.decoder.configure(videoDecoderConfig);

        self.totalFrame = fps * mediaInfo.duration; // 假设有4帧误差
        self.duration = mediaInfo.duration;
        // 定义变量
        self.noAudioTracks = true;
        self.startFrameIndex = 0;
        self.rotate = false;
        console.log('self.totalFrame准备好了？？？', self.totalFrame);
        postMessage({ type: 'decodeMP4DemuxerSuccess' });

        // 准备解码视频
        self.waittingFrameLock = true;
        const reader = demuxer.read('video', 0, mediaInfo.duration).getReader();
        reader.read().then(async function processPacket({ done, value }) {
          if (done) {
            decoder.flush();
            // loop();
            console.log('read finished');
            return;
          }
          await waittingFrame();
          // await sleep(10);
          decoder.decode(value);
          const val = reader.read().then(processPacket);
          self.waittingFrameLock = true;
          return val;
        });

        loop();
      });
  } else {
    /**
     * 每次最多解码大概10帧左右，只有销毁了才会继续往后解码
     */
    self.decoder = new VideoDecoder({
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
        console.log('MP4Demuxer->config', url, params, { ...config });
        if (!config.error) {
          if (['hev', 'hvc'].includes(config.codec.substring(0, 3))) {
            // h265不做处理
            console.log(config.codec);
          } else {
            // h264使用avc1.420034解码器
            config.codec = 'avc1.420034';
          }
          self.decoder.configure(config);
          if (duration) {
            config.movie_duration = duration * config.movie_timescale;
          }
          // 以默认30fps计算视频时长
          if (!config.movie_duration) {
            config.movie_duration = (config.nb_samples / 30) * config.movie_timescale;
          }
          self.totalFrame = config.nb_samples - 2; // 假设有4帧误差
          self.duration = config.movie_duration / config.movie_timescale;
          // 定义变量
          self.noAudioTracks = noAudioTracks;
          console.log('计算startFrameIndex', clipTime, self.duration, self.totalFrame);
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
        self.decoder.decode(chunk);
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
