import opencv from "opencv-ts";

const cv = opencv as any;

export interface Roi {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RectTrackOptions {
  canvas: HTMLCanvasElement;
  roi: Roi;
  duration?: number;
  width?: number;
  height?: number;
}

export interface ProgressData {
  time: string;
  cx: string;
  cy: string;
  angle: string;
  corners: number[][];
  pts: number;
  progress: number;
  duration: number;
  error?: string;
}

export interface TrackResult {
  success: boolean;
  reason?: string;
  data?: ProgressData;
}

export class RectTrack {
  private canvas: HTMLCanvasElement;
  private roi: Roi;
  private duration: number;
  private width: number;
  private height: number;
  private ctx: CanvasRenderingContext2D;

  //@ts-ignore
  private prevGray: cv.Mat | null = null;
  //@ts-ignore
  private prevPts: cv.Mat | null = null;
  //@ts-ignore
  private initialPts: cv.Mat | null = null;
  private initialCorners: number[][] | null = null;
  private isTracking = false;
  private trackPath: ProgressData[] = [];

  private listeners: {
    progress: ((data: ProgressData) => void)[];
    end: ((data: ProgressData[]) => void)[];
  } = {
    progress: [],
    end: [],
  };

  constructor(options: RectTrackOptions) {
    this.canvas = options.canvas;
    this.roi = options.roi;
    this.duration = options.duration || 1;
    this.width = options.width || this.canvas.width;
    this.height = options.height || this.canvas.height;
    this.ctx = this.canvas.getContext("2d")!;
  }

  private fitSimilarity(
    src: Float32Array,
    dst: Float32Array,
    n: number,
  ): number[] | null {
    let sumX = 0,
      sumY = 0,
      sumXp = 0,
      sumYp = 0;
    for (let i = 0; i < n; i++) {
      sumX += src[i * 2];
      sumY += src[i * 2 + 1];
      sumXp += dst[i * 2];
      sumYp += dst[i * 2 + 1];
    }
    const mx = sumX / n,
      my = sumY / n,
      mxp = sumXp / n,
      myp = sumYp / n;

    let Sxx = 0,
      Syy = 0,
      Sxy = 0,
      Syx = 0,
      S2 = 0;
    for (let i = 0; i < n; i++) {
      const dx = src[i * 2] - mx;
      const dy = src[i * 2 + 1] - my;
      const dxp = dst[i * 2] - mxp;
      const dyp = dst[i * 2 + 1] - myp;
      Sxx += dx * dxp;
      Syy += dy * dyp;
      Sxy += dx * dyp;
      Syx += dy * dxp;
      S2 += dx * dx + dy * dy;
    }
    if (S2 < 1e-6) return null;
    const a = (Sxx + Syy) / S2;
    const b = (Sxy - Syx) / S2;
    const tx = mxp - (a * mx - b * my);
    const ty = myp - (b * mx + a * my);
    return [a, -b, tx, b, a, ty];
  }

  start(): this {
    if (!this.roi) throw new Error("ROI 未设置");

    this.dispose();

    const frame = cv.imread(this.canvas);
    this.prevGray = new cv.Mat();
    cv.cvtColor(frame, this.prevGray, cv.COLOR_RGBA2GRAY);
    frame.delete();

    const mask = cv.Mat.zeros(
      this.prevGray.rows,
      this.prevGray.cols,
      cv.CV_8UC1,
    );
    const rx = Math.max(0, Math.round(this.roi.x));
    const ry = Math.max(0, Math.round(this.roi.y));
    const rw = Math.min(this.prevGray.cols - rx, Math.round(this.roi.width));
    const rh = Math.min(this.prevGray.rows - ry, Math.round(this.roi.height));
    const maskRoi = mask.roi(new cv.Rect(rx, ry, rw, rh));
    maskRoi.setTo(new cv.Scalar(255));
    maskRoi.delete();

    this.prevPts = new cv.Mat();
    cv.goodFeaturesToTrack(this.prevGray, this.prevPts, 200, 0.01, 5, mask, 7);
    mask.delete();

    this.initialPts = this.prevPts.clone();
    this.initialCorners = [
      [this.roi.x, this.roi.y],
      [this.roi.x + this.roi.width, this.roi.y],
      [this.roi.x + this.roi.width, this.roi.y + this.roi.height],
      [this.roi.x, this.roi.y + this.roi.height],
    ];

    this.isTracking = true;
    this.trackPath = [];

    return this;
  }

