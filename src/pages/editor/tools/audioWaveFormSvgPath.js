//@ts-nocheck
/**
 * MIT
 * https://github.com/antonKalinin/audio-waveform-svg-path
 * @param response
 * @returns
 */
// Base64 to Blob
export function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');

  if (!arr[1]) {
    return false;
  }

  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function parseArrayBufferResponse(response) {
  if (!response.ok) {
    throw new Error(`${response.status} (${response.statusText})`);
  }

  return response.arrayBuffer();
}

export default class AudioSVGWaveform {
  constructor({ url, buffer, maxWidth }) {
    this.url = url || null;
    this.audioBuffer = buffer || null;
    this.context = new AudioContext();
    this.maxWidth = maxWidth || 10000;
  }

  set _url(u) {
    this.url = u;
  }

  _getPeaks(channelData, peaks, channelNumber) {
    const peaksCount = this.audioBuffer.duration * 50; // 每秒抽样100次，原来是6000次
    const sampleSize = this.audioBuffer.length / peaksCount;
    const sampleStep = ~~(sampleSize / 10) || 1;
    const mergedPeaks = Array.isArray(peaks) ? peaks : [];

    for (let peakNumber = 0; peakNumber < peaksCount; peakNumber++) {
      const start = ~~(peakNumber * sampleSize);
      const end = ~~(start + sampleSize);
      let min = channelData[0];
      let max = channelData[0];

      for (let sampleIndex = start; sampleIndex < end; sampleIndex += sampleStep) {
        const value = channelData[sampleIndex];

        if (value > max) {
          max = value;
        }
        if (value < min) {
          min = value;
        }
      }

      if (channelNumber === 0 || max > mergedPeaks[2 * peakNumber]) {
        mergedPeaks[2 * peakNumber] = max;
      }

      if (channelNumber === 0 || min < mergedPeaks[2 * peakNumber + 1]) {
        mergedPeaks[2 * peakNumber + 1] = min;
      }
    }

    return mergedPeaks;
  }
  /**
   * @return {String} path of SVG path element
   */
  _svgPath(peaks) {
    const totalPeaks = peaks.length;
    let d = '';
    // "for" is used for faster iteration
    for (let peakNumber = 0; peakNumber < totalPeaks; peakNumber++) {
      if (peakNumber % 2 === 0) {
        d += ` M${~~(peakNumber / 2)}, ${peaks.shift()}`;
      } else {
        d += ` L${~~(peakNumber / 2)}, ${peaks.shift()}`;
      }
    }
    return d;
  }

  splitAndAverage(arr, n) {
    if (n <= 0) {
      return [];
    }
    const result = [];
    for (let i = 0; i < arr.length; i += n) {
      const subArray = arr.slice(i, i + n);
      if (subArray.length > 0) {
        result.push(Math.max(...subArray));
      }
    }
    return result;
  }

  // 获取到音频图片，通过svg转图片
  async images(width, speed, peakin) {
    const maxWidth = this.maxWidth;
    const canvasNum = Math.ceil(width / maxWidth);
    const canvas = document.createElement('canvas');
    const height = 20;
    canvas.width = Math.min(width, maxWidth);
    canvas.height = height;

    const peaks = peakin ? peakin : this.getPeaks();

    const needNum = Math.ceil(width / speed);
    const arr = this.distributeNumbers(peaks, needNum).map(d => {
      return Math.max(...d, 0);
    });

    if (canvasNum > 1) {
      canvas.width = maxWidth;
    }

    const ctx = canvas.getContext('2d');
    const centerY = height / 2;
    const samplesPerCanvas = Math.ceil(arr.length / canvasNum);

    const imgs = [];

    for (let k = 0; k < canvasNum; k++) {
      const startIndex = k * samplesPerCanvas;
      const endIndex = Math.min(startIndex + samplesPerCanvas, arr.length);
      const count = endIndex - startIndex;
      if (count <= 1) break;
      const xStep = canvas.width / (count - 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgb(0, 255, 150)';
      ctx.lineWidth = 1;

      for (let i = 0; i < count; i++) {
        const x = i * xStep;
        const amp = arr[startIndex + i] * centerY;
        ctx.beginPath();
        ctx.moveTo(x, centerY - amp);
        ctx.lineTo(x, centerY + amp);
        ctx.stroke();
      }

      const drawFill = (direction) => {
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        for (let i = 0; i < count; i++) {
          const x = i * xStep;
          const amp = arr[startIndex + i] * centerY;
          const y = direction === 'up' ? centerY - amp : centerY + amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, centerY);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 255, 150, 0.25)';
        ctx.fill();
      };

      drawFill('up');
      drawFill('down');

      const imageDataURL = canvas.toDataURL('image/png');
      const blob = dataURLtoBlob(imageDataURL);
      imgs.push(URL.createObjectURL(blob));
    }
    canvas.remove();
    return imgs;
  }

  sleep(t) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(null);
      }, t * 1000);
    });
  }

  async loadFromUrl() {
    if (!this.url) {
      return null;
    }

    const response = await fetch(this.url);
    const arrayBuffer = await parseArrayBufferResponse(response);
    this.audioBuffer = await this.context.decodeAudioData(arrayBuffer);

    return this.audioBuffer;
  }

  getPeaks(channelsPreprocess) {
    if (!this.audioBuffer) {
      console.log('No audio buffer to proccess');
      return null;
    }

    const numberOfChannels = this.audioBuffer.numberOfChannels;
    let channels = [];

    for (let channelNumber = 0; channelNumber < numberOfChannels; channelNumber++) {
      channels.push(this.audioBuffer.getChannelData(channelNumber));
    }

    if (typeof channelsPreprocess === 'function') {
      channels = channels.reduce(channelsPreprocess, []);
    }

    const peaks = channels.reduce(
      // change places of arguments in _getPeaks call
      (mergedPeaks, channelData, ...args) => this._getPeaks(channelData, mergedPeaks, ...args),
      [],
    );

    return peaks.map(d => {
      return this.toNum(d, 2);
    });
  }

  toNum(n, m) {
    if (m === undefined) {
      m = 0;
    }
    return Number(n.toFixed(m));
  }

  getPath(channelsPreprocess) {
    const peaks = this.getPeaks(channelsPreprocess);
    return this._svgPath(peaks);
  }

  /**
   * 将数组分组
   * @param {*} arr1
   * @param {*} arr2Length
   * @returns
   */
  distributeNumbers(arr1, arr2Length) {
    var ratio = arr1.length / arr2Length;
    var result = [];

    for (var i = 0; i < arr2Length; i++) {
      var startIndex = Math.round(i * ratio);
      var endIndex = Math.round((i + 1) * ratio);
      var slice = arr1.slice(startIndex, endIndex);
      result.push(slice);
    }

    return result;
  }
}
