import React, { useRef, useEffect, useState } from 'react';
import { stores } from '@stores/index';
import type { ImageElement } from 'video-core-sdk';
import { Button, Slider, Space, Toast, RadioGroup, Radio } from '@douyinfe/semi-ui';
import { IconUndo, IconRedo, IconDownload, IconDelete } from '@douyinfe/semi-icons';
import styles from './magic.module.less';
import { util } from '@utils/index';
import Loonk from './loonk.js';
import { addImageVideoAudioItem } from '@pages/editor/components/sources/addItem';
import { helper } from 'video-core-sdk';

type Props = {
  onSuccess?: (url: string) => void;
  onCancel?: () => void;
};

type ToolMode = 'magic' | 'pen' | 'crop';

const Magic = (props: Props) => {
  const { editor } = stores;
  const elementData = editor.getElementData() as ImageElement;
  const resource = editor.data.resouces.find(item => item.id === elementData.resourceId);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const loonkRef = useRef<any>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  const originImgDataRef = useRef<ImageData | null>(null);
  const selectMaskRef = useRef<Uint8Array | null>(null);
  const historyRef = useRef<{ data: ImageData; width: number; height: number }[]>([]);
  const redoHistoryRef = useRef<{ data: ImageData; width: number; height: number }[]>([]);
  const loonkInitializedRef = useRef(false);
  const pathClosedHandlerRef = useRef<(() => void) | null>(null);

  const [tolerance, setTolerance] = useState(45);
  const [hasSelection, setHasSelection] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [splitting, setSplitting] = useState(false);
  const [toolMode, setToolMode] = useState<ToolMode>('magic');
  const [penPathClosed, setPenPathClosed] = useState(false);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingCropBox, setIsDraggingCropBox] = useState(false);
  const [isResizingCropBox, setIsResizingCropBox] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0, width: 0, height: 0, left: 0, top: 0 });
  const [canvasWidthRatio, setCanvasWidthRatio] = useState(1);
  const [canvasHeightRatio, setCanvasHeightRatio] = useState(1);

  const MAX_CANVAS_SIZE = 4096;

  useEffect(() => {
    if (!resource || !canvasRef.current) return;

    const url = editor.movie.reURL(resource.url);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let w = img.width,
        h = img.height;
      if (w > MAX_CANVAS_SIZE) {
        h = (h * MAX_CANVAS_SIZE) / w;
        w = MAX_CANVAS_SIZE;
      }
      if (h > MAX_CANVAS_SIZE) {
        w = (w * MAX_CANVAS_SIZE) / h;
        h = MAX_CANVAS_SIZE;
      }
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      if (svgRef.current) {
        svgRef.current.setAttribute('width', String(w));
        svgRef.current.setAttribute('height', String(h));
        svgRef.current.style.width = `${w}px`;
        svgRef.current.style.height = `${h}px`;
      }
      ctx.drawImage(img, 0, 0, w, h);
      originImgDataRef.current = ctx.getImageData(0, 0, w, h);
      selectMaskRef.current = null;
      historyRef.current = [];
      redoHistoryRef.current = [];
      setLoading(false);
      updateBtnState();

      // 计算canvas显示比例
      setTimeout(() => {
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          setCanvasWidthRatio(rect.width / canvas.width);
          setCanvasHeightRatio(rect.height / canvas.height);
        }
      }, 100);

      // 只初始化一次钢笔工具
      if (!loonkInitializedRef.current && svgRef.current) {
        initPenToolOnce();
        loonkInitializedRef.current = true;
      }
    };
    img.onerror = () => {
      Toast.error('图片加载失败');
      setLoading(false);
    };
    img.src = url;
  }, [resource]);

  // 全局鼠标事件监听
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingCrop) {
        // 创建选框中
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / canvasWidthRatio);
        const y = Math.floor((e.clientY - rect.top) / canvasHeightRatio);
        setCropEnd({ x, y });
      } else if (isDraggingCropBox && cropStart && cropEnd && canvasRef.current) {
        // 拖动选框
        const rect = canvasRef.current.getBoundingClientRect();
        const minX = Math.min(cropStart.x, cropEnd.x);
        const minY = Math.min(cropStart.y, cropEnd.y);
        const width = Math.abs(cropEnd.x - cropStart.x);
        const height = Math.abs(cropEnd.y - cropStart.y);

        // 计算选框左上角的新位置（实际像素坐标）
        const displayLeft = e.clientX - dragOffset.x - rect.left;
        const displayTop = e.clientY - dragOffset.y - rect.top;
        const newMinX = Math.max(0, displayLeft / canvasWidthRatio);
        const newMinY = Math.max(0, displayTop / canvasHeightRatio);
        const maxX = newMinX + width;
        const maxY = newMinY + height;

        if (maxX > canvasRef.current.width || maxY > canvasRef.current.height || newMinX < 0 || newMinY < 0) return;

        setCropStart({ x: newMinX, y: newMinY });
        setCropEnd({ x: maxX, y: maxY });
      } else if (isResizingCropBox && cropStart && cropEnd && canvasRef.current) {
        // 调整选框大小
        const rect = canvasRef.current.getBoundingClientRect();
        const deltaX = (e.clientX - resizeStartPos.x) / canvasWidthRatio;
        const deltaY = (e.clientY - resizeStartPos.y) / canvasHeightRatio;
        const newWidth = Math.max(10, resizeStartPos.width + deltaX);
        const newHeight = Math.max(10, resizeStartPos.height + deltaY);

        if (
          resizeStartPos.left + newWidth > canvasRef.current.width ||
          resizeStartPos.top + newHeight > canvasRef.current.height
        ) {
          return;
        }

        setCropStart({ x: resizeStartPos.left, y: resizeStartPos.top });
        setCropEnd({ x: resizeStartPos.left + newWidth, y: resizeStartPos.top + newHeight });
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingCrop) {
        setIsDraggingCrop(false);
      }
      if (isDraggingCropBox) {
        setIsDraggingCropBox(false);
      }
      if (isResizingCropBox) {
        setIsResizingCropBox(false);
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    // 组件卸载时清理
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      if (loonkRef.current) {
        loonkRef.current.removeControls();
        // loonkRef.current = null;
      }
    };
  }, [
    isDraggingCrop,
    isDraggingCropBox,
    isResizingCropBox,
    dragOffset,
    resizeStartPos,
    canvasWidthRatio,
    canvasHeightRatio,
    cropStart,
    cropEnd,
  ]);

  const initPenToolOnce = () => {
    if (!svgRef.current || !canvasRef.current) return;

    try {
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      if (!loonkRef.current) {
        loonkRef.current = new Loonk(svgRef.current, w, h);
        loonkRef.current.start();
        loonkRef.current.initPath();
      }

      // 移除旧监听器，避免重复绑定
      if (pathClosedHandlerRef.current && svgRef.current) {
        svgRef.current.removeEventListener('pathClosed', pathClosedHandlerRef.current);
        pathClosedHandlerRef.current = null;
      }

      // 监听路径自动闭合事件
      const handlePathClosed = () => {
        setPenPathClosed(true);
        Toast.success('路径已闭合');
      };
      pathClosedHandlerRef.current = handlePathClosed;
      svgRef.current.addEventListener('pathClosed', handlePathClosed);
    } catch (err) {
      console.error('钢笔工具初始化失败:', err);
      Toast.error('钢笔工具加载失败');
    }
  };

  const clearPenElements = () => {
    // console.log('clearPenElements', loonkRef.current, svgRef.current);
    if (!loonkRef.current || !svgRef.current) return;
    loonkRef.current.removeControls();
    loonkRef.current.removePredictorPath();
    loonkRef.current.removeHelperPoint();
    loonkRef.current.removeHelperPath();
    const paths = svgRef.current.querySelectorAll('.loonk_scene_path');
    paths.forEach(p => p.remove());
    const predictors = svgRef.current.querySelectorAll('.loonk_scene_path_predictor');
    predictors.forEach(p => p.remove());
    const helpers = svgRef.current.querySelectorAll('.loonk_scene_point_helper');
    helpers.forEach(p => p.remove());
    loonkRef.current.m_paths = [];
    loonkRef.current.m_pathElements = [];
    loonkRef.current.initPath();
    setPenPathClosed(false);
  };

  const handleToolModeChange = (mode: ToolMode) => {
    handleClear();
    setToolMode(mode);
    selectMaskRef.current = null;
    setCropStart(null);
    setCropEnd(null);
    setIsDraggingCrop(false);
    if (mode === 'pen') {
      if (loonkRef.current) {
        clearPenElements();
      }
    } else {
      if (loonkRef.current) {
        clearPenElements();
      }
      if (originImgDataRef.current && ctxRef.current) {
        ctxRef.current.putImageData(originImgDataRef.current, 0, 0);
      }
      setPenPathClosed(false);
      setHasSelection(false);
    }
  };

  const updateBtnState = () => {
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(redoHistoryRef.current.length > 0);
    setHasSelection(selectMaskRef.current !== null);
  };

  const saveHistoryData = () => {
    if (!canvasRef.current || !ctxRef.current) return;
    historyRef.current.push({
      data: ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height),
      width: canvasRef.current.width,
      height: canvasRef.current.height,
    });
    if (historyRef.current.length > 20) historyRef.current.shift();
    redoHistoryRef.current = [];
    updateBtnState();
  };

  const handleUndo = () => {
    if (!historyRef.current.length || !canvasRef.current || !ctxRef.current) return;
    // 保存当前状态到redo
    redoHistoryRef.current.push({
      data: ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height),
      width: canvasRef.current.width,
      height: canvasRef.current.height,
    });
    const last = historyRef.current.pop()!;
    // 恢复画布尺寸
    canvasRef.current.width = last.width;
    canvasRef.current.height = last.height;
    // 绘制图片数据
    ctxRef.current.putImageData(last.data, 0, 0);
    originImgDataRef.current = last.data;
    selectMaskRef.current = null;
    // 更新SVG尺寸
    if (svgRef.current) {
      svgRef.current.setAttribute('width', String(last.width));
      svgRef.current.setAttribute('height', String(last.height));
    }
    // 重新计算显示比例
    const rect = canvasRef.current.getBoundingClientRect();
    setCanvasWidthRatio(rect.width / last.width);
    setCanvasHeightRatio(rect.height / last.height);
    // 重置钢笔工具
    if (loonkRef.current) {
      clearPenElements();
      // loonkRef.current = null;
      loonkInitializedRef.current = false;
      setTimeout(() => {
        if (svgRef.current) {
          initPenToolOnce();
          loonkInitializedRef.current = true;
        }
      }, 0);
    }
    updateBtnState();
  };

  const handleRedo = () => {
    if (!redoHistoryRef.current.length || !canvasRef.current || !ctxRef.current) return;
    // 保存当前状态到history
    historyRef.current.push({
      data: ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height),
      width: canvasRef.current.width,
      height: canvasRef.current.height,
    });
    const next = redoHistoryRef.current.pop()!;
    // 恢复画布尺寸
    canvasRef.current.width = next.width;
    canvasRef.current.height = next.height;
    // 绘制图片数据
    ctxRef.current.putImageData(next.data, 0, 0);
    originImgDataRef.current = next.data;
    selectMaskRef.current = null;
    // 更新SVG尺寸
    if (svgRef.current) {
      svgRef.current.setAttribute('width', String(next.width));
      svgRef.current.setAttribute('height', String(next.height));
    }
    // 重新计算显示比例
    const rect = canvasRef.current.getBoundingClientRect();
    setCanvasWidthRatio(rect.width / next.width);
    setCanvasHeightRatio(rect.height / next.height);
    // 重置钢笔工具
    if (loonkRef.current) {
      clearPenElements();
      // loonkRef.current = null;
      loonkInitializedRef.current = false;
      setTimeout(() => {
        if (svgRef.current) {
          initPenToolOnce();
          loonkInitializedRef.current = true;
        }
      }, 0);
    }
    updateBtnState();
  };

  const getColorDiff = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
    return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
  };

  const fastSelect = (sx: number, sy: number): Uint8Array => {
    if (!canvasRef.current || !originImgDataRef.current) return new Uint8Array(0);

    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    const data = originImgDataRef.current.data;
    const startIdx = (sy * w + sx) * 4;
    const tr = data[startIdx],
      tg = data[startIdx + 1],
      tb = data[startIdx + 2];

    const mask = new Uint8Array(w * h);
    const queue: [number, number][] = [[sx, sy]];
    mask[sy * w + sx] = 1;
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    while (queue.length) {
      const [x, y] = queue.shift()!;
      for (const [dx, dy] of dirs) {
        const nx = x + dx,
          ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const pos = ny * w + nx;
        if (mask[pos]) continue;
        const pidx = pos * 4;
        if (getColorDiff(data[pidx], data[pidx + 1], data[pidx + 2], tr, tg, tb) <= tolerance) {
          mask[pos] = 1;
          queue.push([nx, ny]);
        }
      }
    }
    return mask;
  };

  const renderMask = () => {
    if (!originImgDataRef.current || !ctxRef.current || !canvasRef.current) return;
    ctxRef.current.putImageData(originImgDataRef.current, 0, 0);
    if (!selectMaskRef.current) return;

    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    ctxRef.current.fillStyle = 'rgba(255, 0, 0, 0.3)';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (selectMaskRef.current[y * w + x]) {
          ctxRef.current.fillRect(x, y, 1, 1);
        }
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (toolMode === 'magic') {
      if (!originImgDataRef.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / canvasWidthRatio);
      const y = Math.floor((e.clientY - rect.top) / canvasHeightRatio);
      selectMaskRef.current = fastSelect(x, y);
      renderMask();
      updateBtnState();
    } else if (toolMode === 'crop' && !isDraggingCropBox && !isResizingCropBox) {
      // 只有在没有拖动或调整大小时，才创建新选框
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / canvasWidthRatio);
      const y = Math.floor((e.clientY - rect.top) / canvasHeightRatio);
      setIsDraggingCrop(true);
      setCropStart({ x, y });
      setCropEnd(null);
    }
  };

  const handleCropBoxDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!cropStart || !cropEnd || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const minX = Math.min(cropStart.x, cropEnd.x);
    const minY = Math.min(cropStart.y, cropEnd.y);

    // 计算鼠标在选框内的偏移量（显示坐标）
    const offsetX = e.clientX - (rect.left + minX * canvasWidthRatio);
    const offsetY = e.clientY - (rect.top + minY * canvasHeightRatio);

    setIsDraggingCropBox(true);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleCropBoxResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!cropStart || !cropEnd || !canvasRef.current) return;

    const minX = Math.min(cropStart.x, cropEnd.x);
    const minY = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);

    setIsResizingCropBox(true);
    setResizeStartPos({
      x: e.clientX,
      y: e.clientY,
      width,
      height,
      left: minX,
      top: minY,
    });
  };

  const handleClear = () => {
    selectMaskRef.current = null;
    setCropStart(null);
    setCropEnd(null);
    setIsDraggingCrop(false);
    if (originImgDataRef.current && ctxRef.current) {
      ctxRef.current.putImageData(originImgDataRef.current, 0, 0);
    }
    if (toolMode === 'pen' && loonkRef.current) {
      clearPenElements();
    }
    updateBtnState();
    setPenPathClosed(false);
  };

  const createMaskFromPath = (): Uint8Array | null => {
    if (!loonkRef.current || !canvasRef.current) return null;

    const paths = loonkRef.current.m_paths;
    if (!paths || paths.length === 0) return null;

    const path = paths[paths.length - 1];
    if (!path.m_points || path.m_points.length < 3) return null;

    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    const mask = new Uint8Array(w * h);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;

    tempCtx.save();
    tempCtx.beginPath();

    const points = path.m_points;
    const firstPoint = points[0];
    tempCtx.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currPoint = points[i];
      tempCtx.bezierCurveTo(
        prevPoint.cp1.x,
        prevPoint.cp1.y,
        currPoint.cp0.x,
        currPoint.cp0.y,
        currPoint.x,
        currPoint.y,
      );
    }

    if (path.m_isClosed) {
      const lastPoint = points[points.length - 1];
      tempCtx.bezierCurveTo(
        lastPoint.cp1.x,
        lastPoint.cp1.y,
        firstPoint.cp0.x,
        firstPoint.cp0.y,
        firstPoint.x,
        firstPoint.y,
      );
      tempCtx.closePath();
    }

    tempCtx.fillStyle = 'white';
    tempCtx.fill();
    tempCtx.restore();

    const maskData = tempCtx.getImageData(0, 0, w, h);
    for (let i = 0; i < maskData.data.length; i += 4) {
      if (maskData.data[i] > 128) {
        mask[i / 4] = 1;
      }
    }

    return mask;
  };

  const handleDelete = () => {
    if (toolMode === 'magic') {
      if (!selectMaskRef.current || !canvasRef.current || !ctxRef.current) return;
      saveHistoryData();

      const imgData = ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      const d = imgData.data;
      for (let i = 0; i < selectMaskRef.current.length; i++) {
        if (selectMaskRef.current[i]) d[i * 4 + 3] = 0;
      }
      ctxRef.current.putImageData(imgData, 0, 0);
      originImgDataRef.current = imgData;
      selectMaskRef.current = null;
      updateBtnState();
    } else if (toolMode === 'pen') {
      const penMask = createMaskFromPath();
      if (!penMask || !canvasRef.current || !ctxRef.current || !originImgDataRef.current) {
        Toast.warning('请先绘制闭合路径');
        return;
      }
      saveHistoryData();

      const imgData = ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      const d = imgData.data;
      for (let i = 0; i < penMask.length; i++) {
        if (penMask[i]) d[i * 4 + 3] = 0;
      }
      ctxRef.current.putImageData(imgData, 0, 0);
      originImgDataRef.current = imgData;
      updateBtnState();
      clearPenElements();
    }
  };

  // 获取非透明像素的包围盒
  const getNonTransparentBBox = (imageData: ImageData) => {
    const d = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    let left = w,
      top = h,
      right = 0,
      bottom = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3] > 0) {
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }
    if (left > right || top > bottom) return null;
    return { left, top, width: right - left + 1, height: bottom - top + 1 };
  };

  const handleSplit = async () => {
    let mask: Uint8Array | null = null;

    if (toolMode === 'magic') {
      mask = selectMaskRef.current;
      if (!mask) {
        Toast.warning('请先选择区域');
        return;
      }
    } else if (toolMode === 'pen') {
      mask = createMaskFromPath();
      if (!mask) {
        Toast.warning('请先绘制闭合路径');
        return;
      }
    }

    if (!mask || !canvasRef.current || !ctxRef.current || !resource) return;

    setSplitting(true);
    editor.globalLoading = true;
    try {
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      const imgData = ctxRef.current.getImageData(0, 0, w, h);
      const currentElement = editor.getElementData() as ImageElement;
      const scaleX = currentElement.style.width / w;
      const scaleY = currentElement.style.height / h;

      // 选中区域图层
      const dataA = new Uint8ClampedArray(imgData.data);
      for (let i = 0; i < mask.length; i++) {
        if (!mask[i]) dataA[i * 4 + 3] = 0;
      }
      const imgDataA = new ImageData(dataA, w, h);
      const bboxA = getNonTransparentBBox(imgDataA);

      // 底图图层（选区透明）
      const dataB = new Uint8ClampedArray(imgData.data);
      for (let i = 0; i < mask.length; i++) {
        if (mask[i]) dataB[i * 4 + 3] = 0;
      }
      const imgDataB = new ImageData(dataB, w, h);
      const bboxB = getNonTransparentBBox(imgDataB);

      if (!bboxA || !bboxB) {
        Toast.error('裁剪区域无效');
        return;
      }

      // 创建裁剪后的选中区域图层 canvas
      const canvasA = document.createElement('canvas');
      canvasA.width = bboxA.width;
      canvasA.height = bboxA.height;
      const ctxA = canvasA.getContext('2d')!;
      ctxA.putImageData(imgDataA, -bboxA.left, -bboxA.top);
      const base64A = canvasA.toDataURL('image/png');

      // 创建裁剪后的底图图层 canvas
      const canvasB = document.createElement('canvas');
      canvasB.width = bboxB.width;
      canvasB.height = bboxB.height;
      const ctxB = canvasB.getContext('2d')!;
      ctxB.putImageData(imgDataB, -bboxB.left, -bboxB.top);
      const base64B = canvasB.toDataURL('image/png');

      // 上传到服务器
      const [resA] = await editor.apiServer.uploadBase64({
        content: base64A,
        name: `${util.randomID()}.png`,
        file_type: 'image',
      });
      const [resB] = await editor.apiServer.uploadBase64({
        content: base64B,
        name: `${util.randomID()}.png`,
        file_type: 'image',
      });

      if (!resA?.storage_path || !resB?.storage_path) {
        Toast.error('上传失败');
        return;
      }

      const elemA: any = await addImageVideoAudioItem(
        {
          type: 'image',
          from: 'user',
          name: `${resource.name}_选区`,
          urls: { url: resA.storage_path, thumb: resA.storage_path },
          attrs: {
            width: bboxA.width,
            height: bboxA.height,
            duration: currentElement.duration || 5,
          },
        },
        editor.currentTime,
        currentElement.trackIndex + 0.5,
      );

      const elemB: any = await addImageVideoAudioItem(
        {
          type: 'image',
          from: 'user',
          name: `${resource.name}_底图`,
          urls: { url: resB.storage_path, thumb: resB.storage_path },
          attrs: {
            width: bboxB.width,
            height: bboxB.height,
            duration: currentElement.duration || 5,
          },
        },
        editor.currentTime,
        (currentElement.trackIndex || 0) + 1.5,
      );

      // 计算裁剪后的新坐标（包围盒中心相对于原图中心的偏移）
      if (elemA) {
        const centerOffsetXA = bboxA.left + bboxA.width / 2 - w / 2;
        const centerOffsetYA = bboxA.top + bboxA.height / 2 - h / 2;
        elemA.style.x = currentElement.style.x + centerOffsetXA * scaleX;
        elemA.style.y = currentElement.style.y + centerOffsetYA * scaleY;
        elemA.style.width = bboxA.width * scaleX;
        elemA.style.height = bboxA.height * scaleY;
      }
      if (elemB) {
        const centerOffsetXB = bboxB.left + bboxB.width / 2 - w / 2;
        const centerOffsetYB = bboxB.top + bboxB.height / 2 - h / 2;
        elemB.style.x = currentElement.style.x + centerOffsetXB * scaleX;
        elemB.style.y = currentElement.style.y + centerOffsetYB * scaleY;
        elemB.style.width = bboxB.width * scaleX;
        elemB.style.height = bboxB.height * scaleY;
      }

      editor.record({
        type: 'add',
        desc: '分割图片',
      });
      editor.updateMovie();
      editor.updateTimeline();

      // 删除原始图片元素
      helper.deleteElementByIds([currentElement.id], editor.data);
      editor.updateMovie();
      editor.updateTimeline();

      Toast.success('分割完成');
    } catch (error) {
      console.error('分割失败:', error);
      Toast.error('分割失败');
    } finally {
      setSplitting(false);
      editor.globalLoading = false;
    }
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;

    const a = document.createElement('a');
    a.download = '抠图结果.png';
    a.href = canvasRef.current.toDataURL('image/png');
    a.click();

    if (props.onSuccess) {
      const base64 = canvasRef.current.toDataURL('image/png');
      props.onSuccess(base64);
    }
  };

  const handleApply = async () => {
    if (!canvasRef.current || !resource) return;

    const base64 = canvasRef.current.toDataURL('image/png');

    console.log(base64);

    const [res, err] = await editor.apiServer.uploadBase64({
      content: base64,
      name: `${resource.name}_magic.png`,
      file_type: 'image',
    });

    // 获取封面图
    const thumbBase64 = await util.resizeBase64Image(base64, 200);
    const [resThumb, err2] = await editor.apiServer.uploadBase64({
      content: thumbBase64,
      name: `${resource.name}_magic_thumb.png`,
      file_type: 'image',
    });

    if (err) {
      Toast.error(err);
      return;
    }
    const img = await util.imgLazy(editor.movie.reURL(res.storage_path));

    // 构建一个新的资源
    const newResource = util.toJS(resource);

    delete newResource.duration;
    newResource.attrs.naturalWidth = img.naturalWidth;
    newResource.attrs.naturalHeight = img.naturalHeight;
    newResource.styleSize.width = img.naturalWidth;
    newResource.styleSize.height = img.naturalHeight;
    newResource.id = util.randomID();
    newResource.originId = resource.originId + '_' + util.randomID();
    newResource.thumb = resThumb.storage_path;
    newResource.url = res.storage_path;
    editor.data.resouces.push(newResource);

    // 加载到系统
    await editor.movie.resourceManage.fetchBlob(newResource.url);
    // resource.thumb = res.storage_path;
    console.log(newResource);
    // 重新修改图片尺寸
    elementData.resourceId = newResource.id;
    elementData._dirty = util.randomID();
    elementData.style.width = img.naturalWidth;
    elementData.style.height = img.naturalHeight;
    editor.updateMovie();
    Toast.success('应用成功');
    if (props.onCancel) {
      props.onCancel();
    }
  };

  const handleFinishPath = () => {
    if (!loonkRef.current) {
      Toast.warning('钢笔工具未初始化');
      return;
    }
    if (!loonkRef.current.m_path || !loonkRef.current.m_path.m_points) {
      Toast.warning('请先绘制路径');
      return;
    }
    if (loonkRef.current.m_path.m_points.length < 3) {
      Toast.warning('至少需要3个点才能闭合路径');
      return;
    }
    // 手动闭合路径
    loonkRef.current.m_path.m_isClosed = true;
    loonkRef.current.render();
    setPenPathClosed(true);
    Toast.success('路径已闭合');
  };

  const handleCrop = () => {
    if (!cropStart || !cropEnd || !canvasRef.current || !ctxRef.current || !originImgDataRef.current) return;

    const left = Math.min(cropStart.x, cropEnd.x);
    const top = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);

    if (width < 5 || height < 5) {
      Toast.warning('裁剪区域太小');
      return;
    }

    saveHistoryData();

    // 创建新画布保存裁剪内容
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // 绘制裁剪区域
    tempCtx.drawImage(canvasRef.current, left, top, width, height, 0, 0, width, height);

    // 更新画布
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;
    ctxRef.current.drawImage(tempCanvas, 0, 0);

    // 更新原始数据
    originImgDataRef.current = ctxRef.current.getImageData(0, 0, width, height);

    // 重新计算显示比例
    const rect = canvasRef.current.getBoundingClientRect();
    setCanvasWidthRatio(rect.width / width);
    setCanvasHeightRatio(rect.height / height);

    // 重置裁剪状态
    setCropStart(null);
    setCropEnd(null);
    setIsDraggingCrop(false);

    // 更新SVG尺寸
    if (svgRef.current) {
      svgRef.current.setAttribute('width', String(width));
      svgRef.current.setAttribute('height', String(height));
      svgRef.current.style.width = `${width}px`;
      svgRef.current.style.height = `${height}px`;
    }

    // 重置钢笔工具
    if (loonkRef.current) {
      clearPenElements();
      // loonkRef.current = null;
      loonkInitializedRef.current = false;
      setTimeout(() => {
        if (svgRef.current) {
          initPenToolOnce();
          loonkInitializedRef.current = true;
        }
      }, 0);
    }

    Toast.success('裁剪成功');
  };

  if (!resource) {
    return <div>未找到素材</div>;
  }

  return (
    <div className={styles.magic}>
      <div className={styles.tools}>
        <RadioGroup type="button" value={toolMode} onChange={e => handleToolModeChange(e.target.value as ToolMode)}>
          <Radio value="magic">魔棒</Radio>
          <Radio value="pen">钢笔</Radio>
          <Radio value="crop">裁剪</Radio>
        </RadioGroup>
        {toolMode === 'magic' && (
          <Space>
            <span>容差：</span>
            <Slider
              value={tolerance}
              onChange={v => setTolerance(Number(v))}
              min={0}
              max={100}
              step={1}
              style={{ width: 120 }}
            />
            <span>{tolerance}</span>
          </Space>
        )}

        {toolMode === 'pen' && (
          <Space>
            <Button onClick={handleFinishPath} disabled={penPathClosed}>
              完成路径
            </Button>
            {/* <span style={{ color: penPathClosed ? 'green' : '#999', fontSize: 12 }}>
              {penPathClosed ? '路径已闭合' : '绘制后点击完成'}
            </span> */}
          </Space>
        )}

        <Space>
          {toolMode === 'crop' ? (
            <Button onClick={handleCrop} disabled={!cropStart || !cropEnd} type="primary" theme="solid">
              确认裁剪
            </Button>
          ) : (
            <>
              <Button
                icon={<IconDelete />}
                disabled={toolMode === 'magic' ? !hasSelection : !penPathClosed}
                onClick={handleDelete}
                type="danger"
              >
                删除
              </Button>
              <Button
                disabled={splitting || (toolMode === 'magic' ? !hasSelection : !penPathClosed)}
                loading={splitting}
                onClick={handleSplit}
              >
                分割
              </Button>
            </>
          )}
          <Button onClick={handleClear}>取消选区</Button>
          <Button icon={<IconUndo />} disabled={!canUndo} onClick={handleUndo}></Button>
          <Button icon={<IconRedo />} disabled={!canRedo} onClick={handleRedo}></Button>
        </Space>
        <Space>
          <Button icon={<IconDownload />} onClick={handleDownload} theme="solid" type="tertiary">
            下载
          </Button>
          <Button onClick={handleApply} theme="solid" type="primary">
            应用到素材
          </Button>
        </Space>
      </div>
      <div className={styles.canvasBox}>
        {loading && <div className={styles.loading}>加载中...</div>}
        {splitting && <div className={styles.loading}>分割处理中...</div>}
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          className={styles.canvas}
          style={{
            cursor: toolMode === 'magic' ? 'crosshair' : toolMode === 'crop' ? 'crosshair' : 'default',
          }}
        />
        {toolMode === 'crop' && cropStart && cropEnd && (
          <div
            ref={cropBoxRef}
            className={styles.cropBox}
            style={{
              left: `${Math.min(cropStart.x, cropEnd.x) * canvasWidthRatio || 0}px`,
              top: `${Math.min(cropStart.y, cropEnd.y) * canvasHeightRatio || 0}px`,
              width: `${Math.abs(cropEnd.x - cropStart.x) * canvasWidthRatio || 0}px`,
              height: `${Math.abs(cropEnd.y - cropStart.y) * canvasHeightRatio || 0}px`,
            }}
            onMouseDown={handleCropBoxDragStart}
          >
            <div className={styles.cropResizeHandle} onMouseDown={handleCropBoxResizeStart} />
          </div>
        )}
        <svg ref={svgRef} className={styles.svgOverlay} style={{ display: toolMode === 'pen' ? 'block' : 'none' }} />
      </div>
    </div>
  );
};

export default Magic;