  stepTrack(mediaTime: number = 0): TrackResult {
    if (!this.isTracking || !this.prevGray || !this.prevPts) {
      return { success: false, reason: "未初始化或已停止" };
    }

    let quad: number[][] | null = null;
    let ptsTracked = 0;

    const frame = cv.imread(this.canvas);
    const currGray = new cv.Mat();
    cv.cvtColor(frame, currGray, cv.COLOR_RGBA2GRAY);
    frame.delete();

    if (this.prevPts.rows >= 4) {
      const nextPts = new cv.Mat();
      const status = new cv.Mat();
      const err = new cv.Mat();
      cv.calcOpticalFlowPyrLK(
        this.prevGray,
        currGray,
        this.prevPts,
        nextPts,
        status,
        err,
      );

      const survivors: number[] = [];
      for (let i = 0; i < status.rows; i++) {
        if (status.data[i] === 1) survivors.push(i);
      }
      ptsTracked = survivors.length;

      if (survivors.length >= 4) {
        const srcArr = new Float32Array(survivors.length * 2);
        const dstArr = new Float32Array(survivors.length * 2);
        for (let i = 0; i < survivors.length; i++) {
          const idx = survivors[i];
          srcArr[i * 2] = this.initialPts!.data32F[idx * 2];
          srcArr[i * 2 + 1] = this.initialPts!.data32F[idx * 2 + 1];
          dstArr[i * 2] = nextPts.data32F[idx * 2];
          dstArr[i * 2 + 1] = nextPts.data32F[idx * 2 + 1];
        }

        const M = this.fitSimilarity(srcArr, dstArr, survivors.length);
        if (M) {
          const [a, b, tx, c, d, ty] = M;
          quad = this.initialCorners!.map(([x, y]) => [
            a * x + b * y + tx,
            c * x + d * y + ty,
          ]);
        }

        const newInitArr = new Float32Array(survivors.length * 2);
        const newPrevArr = new Float32Array(survivors.length * 2);
        for (let i = 0; i < survivors.length; i++) {
          const idx = survivors[i];
          newInitArr[i * 2] = this.initialPts!.data32F[idx * 2];
          newInitArr[i * 2 + 1] = this.initialPts!.data32F[idx * 2 + 1];
          newPrevArr[i * 2] = nextPts.data32F[idx * 2];
          newPrevArr[i * 2 + 1] = nextPts.data32F[idx * 2 + 1];
        }
        this.initialPts!.delete();
        this.prevPts.delete();
        this.initialPts = cv.matFromArray(
          survivors.length,
          1,
          cv.CV_32FC2,
          newInitArr,
        );
        this.prevPts = cv.matFromArray(
          survivors.length,
          1,
          cv.CV_32FC2,
          newPrevArr,
        );
      }

      nextPts.delete();
      status.delete();
      err.delete();
    }

    this.prevGray.delete();
    this.prevGray = currGray;

    if (quad) {
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = "#ff0000";
      this.ctx.beginPath();
      this.ctx.moveTo(quad[0][0], quad[0][1]);
      for (let i = 1; i < 4; i++) this.ctx.lineTo(quad[i][0], quad[i][1]);
      this.ctx.closePath();
      this.ctx.stroke();

      this.ctx.strokeStyle = "#00ff00";
      this.ctx.beginPath();
      this.ctx.moveTo(quad[0][0], quad[0][1]);
      this.ctx.lineTo(quad[1][0], quad[1][1]);
      this.ctx.stroke();

      const cx = (quad[0][0] + quad[1][0] + quad[2][0] + quad[3][0]) / 4;
      const cy = (quad[0][1] + quad[1][1] + quad[2][1] + quad[3][1]) / 4;

      this.ctx.fillStyle = "#ffff00";
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = "#ff0000";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      const dx = quad[1][0] - quad[0][0];
      const dy = quad[1][1] - quad[0][1];
      const hypotenuse = Math.sqrt(dx * dx + dy * dy);
      const adjacent = Math.abs(dx);
      const cosAngle = Math.min(1, Math.max(-1, adjacent / hypotenuse));
      const angle = (Math.acos(cosAngle) * 180) / Math.PI;

      const t = mediaTime.toFixed(2);
      const progress =
        this.duration > 0
          ? ((mediaTime / this.duration) * 100).toFixed(2)
          : "0";

      const result: ProgressData = {
        time: t,
        cx: cx.toFixed(2),
        cy: cy.toFixed(2),
        angle: angle.toFixed(2),
        corners: quad.map((p) => [+p[0].toFixed(2), +p[1].toFixed(2)]),
        pts: ptsTracked,
        progress: parseFloat(progress),
        duration: this.duration,
      };

      this.trackPath.push(result);

      this.ctx.fillStyle = "#fff";
      this.ctx.font = "14px sans-serif";
      this.ctx.fillText(
        `${t}s  θ=${angle.toFixed(2)}°  pts=${ptsTracked}`,
        cx + 6,
        cy,
      );

      this.emit("progress", result);

      return { success: true, data: result };
    } else {
      const progress =
        this.duration > 0
          ? ((mediaTime / this.duration) * 100).toFixed(2)
          : "0";
      this.emit("progress", {
        time: mediaTime.toFixed(2),
        cx: "0",
        cy: "0",
        angle: "0",
        corners: [],
        pts: ptsTracked,
        progress: parseFloat(progress),
        duration: this.duration,
        error: `特征点不足 (${ptsTracked})`,
      });
      return { success: false, reason: `特征点不足 (${ptsTracked})` };
    }
  }

  stop(): ProgressData[] {
    this.isTracking = false;
    this.dispose();
    this.emit("end", this.trackPath);
    return this.trackPath;
  }

  private dispose(): void {
    if (this.prevGray) {
      this.prevGray.delete();
      this.prevGray = null;
    }
    if (this.prevPts) {
      this.prevPts.delete();
      this.prevPts = null;
    }
    if (this.initialPts) {
      this.initialPts.delete();
      this.initialPts = null;
    }
    this.initialCorners = null;
  }

  on(event: "progress" | "end", handler: any) {
    if (this.listeners[event]) {
      this.listeners[event].push(handler);
    }
    return this;
  }

  off(event: "progress" | "end", handler: any) {
    if (this.listeners[event]) {
        //@ts-ignore
      this.listeners[event] = this.listeners[event].filter(
        (h) => h !== handler,
      );
    }
    return this;
  }

  emit(event: "progress" | "end", data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((handler) => handler(data));
    }
  }

  getTrackPath(): ProgressData[] {
    return this.trackPath;
  }
}
