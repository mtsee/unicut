import { action, observable, transaction } from 'mobx';
import $ from 'jquery';

/**
 * @desc 存放外部传入的props数据
 */
class Audios {
  constructor() {
    $(document).on('mousedown.ievent.audioBlank', e => {
      if (!$(e.target).closest('.audioSourceItem')[0]) {
        this.stop();
      }
    });
  }

  // 选中要播放的音乐
  @observable selectedId: string = '';
  @observable progress: number = 0;

  private _duration: number = 0;

  public audio: HTMLAudioElement = null;

  // 要播放的音乐
  set audioURL(url: string) {
    if (url) {
      this.audio = document.createElement('audio');
      this.audio.src = url;
      this.audio.addEventListener('timeupdate', this.timeupdateFun);
      this.audio.addEventListener('ended', this.audioEndFun);
    } else {
      this.audio?.remove();
    }
  }

  set duration(d: number) {
    this._duration = d;
  }

  get duration() {
    return this._duration;
  }

  @action
  audioEndFun = () => {
    this.stop();
  };

  // 监听播放进度
  @action
  timeupdateFun = () => {
    this.progress = this.audio.currentTime / this.duration;
  };

  // 设置进度
  @action
  setProgress = (p: number) => {
    this.progress = p;
    this.audio.currentTime = p * this.duration;
  };

  // 播放
  @action
  play = () => {
    this.audio?.play();
  };

  // 暂停
  @action
  pause = () => {
    this.audio?.pause();
  };

  @action
  stop = () => {
    this.pause();
    transaction(() => {
      this.progress = 0;
      this.selectedId = '';
      this.audioURL = '';
    });
  };
}

const audios = new Audios();

export { Audios, audios };
