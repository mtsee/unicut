import type * as sdkTypes from 'video-core-sdk';
import { utils, speedHelper } from 'video-core-sdk';
import type { Editor } from '@stores/editor';
import { DEFAULT_LLM_MODEL } from './aiConfig';

// ==================== Tool Definitions ====================

interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ToolParam>;
}

interface ToolParam {
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
}

const TOOLS: ToolDefinition[] = [
  {
    name: 'list_elements',
    description: '列出视频中的所有元素',
    parameters: {},
  },
  {
    name: 'add_text_element',
    description: '添加一个文字元素到视频中',
    parameters: {
      text: { type: 'string', description: '文字内容', required: true },
      startTime: { type: 'number', description: '开始时间（秒）', required: true },
      duration: { type: 'number', description: '持续时间（秒）', required: true },
      x: { type: 'number', description: 'X 坐标（水平位置，默认画面中心）' },
      y: { type: 'number', description: 'Y 坐标（垂直位置，默认画面中心）' },
      fontSize: { type: 'number', description: '字体大小，默认 48' },
      color: { type: 'string', description: '字体颜色，支持 #hex 格式，默认白色 #ffffff' },
      fontFamily: { type: 'string', description: '字体名称，默认 Arial' },
      bold: { type: 'boolean', description: '是否加粗' },
      rotation: { type: 'number', description: '旋转角度（弧度，Math.PI 单位，如 0.5 表示约 28.6 度）' },
    },
  },
  {
    name: 'delete_element',
    description: '删除元素。不传id则删除所有选中的元素',
    parameters: {
      id: { type: 'string', description: '元素 ID（不传则删除选中的元素）' },
    },
  },
  {
    name: 'modify_element',
    description: '修改元素的属性。不传id则修改所有选中的元素。支持修改：startTime、duration、x、y、width、height、rotation(弧度)、alpha、text(仅文字元素)。relative=true时数值属性视为增量偏移。step配合relative使用表示依次递增（第i个元素偏移量=step*(i+1)，元素按startTime排序，i从0开始）',
    parameters: {
      id: { type: 'string', description: '元素 ID（不传则修改选中的元素）' },
      properties: { type: 'object', description: '要修改的属性对象，如 {"x": 100, "text": "新文字"}', required: true },
      relative: { type: 'boolean', description: '是否使用相对模式。true 时数值属性作为增量偏移量' },
      step: { type: 'number', description: '依次递增步长。配合relative使用，元素按startTime排序后，第i个元素的偏移量=step*i（i从0开始）。如"依次增加0.2秒"：relative=true, step=0.2, properties={"startTime": 0}' },
    },
  },
  {
    name: 'set_movie_size',
    description: '设置视频画面尺寸',
    parameters: {
      width: { type: 'number', description: '宽度（像素）', required: true },
      height: { type: 'number', description: '高度（像素）', required: true },
    },
  },
  {
    name: 'get_element_detail',
    description: '获取某个元素的详细信息',
    parameters: {
      id: { type: 'string', description: '元素 ID', required: true },
    },
  },

  // ===== 播放控制 =====
  {
    name: 'play',
    description: '开始播放视频',
    parameters: {},
  },
  {
    name: 'pause',
    description: '暂停播放视频',
    parameters: {},
  },
  {
    name: 'seek_to',
    description: '跳转到指定时间',
    parameters: {
      time: { type: 'number', description: '时间（秒）', required: true },
    },
  },

  // ===== 字幕操作 =====
  {
    name: 'add_caption',
    description: '添加一条字幕，可选在指定位置之后插入',
    parameters: {
      text: { type: 'string', description: '字幕文字内容', required: true },
      index: { type: 'number', description: '插入位置索引（在第几条字幕之后插入），默认追加到末尾' },
    },
  },
  {
    name: 'delete_caption',
    description: '删除指定字幕',
    parameters: {
      id: { type: 'string', description: '字幕 ID', required: true },
    },
  },
  {
    name: 'list_captions',
    description: '列出所有字幕及其详情',
    parameters: {},
  },

  // ===== 选择操作 =====
  {
    name: 'select_element',
    description: '选中指定元素（可用于预览或后续操作）',
    parameters: {
      id: { type: 'string', description: '元素 ID', required: true },
    },
  },
  {
    name: 'deselect_all',
    description: '取消所有选中',
    parameters: {},
  },

  // ===== 轨道优化 =====
  {
    name: 'optimize_track_layout',
    description: '优化轨道布局，将选中或指定元素尽量排到同一轨道，减少轨道占用',
    parameters: {
      ids: { type: 'array', description: '元素 ID 数组，不传则优化选中的元素' },
    },
  },

  // ===== 时间对齐与排列 =====
  {
    name: 'align_start_time',
    description: '将选中元素的开始时间对齐。mode: "first"(对齐到最早元素)、"last"(对齐到最晚元素)、"current"(对齐到当前播放时间)',
    parameters: {
      mode: { type: 'string', description: '对齐模式: first/last/current', enum: ['first', 'last', 'current'] },
      ids: { type: 'array', description: '元素 ID 数组，不传则处理选中的元素' },
    },
  },
  {
    name: 'space_evenly',
    description: '将选中元素在时间轴上均匀排列（首尾保持原位）',
    parameters: {
      ids: { type: 'array', description: '元素 ID 数组，不传则处理选中的元素' },
    },
  },

  // ===== 帧动画 =====
  {
    name: 'list_frames',
    description: '列出元素的帧动画关键帧（默认选中元素）',
    parameters: {
      id: { type: 'string', description: '元素 ID，不传则使用选中元素' },
    },
  },
  {
    name: 'add_frame',
    description: '为元素添加一个关键帧（默认选中元素）。新帧的 startTime 相对于元素开始时间。属性不填则继承上一帧的值',
    parameters: {
      id: { type: 'string', description: '元素 ID，不传则使用选中元素' },
      startTime: { type: 'number', description: '帧时间（秒，相对于元素 startTime）', required: true },
      x: { type: 'number', description: 'X 坐标' },
      y: { type: 'number', description: 'Y 坐标' },
      width: { type: 'number', description: '宽度' },
      height: { type: 'number', description: '高度' },
      alpha: { type: 'number', description: '透明度 0-1' },
      rotation: { type: 'number', description: '旋转角度（弧度）' },
      scale: { type: 'number', description: '缩放比例' },
    },
  },
  {
    name: 'delete_frame',
    description: '删除元素的一个关键帧',
    parameters: {
      id: { type: 'string', description: '元素 ID，不传则使用选中元素' },
      frameId: { type: 'string', description: '关键帧 ID', required: true },
    },
  },
  {
    name: 'animate_element',
    description: '创建过渡动画。不传id则应用到所有选中元素。如"从左飞到右"只需指定起始和结束的 x 坐标',
    parameters: {
      id: { type: 'string', description: '元素 ID，不传则使用选中元素' },
      from: { type: 'object', description: '起始状态，如 {"x": 0, "alpha": 0}', required: true },
      to: { type: 'object', description: '结束状态，如 {"x": 1920, "alpha": 1}', required: true },
    },
  },
  {
    name: 'animate_shake',
    description: '创建抖动/震动动画。不传id则应用到所有选中元素。适用于"抖动""震动""晃动"等效果',
    parameters: {
      id: { type: 'string', description: '元素 ID，不传则使用选中元素' },
      duration: { type: 'number', description: '抖动持续总时长（秒），默认使用元素 duration' },
      intensity: { type: 'number', description: '抖动强度（像素偏移量），默认 10' },
      frequency: { type: 'number', description: '每秒抖动次数，默认 8' },
      axis: { type: 'string', description: '抖动方向: x(水平), y(垂直), both(双向默认)', enum: ['x', 'y', 'both'] },
    },
  },
  {
    name: 'set_frames',
    description: '设置帧动画。不传id则应用到所有选中元素。传入完整的 frames 数组，id 会自动生成',
    parameters: {
      id: { type: 'string', description: '元素 ID，不传则使用选中元素' },
      frames: {
        type: 'array',
        description: '关键帧数组，每个元素包含：startTime(必填,秒), x, y, width, height, alpha(0-1), rotation(弧度), scale, textScale, textColor, textBgColor, textBorderColor, maskX, maskY, maskWidth, maskHeight, maskBlur, maskRotation, maskAlpha, intensity, volume。id 字段会自动生成无需填写',
        required: true,
      },
    },
  },

  // ===== 视频元素操作 =====
  {
    name: 'split_element',
    description: '在指定时间位置分割元素。不传time则默认在当前播放时间分割。支持视频、音频、图片、文字等所有元素类型',
    parameters: {
      id: { type: 'string', description: '元素 ID（不传则分割选中的元素）' },
      time: { type: 'number', description: '分割时间点（秒），不传则使用当前播放时间' },
    },
  },
  {
    name: 'copy_element',
    description: '复制元素到新的轨道。新元素保持原来的开始时间，自动分配到不重叠的新轨道。count参数指定复制份数。不传id则复制所有选中的元素',
    parameters: {
      id: { type: 'string', description: '元素 ID（不传则复制选中的元素）' },
      count: { type: 'number', description: '复制份数，默认 1' },
    },
  },
  {
    name: 'move_element',
    description: '移动元素到新位置，可同时修改开始时间和轨道。不传id则移动所有选中的元素',
    parameters: {
      id: { type: 'string', description: '元素 ID（不传则移动选中的元素）' },
      startTime: { type: 'number', description: '新的开始时间（秒），不传则保持原时间' },
      trackIndex: { type: 'number', description: '新的轨道编号，不传则保持原轨道' },
    },
  },
  {
    name: 'set_element_properties',
    description: '设置视频/音频元素的专业属性。不传id则应用到所有选中元素。支持：volume(0-1音量), speed(播放速度), clipTime(裁剪起始时间,秒), fadeInTime(淡入时长,秒), fadeOutTime(淡出时长,秒), muted(是否静音), lottieSpeed(Lottie速度), flipX(水平翻转), cropSize(裁切:{x,y,width,height}), matting(抠像:{type,color,threshold})',
    parameters: {
      id: { type: 'string', description: '元素 ID（不传则应用到选中的元素）' },
      properties: { type: 'object', description: '要修改的属性对象', required: true },
    },
  },
  {
    name: 'reorder_elements',
    description: '重新排列元素的轨道顺序。将指定元素按 startTime 升序分配到连续轨道，避免重叠。不传ids则排列所有选中的元素',
    parameters: {
      ids: { type: 'array', description: '元素 ID 数组，不传则排列选中的元素' },
    },
  },
  {
    name: 'remove_elements_in_range',
    description: '批量删除指定时间范围内的所有元素',
    parameters: {
      startTime: { type: 'number', description: '起始时间（秒）', required: true },
      endTime: { type: 'number', description: '结束时间（秒）', required: true },
    },
  },
];

// ==================== Movie Context ====================

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface ElementSummary {
  id: string;
  type: string;
  name: string;
  startTime: number;
  duration: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  trackIndex?: number;
  frameCount?: number;
}

function getElementSummary(el: sdkTypes.BaseElement): ElementSummary {
  const style = (el as any).style || el.ostyle;
  const summary: ElementSummary = {
    id: el.id,
    type: el.type,
    name: el.name || '',
    startTime: el.startTime,
    duration: el.duration,
    trackIndex: el.trackIndex,
  };
  if (style) {
    if (style.x !== undefined) summary.x = style.x;
    if (style.y !== undefined) summary.y = style.y;
    if (style.width) summary.width = style.width;
    if (style.height) summary.height = style.height;
  }
  if ((el as any).text) {
    summary.text = (el as any).text;
  }
  if ((el as any).frames && (el as any).frames.length > 0) {
    summary.frameCount = (el as any).frames.length;
  }
  return summary;
}

export function getMovieContext(editor: Editor): string {
  const data = editor.data;
  if (!data) return '当前没有打开的视频项目。';

  const elements = (data.elements || []) as sdkTypes.BaseElement[];
  const captions = (data.captions || []) as sdkTypes.BaseElement[];

  const totalDuration = elements.length > 0
    ? Math.max(...elements.map((e: sdkTypes.BaseElement) => e.startTime + e.duration))
    : data.duration || 0;

  const parts: string[] = [];
  parts.push(`视频尺寸: ${data.width}x${data.height}`);
  parts.push(`总时长: ${formatTime(totalDuration)} 秒`);
  parts.push(`标题: ${data.title || '无'}`);

  if (elements.length > 0) {
    parts.push(`\n元素列表 (共 ${elements.length} 个):`);
    elements.forEach((el, i) => {
      const s = getElementSummary(el);
      parts.push(
        `  [${i}] id="${s.id}" type="${s.type}" name="${s.name}" ` +
        `时间=${formatTime(s.startTime)}-${formatTime(s.startTime + s.duration)} ` +
        `位置=(${s.x ?? 'auto'},${s.y ?? 'auto'}) 尺寸=${s.width ?? 'auto'}x${s.height ?? 'auto'}` +
        (s.text ? ` 文字="${s.text}"` : ''),
      );
    });
  } else {
    parts.push('\n当前没有元素。');
  }

  if (captions.length > 0) {
    parts.push(`\n字幕 (共 ${captions.length} 条):`);
    captions.forEach((cap: any, i) => {
      parts.push(
        `  [${i}] id="${cap.id}" 文字="${cap.text}" ` +
        `时间=${formatTime(cap.startTime)}-${formatTime(cap.startTime + cap.duration)}`,
      );
    });
  }

  return parts.join('\n');
}

// ==================== System Prompt ====================

export function getSystemPrompt(editor: Editor): string {
  const context = getMovieContext(editor);
  const stateInfo = [
    `播放状态: ${editor.playing ? '正在播放' : '已暂停'}`,
    `当前时间: ${formatTime(editor.currentTime || 0)}`,
  ].join('\n');

  // 选中元素的详细信息
  let selectedInfo = '';
  const selectedIds = editor.selectedElementIds || [];
  if (selectedIds.length > 0) {
    const selectedElems = selectedIds
      .map(id => findElement(editor, id))
      .filter(Boolean) as sdkTypes.BaseElement[];
    if (selectedElems.length > 0) {
      selectedInfo = `\n当前选中的元素 (${selectedElems.length} 个，操作时不传 id 即可批处理):\n` + selectedElems.map((el, i) => {
        const s = getElementSummary(el);
        const detail: string[] = [];
        if (s.text) detail.push(`文字="${s.text}"`);
        const style = (el as any).style || el.ostyle;
        if (style?.rotation !== undefined) detail.push(`旋转=${style.rotation.toFixed(3)} rad`);
        if (style?.alpha !== undefined) detail.push(`透明度=${style.alpha}`);
        return `  [${i}] id="${s.id}" type="${s.type}" name="${s.name}" ` +
          `时间=${formatTime(s.startTime)}-${formatTime(s.startTime + s.duration)} ` +
          `位置=(${s.x ?? 'auto'},${s.y ?? 'auto'}) 尺寸=${s.width ?? 'auto'}x${s.height ?? 'auto'}` +
          (s.frameCount ? ` 帧动画:${s.frameCount}帧` : '') +
          (detail.length > 0 ? ' ' + detail.join(' ') : '');
      }).join('\n');

      // 如果有帧动画，附加帧详情
      const firstWithFrames = selectedElems.find(el => (el as any).frames?.length > 0);
      if (firstWithFrames) {
        const frames = (firstWithFrames as any).frames as any[];
        selectedInfo += '\n  帧动画详情:\n' + frames.map((f: any) =>
          `    id="${f.id}" time=${formatTime(f.startTime)}` +
          (f.x !== undefined ? ` x=${f.x}` : '') +
          (f.y !== undefined ? ` y=${f.y}` : '') +
          (f.alpha !== undefined ? ` alpha=${f.alpha}` : '') +
          (f.rotation !== undefined ? ` rotation=${f.rotation}` : '') +
          (f.scale !== undefined ? ` scale=${f.scale}` : '') +
          (f.width !== undefined ? ` size=${f.width}x${f.height || ''}` : ''),
        ).join('\n');
      }
    }
  }

  const toolsDesc = TOOLS.map(t => {
    const params = Object.entries(t.parameters)
      .map(([k, v]) => `  - ${k}${v.required ? '(必填)' : '(选填)'}: ${v.type} - ${v.description}`)
      .join('\n');
    return `### ${t.name}\n${t.description}\n参数:\n${params}`;
  }).join('\n\n');

  return `你是一个视频剪辑 AI 助手，你必须直接操作当前视频项目，而不是只给出建议或计划。

【最高优先级规则】你必须使用 <tool_calls> 标签调用工具来执行操作。禁止只回复文字描述计划而不调用工具。如果用户要求你做任何视频编辑操作，你必须立即生成 tool_calls 执行，而不是先说"我将..."再等下一轮。

当前项目状态:
${context}

编辑器状态:
${stateInfo}${selectedInfo}

工具调用格式（必须严格遵守）:

多个工具调用必须用 JSON 数组格式，括号包裹：
<tool_calls>
[{"name": "工具名", "args": {参数对象}}, {"name": "工具名2", "args": {参数对象}}]
</tool_calls>

单个工具调用直接放一个对象：
<tool_calls>
{"name": "工具名", "args": {参数对象}}
</tool_calls>

可用的工具:

${toolsDesc}

规则:
1. 【最重要】每次回复必须包含 tool_calls 来实际执行操作，禁止只回复文字而不调用工具。
2. 多个工具调用必须用 [{...}, {...}] 数组格式，不要用 {...}, {...} 逗号分隔。
3. tool_calls 内必须是合法 JSON，不要添加任何注释或非 JSON 内容。
4. 先获取需要的信息（如 list_elements、list_captions、get_element_detail），再做修改。
5. 【重要】如果用户说"选中的""这些""它们""全部"等词，调用工具时不要传 id 参数，系统会自动应用到所有选中的元素。只有用户明确指定某个特定元素时才传 id。
6. 生成文字元素时，默认字体大小为 48，白色，位置居中于画面。
7. 旋转角度使用弧度（Math.PI 单位），如旋转 90 度 = Math.PI/2 = 1.5708。
8. 添加字幕时，默认放在画面底部居中位置，字体为 siYuanHeiTi。
9. 帧动画的 startTime 相对于元素自己的 startTime，如元素开始于 5s，帧 startTime=0 表示 5s 处。
10. 对于复杂自定义动画（如弹跳、波浪、脉冲、翻转等），使用 set_frames 直接传入完整的 frames 数组。FrameItem 可包含以下字段：
    必填: startTime(秒, 相对于元素开始时间)
    位置/尺寸: x, y, width, height
    变换: rotation(弧度), scale(缩放倍数,1=原始), alpha(0-1透明度)
    文字: textScale, textColor(#hex), textBgColor, textBorderColor
    遮罩: maskX, maskY, maskWidth, maskHeight, maskBlur, maskRotation, maskAlpha
    特效: intensity(强度), volume(音量)
    id 字段会自动生成，无需你填写。帧之间的值会自动补间。
    示例 - 弹跳动画(从上方掉落回弹):
    [{"startTime":0,"y":-200,"alpha":0},{"startTime":0.5,"y":-20,"alpha":1},{"startTime":1,"y":0,"alpha":1}]
    示例 - 缩放脉冲(先放大再缩小):
    [{"startTime":0,"scale":1},{"startTime":0.25,"scale":1.8},{"startTime":0.5,"scale":1},{"startTime":0.75,"scale":1.3},{"startTime":1,"scale":1}]
11. 抖动/震动/晃动效果使用 animate_shake，不要逐个添加关键帧。
12. 完成工具调用后，用自然语言向用户总结你做了哪些操作。
13. 如果用户要求的事情不需要调用工具，直接回复即可。
14. 复杂任务应在一次回复中生成全部 tool_calls，例如"复制元素5份然后修改属性"应连续输出：先调用 get_element_detail 获取信息，然后调用 copy_element，接着调用 set_element_properties 修改新元素的属性。
15. 分割视频时，如果用户说"在这里剪一刀""从这里切开"之类的话，先 seek_to 到当前时间再调用 split_element。
16. 复制元素会保持原来的开始时间并分配到新轨道。使用 count 参数一次复制多份：copy_element(count=5)。如需放到特定时间位置，请用 move_element。
17. 调整音量、速度、淡入淡出等专业属性使用 set_element_properties。
18. 批量删除某段范围内的内容使用 remove_elements_in_range。
19.【重要】增量操作使用 modify_element + relative。step 模式偏移量 = step*(i+1)，i 是排序索引从 0 开始。注意 alpha 范围 0~1。
   - "开始时间依次增加0.1秒" → modify_element(relative=true, step=0.1, properties={"startTime": 0})，第1个元素+0.1，第2个+0.2
   - "透明度依次减少0.2" → modify_element(relative=true, step=-0.2, properties={"alpha": 0})，第1个-0.2，第2个-0.4
   - step 模式下 properties 中的数值不重要，实际偏移量 = step * (排序位置+1)
20.【残影/拖尾效果】当用户要求添加残影时，按步骤执行：
   ① get_element_detail 获取原元素信息
   ② copy_element(count=N) 复制 N 份（副本自动选中）
   ③ modify_element(relative=true, step=0.1, properties={"startTime": 0})
   ④ modify_element(relative=true, step=-0.2, properties={"alpha": 0})
   ⑤ modify_element(relative=true, step=-0.1, properties={"duration": 0})（保持尾部对齐）`;
}

// ==================== Tool Executor ====================

interface ToolCallResult {
  success: boolean;
  message: string;
  data?: any;
}

function nextId(): string {
  return `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function executeToolCall(
  editor: Editor,
  toolName: string,
  args: Record<string, any>,
): Promise<ToolCallResult> {
  const data = editor.data;
  if (!data) return { success: false, message: '没有打开的视频项目' };

  try {
    switch (toolName) {
      case 'list_elements': {
        const elements = (data.elements || []) as sdkTypes.BaseElement[];
        return {
          success: true,
          message: `共 ${elements.length} 个元素`,
          data: elements.map(getElementSummary),
        };
      }

      case 'get_element_detail': {
        const el = resolveOneElement(editor, args.id);
        if (!el) return { success: false, message: '未找到元素，请指定 ID 或先选中元素' };
        const summary = getElementSummary(el);
        const detail: Record<string, any> = { ...summary };
        const style = (el as any).style || el.ostyle;
        if (style) {
          detail.alpha = style.alpha;
          detail.rotation = style.rotation;
        }
        if ((el as any).textStyle) {
          detail.textStyle = (el as any).textStyle;
        }
        return { success: true, message: '元素详情', data: detail };
      }

      case 'add_text_element': {
        if (!args.text || !args.startTime || !args.duration) {
          return { success: false, message: '缺少必填参数: text, startTime, duration' };
        }
        const initStyle = {
          x: args.x ?? data.width / 2,
          y: args.y ?? data.height / 2,
        };
        if (args.rotation) {
          (initStyle as any).rotation = args.rotation;
        }

        const element: any = {
          id: nextId(),
          type: 'text',
          name: args.text.slice(0, 20),
          text: args.text,
          startTime: Number(args.startTime),
          duration: Number(args.duration),
          trackIndex: getNextTrackIndex(editor),
          ostyle: { ...initStyle },
          style: { ...initStyle },
          textStyle: {
            fontSize: args.fontSize ?? 48,
            fill: args.color ?? '#ffffff',
            fontFamily: args.fontFamily ?? 'Arial',
            fontWeight: args.bold ? 'bold' : 'normal',
            align: 'center',
          },
          _dirty: String(Date.now()),
          _textStyleDirty: String(Date.now()),
        };
        data.elements.push(element);
        editor.updateMovie();
        return {
          success: true,
          message: `已添加文字元素: "${args.text.slice(0, 30)}" (id: ${element.id})`,
          data: { id: element.id },
        };
      }

      case 'delete_element': {
        const targetIds = getTargetIds(editor, args.id);
        if (targetIds.length === 0) return { success: false, message: '请指定要删除的元素 ID，或先选中元素' };
        const removed: string[] = [];
        targetIds.forEach(tid => {
          const idx = data.elements.findIndex((el: any) => el.id === tid);
          if (idx !== -1) {
            removed.push(data.elements[idx].name || tid);
            data.elements.splice(idx, 1);
          }
        });
        if (removed.length === 0) return { success: false, message: '没有找到可删除的元素' };
        editor.updateMovie();
        editor.setContorlAndSelectedElemenent([]);
        return { success: true, message: `已删除 ${removed.length} 个元素: ${removed.join(', ')}` };
      }

      case 'modify_element': {
        if (!args.properties) {
          return { success: false, message: '缺少必填参数: properties' };
        }
        const targetIds = getTargetIds(editor, args.id);
        if (targetIds.length === 0) return { success: false, message: '请指定元素 ID，或先选中元素' };
        const props = args.properties;
        const isRelative = args.relative === true;
        const hasStep = isRelative && typeof args.step === 'number' && args.step !== 0;
        const allChanged: string[] = [];

        // step 模式：按 startTime 排序，建立 id → 索引映射
        let stepIndexMap: Map<string, number> | null = null;
        if (hasStep) {
          const sorted = targetIds
            .map(tid => findElement(editor, tid))
            .filter(Boolean) as sdkTypes.BaseElement[];
          sorted.sort((a, b) => a.startTime - b.startTime || (a.trackIndex ?? 0) - (b.trackIndex ?? 0));
          stepIndexMap = new Map(sorted.map((el, i) => [el.id, i]));
        }

        targetIds.forEach(tid => {
          const el = findElement(editor, tid);
          if (!el) return;
          const target = el as any;
          const changed: string[] = [];
          const stepIdx = stepIndexMap?.get(tid) ?? 0;

          const styleKeys = ['x', 'y', 'width', 'height', 'rotation', 'alpha'];

          if (hasStep) {
            // step 模式：所有数值属性按 step * (i+1) 依次递增
            const stepOffset = args.step * (stepIdx + 1);
            styleKeys.forEach(k => {
              if (props[k] !== undefined) {
                if (!target.style) target.style = {};
                const cur = target.style[k] ?? ((el as any).ostyle?.[k] ?? (k === 'alpha' ? 1 : 0));
                target.style[k] = cur + stepOffset;
                if (k === 'alpha') target.style[k] = Math.max(0, Math.min(1, target.style[k]));
                changed.push(k);
              }
            });
            // startTime 也使用 step * (i+1)
            if (props.startTime !== undefined) {
              target.startTime = (target.startTime ?? 0) + stepOffset;
              changed.push('startTime');
            }
            // duration 也使用 step * (i+1)
            if (props.duration !== undefined) {
              target.duration = (target.duration ?? 0) + stepOffset;
              changed.push('duration');
            }
          } else {
            // 常规模式：相对/绝对
            styleKeys.forEach(k => {
              if (props[k] !== undefined) {
                if (!target.style) target.style = {};
                if (isRelative) {
                  target.style[k] = (target.style[k] ?? ((el as any).ostyle?.[k] ?? (k === 'alpha' ? 1 : 0))) + Number(props[k]);
                } else {
                  target.style[k] = Number(props[k]);
                }
                if (k === 'alpha') target.style[k] = Math.max(0, Math.min(1, target.style[k]));
                changed.push(k);
              }
            });

            if (props.startTime !== undefined) {
              if (isRelative) {
                target.startTime = (target.startTime ?? 0) + Number(props.startTime);
              } else {
                target.startTime = Number(props.startTime);
              }
              changed.push('startTime');
            }
            if (props.duration !== undefined) {
              if (isRelative) {
                target.duration = (target.duration ?? 0) + Number(props.duration);
              } else {
                target.duration = Number(props.duration);
              }
              changed.push('duration');
            }
          }

          // 文字属性
          if (props.text !== undefined && target.text !== undefined) {
            target.text = String(props.text);
            target._textStyleDirty = String(Date.now());
            changed.push('text');
          }

          if (changed.length > 0) {
            target._dirty = String(Date.now());
            allChanged.push(`${tid}: ${changed.join(', ')}`);
          }
        });

        if (allChanged.length === 0) return { success: false, message: '没有可修改的属性' };
        editor.updateMovie();
        return { success: true, message: `已修改 ${allChanged.length} 个元素`, data: allChanged };
      }

      case 'set_movie_size': {
        if (!args.width || !args.height) {
          return { success: false, message: '缺少必填参数: width, height' };
        }
        data.width = Number(args.width);
        data.height = Number(args.height);
        editor.updateMovie();
        return { success: true, message: `视频尺寸已改为 ${args.width}x${args.height}` };
      }

      // ===== 播放控制 =====
      case 'play': {
        await editor.play();
        return { success: true, message: '已开始播放' };
      }

      case 'pause': {
        editor.pause();
        return { success: true, message: '已暂停播放' };
      }

      case 'seek_to': {
        if (args.time === undefined) return { success: false, message: '缺少参数: time' };
        const t = Number(args.time);
        editor.updateMovie(t);
        return { success: true, message: `已跳转到 ${formatTime(t)}` };
      }

      // ===== 字幕操作 =====
      case 'add_caption': {
        if (!args.text) return { success: false, message: '缺少参数: text' };
        await editor.addCaption(String(args.text), args.index !== undefined ? Number(args.index) : undefined);
        return { success: true, message: `已添加字幕: "${String(args.text).slice(0, 30)}"` };
      }

      case 'delete_caption': {
        if (!args.id) return { success: false, message: '缺少参数: id' };
        const capExists = data.captions?.find((c: any) => c.id === args.id);
        if (!capExists) return { success: false, message: `未找到字幕: ${args.id}` };
        editor.deleteCaption(String(args.id));
        return { success: true, message: `已删除字幕: "${capExists.text?.slice(0, 20) || args.id}"` };
      }

      case 'list_captions': {
        const captions = (data.captions || []) as any[];
        const list = captions.map((cap: any, i: number) => ({
          index: i,
          id: cap.id,
          text: cap.text,
          startTime: cap.startTime,
          endTime: cap.startTime + cap.duration,
          duration: cap.duration,
        }));
        return {
          success: true,
          message: `共 ${captions.length} 条字幕`,
          data: list,
        };
      }

      // ===== 选择操作 =====
      case 'select_element': {
        if (!args.id) return { success: false, message: '缺少参数: id' };
        const el = findElement(editor, args.id);
        if (!el) return { success: false, message: `未找到元素: ${args.id}` };
        editor.setContorlAndSelectedElemenent([String(args.id)]);
        return { success: true, message: `已选中元素: "${el.name || el.id}"` };
      }

      case 'deselect_all': {
        editor.setContorlAndSelectedElemenent([]);
        return { success: true, message: '已取消所有选中' };
      }

      // ===== 轨道优化 =====
      case 'optimize_track_layout': {
        let elems: sdkTypes.BaseElement[];
        if (args.ids && Array.isArray(args.ids)) {
          elems = (data.elements || []).filter((e: any) => args.ids.includes(e.id));
        } else {
          const selectedIds = getTargetIds(editor);
          elems = selectedIds.length > 0
            ? (data.elements || []).filter((e: any) => selectedIds.includes(e.id))
            : (data.elements || []) as sdkTypes.BaseElement[];
        }
        if (elems.length === 0) return { success: false, message: '没有可优化的元素，请先选中或指定元素' };
        editor.optimizeTrack(elems);
        editor.updateTimeline();
        return { success: true, message: `已优化 ${elems.length} 个元素的轨道布局` };
      }

      // ===== 时间对齐与排列 =====
      case 'align_start_time': {
        const ids = args.ids && Array.isArray(args.ids) ? args.ids : getTargetIds(editor);
        if (ids.length < 2) return { success: false, message: '至少需要 2 个元素才能对齐，请选中多个元素' };
        const elems = ids.map((tid: string) => findElement(editor, tid)).filter(Boolean);
        if (elems.length < 2) return { success: false, message: '有效元素不足 2 个' };

        let targetTime: number;
        const mode = args.mode || 'first';
        switch (mode) {
          case 'last':
            targetTime = Math.max(...elems.map((e: any) => e.startTime));
            break;
          case 'current':
            targetTime = editor.currentTime || 0;
            break;
          default: // first
            targetTime = Math.min(...elems.map((e: any) => e.startTime));
        }

        elems.forEach((el: any) => {
          el.startTime = targetTime;
          el._dirty = String(Date.now());
        });
        editor.updateMovie();
        editor.updateTimeline();
        return { success: true, message: `已将 ${elems.length} 个元素的开始时间对齐到 ${formatTime(targetTime)}` };
      }

      case 'space_evenly': {
        const ids = args.ids && Array.isArray(args.ids) ? args.ids : getTargetIds(editor);
        if (ids.length < 2) return { success: false, message: '至少需要 2 个元素才能排列，请选中多个元素' };
        const elems = ids
          .map((tid: string) => findElement(editor, tid))
          .filter(Boolean)
          .sort((a: any, b: any) => a.startTime - b.startTime);
        if (elems.length < 2) return { success: false, message: '有效元素不足 2 个' };

        const first = elems[0].startTime;
        const last = elems[elems.length - 1].startTime;
        const step = (last - first) / (elems.length - 1);

        elems.forEach((el: any, i: number) => {
          el.startTime = first + step * i;
          el._dirty = String(Date.now());
        });
        editor.updateMovie();
        editor.updateTimeline();
        return { success: true, message: `已将 ${elems.length} 个元素在时间轴上均匀排列` };
      }

      // ===== 帧动画 =====
      case 'list_frames': {
        const el = resolveOneElement(editor, args.id);
        if (!el) return { success: false, message: '未找到元素，请先选中或指定 ID' };
        const frames = ((el as any).frames || []) as any[];
        const list = frames.map((f: any, i: number) => ({
          index: i,
          id: f.id,
          startTime: f.startTime,
          x: f.x,
          y: f.y,
          width: f.width,
          height: f.height,
          alpha: f.alpha,
          rotation: f.rotation,
          scale: f.scale,
        }));
        return {
          success: true,
          message: `元素 "${el.name || el.id}" 共 ${frames.length} 个关键帧`,
          data: list,
        };
      }

      case 'add_frame': {
        if (args.startTime === undefined) return { success: false, message: '缺少必填参数: startTime' };
        const el = resolveOneElement(editor, args.id);
        if (!el) return { success: false, message: '未找到元素，请先选中或指定 ID' };
        if (!(el as any).frames) (el as any).frames = [];
        const frames = (el as any).frames;

        const frame: any = {
          id: nextId(),
          startTime: Number(args.startTime),
        };
        // 拷贝上一帧的未传入属性
        const sorted = [...frames].sort((a: any, b: any) => a.startTime - b.startTime);
        let prev: any = null;
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (sorted[i].startTime <= frame.startTime) { prev = sorted[i]; break; }
        }
        if (!prev) prev = sorted[sorted.length - 1] || (el as any).style || (el as any).ostyle || {};
        const propKeys = ['x', 'y', 'width', 'height', 'alpha', 'rotation', 'scale'];
        propKeys.forEach(k => {
          if (args[k] !== undefined) {
            frame[k] = Number(args[k]);
          } else if (prev[k] !== undefined) {
            frame[k] = prev[k];
          }
        });

        frames.push(frame);
        (el as any)._dirty = String(Date.now());
        editor.updateMovie();
        return {
          success: true,
          message: `已为元素 "${el.name || el.id}" 添加关键帧 (id: ${frame.id}, time: ${formatTime(frame.startTime)})`,
          data: { frameId: frame.id },
        };
      }

      case 'delete_frame': {
        if (!args.frameId) return { success: false, message: '缺少必填参数: frameId' };
        const el = resolveOneElement(editor, args.id);
        if (!el) return { success: false, message: '未找到元素，请先选中或指定 ID' };
        const frames = (el as any).frames as any[];
        if (!frames || frames.length === 0) return { success: false, message: '该元素没有关键帧' };
        const idx = frames.findIndex((f: any) => f.id === args.frameId);
        if (idx === -1) return { success: false, message: `未找到关键帧: ${args.frameId}` };
        frames.splice(idx, 1);
        (el as any)._dirty = String(Date.now());
        editor.updateMovie();
        return { success: true, message: `已删除关键帧: ${args.frameId}` };
      }

      case 'animate_element': {
        if (!args.from || !args.to) return { success: false, message: '缺少必填参数: from, to' };
        const targets = resolveElements(editor, args.id);
        if (targets.length === 0) return { success: false, message: '未找到元素，请先选中或指定 ID' };

        const from = args.from;
        const to = args.to;
        const animKeys = ['x', 'y', 'width', 'height', 'alpha', 'rotation', 'scale'];

        targets.forEach(el => {
          const startFrame: any = { id: nextId(), startTime: 0 };
          const endFrame: any = { id: nextId(), startTime: el.duration };
          animKeys.forEach(k => {
            if (from[k] !== undefined) startFrame[k] = Number(from[k]);
            if (to[k] !== undefined) endFrame[k] = Number(to[k]);
          });
          const currentStyle = (el as any).style || (el as any).ostyle || {};
          animKeys.forEach(k => {
            if (endFrame[k] === undefined && currentStyle[k] !== undefined) {
              endFrame[k] = currentStyle[k];
            }
          });
          (el as any).frames = [startFrame, endFrame];
          (el as any)._dirty = String(Date.now());
        });

        editor.updateMovie();
        const descParts = animKeys.filter(k => from[k] !== undefined || to[k] !== undefined)
          .map(k => `${k}: ${from[k] ?? '-'} → ${to[k] ?? '-'}`);
        return { success: true, message: `已为 ${targets.length} 个元素创建过渡动画 (${descParts.join(', ')})` };
      }

      case 'animate_shake': {
        const targets = resolveElements(editor, args.id);
        if (targets.length === 0) return { success: false, message: '未找到元素，请先选中或指定 ID' };

        const intensity = Number(args.intensity) || 10;
        const frequency = Number(args.frequency) || 8;
        const axis = args.axis || 'both';
        let totalFrames = 0;
        let totalDuration = 0;

        targets.forEach(el => {
          const shakeDuration = Number(args.duration) || el.duration;
          totalDuration = shakeDuration;
          const frameCount = Math.max(2, Math.round(shakeDuration * frequency));
          totalFrames = frameCount;

          const frames: any[] = [];
          frames.push({ id: nextId(), startTime: 0 });
          for (let i = 1; i <= frameCount; i++) {
            const t = i * (shakeDuration / frameCount);
            const sign = i % 2 === 0 ? 1 : -1;
            const decay = 1 - (i / frameCount) * 0.7;
            const offset = sign * intensity * decay;
            const frame: any = { id: nextId(), startTime: Math.round(t * 100) / 100 };
            if (axis === 'x' || axis === 'both') frame.x = offset;
            if (axis === 'y' || axis === 'both') frame.y = offset;
            frames.push(frame);
          }
          frames.push({ id: nextId(), startTime: shakeDuration });
          (el as any).frames = frames;
          (el as any)._dirty = String(Date.now());
        });

        editor.updateMovie();
        return {
          success: true,
          message: `已为 ${targets.length} 个元素创建抖动动画: ${totalFrames + 2} 帧, 持续 ${totalDuration}s, 强度 ${intensity}px`,
        };
      }

      case 'set_frames': {
        if (!Array.isArray(args.frames) || args.frames.length === 0) {
          return { success: false, message: '缺少必填参数: frames(非空数组)' };
        }
        const targets = resolveElements(editor, args.id);
        if (targets.length === 0) return { success: false, message: '未找到元素，请先选中或指定 ID' };

        targets.forEach(el => {
          const frames = args.frames.map((f: any) => ({
            id: f.id || nextId(),
            startTime: Number(f.startTime),
            ...Object.fromEntries(
              ['x', 'y', 'width', 'height', 'alpha', 'rotation', 'scale',
                'textScale', 'textColor', 'textBgColor', 'textBorderColor',
                'maskX', 'maskY', 'maskWidth', 'maskHeight', 'maskBlur', 'maskRotation', 'maskAlpha',
                'intensity', 'volume',
              ].map(k => f[k] !== undefined ? [k, typeof f[k] === 'number' ? f[k] : f[k]] : [])
                .filter(([_, v]) => v !== undefined),
            ),
          }));
          (el as any).frames = frames;
          (el as any)._dirty = String(Date.now());
        });

        editor.updateMovie();
        return {
          success: true,
          message: `已为 ${targets.length} 个元素设置 ${args.frames.length} 个关键帧`,
        };
      }

      // ===== 视频元素操作 =====
      case 'split_element': {
        const targetIds = getTargetIds(editor, args.id);
        if (targetIds.length !== 1) return { success: false, message: '请指定一个要分割的元素，或只选中一个元素' };
        const el = findElement(editor, targetIds[0]);
        if (!el) return { success: false, message: '未找到要分割的元素' };

        const splitTime = args.time !== undefined ? Number(args.time) : editor.currentTime;
        const { startTime, duration, type } = el as any;
        const avgSpeed = (el as any).speed ?? 1;
        const elementEndTime = startTime + duration / avgSpeed;

        if (splitTime <= startTime || splitTime >= elementEndTime) {
          return { success: false, message: `分割点必须在元素时间范围内 (${formatTime(startTime)}-${formatTime(elementEndTime)})` };
        }

        const duration1 = (splitTime - startTime) * avgSpeed;
        const duration2 = duration - duration1;
        const startTime2 = splitTime;
        const clipTime2 = ['video', 'audio'].includes(type) ? ((el as any).clipTime || 0) + duration1 : 0;

        // 分割元素1（原元素）的 duration
        (el as any).duration = duration1;

        // 创建元素2
        const elementData2 = utils.toJS(el) as any;
        elementData2.id = utils.createID();
        elementData2.startTime = startTime2;
        elementData2.duration = duration2;
        if (elementData2.clipTime !== undefined) {
          elementData2.clipTime = clipTime2;
        }

        // 分割关键帧
        if (el.frames && el.frames.length) {
          const splitFrameState = editor.movie.getFrameStatus(el, duration1);

          const frames1: any[] = [];
          const frames2: any[] = [];

          for (const f of el.frames) {
            if (f.startTime < duration1) {
              frames1.push(utils.toJS(f));
            } else if (f.startTime > duration1) {
              const adjusted = utils.toJS(f);
              adjusted.startTime = adjusted.startTime - duration1;
              frames2.push(adjusted);
            }
          }

          // 在分割点插入关键帧
          if (splitFrameState) {
            const splitFrame1: any = { id: utils.createID(), startTime: duration1 };
            const splitFrame2: any = { id: utils.createID(), startTime: 0 };
            for (const key of Object.keys(splitFrameState)) {
              if (key !== 'id' && key !== 'startTime') {
                splitFrame1[key] = (splitFrameState as any)[key];
                splitFrame2[key] = (splitFrameState as any)[key];
              }
            }
            frames1.push(splitFrame1);
            frames2.push(splitFrame2);
          }

          frames1.sort((a, b) => a.startTime - b.startTime);
          frames2.sort((a, b) => a.startTime - b.startTime);

          (el as any).frames = frames1;
          elementData2.frames = frames2;
        }

        // 分割动画
        if ((el as any).animates && (el as any).animates.length) {
          const anim1: any[] = [];
          const anim2: any[] = [];
          (el as any).animates.forEach((anim: any) => {
            const { start, duration: animDur } = anim;
            if (start + animDur <= duration1) {
              anim1.push(anim);
            } else if (start < duration1 && start + animDur > duration1) {
              const a1 = utils.toJS(anim);
              const a2 = utils.toJS(anim);
              a1.duration = duration1 - start;
              a2.duration = start + animDur - duration1;
              a2.start = duration1;
              anim1.push(a1);
              anim2.push(a2);
            } else {
              const adj = utils.toJS(anim);
              adj.start -= duration1;
              anim2.push(adj);
            }
          });
          (el as any).animates = anim1;
          (el as any)._animationDirty = String(Date.now());
          elementData2.animates = anim2;
          elementData2._animationDirty = String(Date.now());
        }

        // 分割曲线变速
        if ((el as any).curveSpeed) {
          const relativeTime = (splitTime - startTime) * avgSpeed;
          const res = speedHelper.getSpeedByRelative(relativeTime / (el as any).duration, el as any);
          const [line1, line2] = speedHelper.splitPoints(res.cx, (el as any).curveSpeedLines);
          (el as any).curveSpeedLines = line1;
          elementData2.curveSpeed = true;
          elementData2.curveSpeedLines = line2;
          elementData2.curveSpeedName = 'custom';
        }

        // 插入新元素
        if (type === 'caption') {
          data.captions.push(elementData2);
        } else if (type === 'camera') {
          data.cameras.push(elementData2);
        } else {
          data.elements.push(elementData2);
        }

        (el as any)._dirty = String(Date.now());
        elementData2._dirty = String(Date.now());

        editor.setSelectedElementIds([elementData2.id]);
        editor.updateMovie();
        editor.updateTimeline();
        return {
          success: true,
          message: `已在 ${formatTime(splitTime)} 处分割元素 "${el.name || el.id}"，新元素 id: ${elementData2.id}`,
          data: { originalId: el.id, newId: elementData2.id },
        };
      }

      case 'copy_element': {
        const targetIds = getTargetIds(editor, args.id);
        if (targetIds.length === 0) return { success: false, message: '请指定要复制的元素 ID，或先选中元素' };
        const count = Math.max(1, Math.min(20, Number(args.count) || 1));

        const newIds: string[] = [];
        const allArrays = [data.elements, data.captions, data.cameras] as any[][];

        for (const tid of targetIds) {
          let sourceElem: any = null;
          let sourceArray: any[] | null = null;
          for (const arr of allArrays) {
            const found = arr.find((e: any) => e.id === tid);
            if (found) {
              sourceElem = found;
              sourceArray = arr;
              break;
            }
          }
          if (!sourceElem || !sourceArray) continue;

          for (let n = 0; n < count; n++) {
            const cloned = utils.toJS(sourceElem) as any;
            cloned.id = utils.createID();
            cloned.startTime = sourceElem.startTime;
            cloned._dirty = String(Date.now());

            // 分配小数子轨道：源 trackIndex 例如 1，副本为 1.1, 1.2, 1.3 ...
            // 副本数 >= 10 时用两位小数：1.01, 1.02 ...
            const baseTrack = sourceElem.trackIndex ?? 1;
            const padLen = count >= 10 ? String(count).length : 1;
            cloned.trackIndex = baseTrack + (n + 1) / Math.pow(10, padLen);

            // 重新生成 frames id
            if (cloned.frames) {
              cloned.frames.forEach((f: any) => { f.id = utils.createID(); });
            }
            // 重新生成 animates id
            if (cloned.animates) {
              cloned.animates.forEach((a: any) => { a.id = utils.createID(); });
            }

            sourceArray.push(cloned);
            newIds.push(cloned.id);
          }
        }

        if (newIds.length === 0) return { success: false, message: '没有可复制的元素' };

        editor.setSelectedElementIds(newIds);
        editor.updateMovie();
        editor.updateTimeline();
        return {
          success: true,
          message: `已复制 ${newIds.length} 个元素（${count} 份）`,
          data: { newIds },
        };
      }

      case 'move_element': {
        const targetIds = getTargetIds(editor, args.id);
        if (targetIds.length === 0) return { success: false, message: '请指定要移动的元素 ID，或先选中元素' };

        let movedCount = 0;
        targetIds.forEach(tid => {
          const el = findElement(editor, tid);
          if (!el) return;
          if (args.startTime !== undefined) {
            (el as any).startTime = Number(args.startTime);
          }
          if (args.trackIndex !== undefined) {
            (el as any).trackIndex = Number(args.trackIndex);
          }
          (el as any)._dirty = String(Date.now());
          movedCount++;
        });

        if (movedCount === 0) return { success: false, message: '没有可移动的元素' };
        editor.updateMovie();
        editor.updateTimeline();
        return { success: true, message: `已移动 ${movedCount} 个元素` };
      }

      case 'set_element_properties': {
        if (!args.properties) return { success: false, message: '缺少必填参数: properties' };
        const targetIds = getTargetIds(editor, args.id);
        if (targetIds.length === 0) return { success: false, message: '请指定元素 ID，或先选中元素' };
        const props = args.properties;
        const changedElems: string[] = [];

        targetIds.forEach(tid => {
          const el = findElement(editor, tid) as any;
          if (!el) return;
          let hasChange = false;

          // 音量
          if (props.volume !== undefined && ['video', 'audio'].includes(el.type)) {
            el.volume = Math.max(0, Math.min(1, Number(props.volume)));
            hasChange = true;
          }
          // 播放速度
          if (props.speed !== undefined && ['video', 'audio', 'image'].includes(el.type)) {
            el.speed = Math.max(0.1, Number(props.speed));
            hasChange = true;
          }
          // 裁剪起始时间
          if (props.clipTime !== undefined && ['video', 'audio'].includes(el.type)) {
            el.clipTime = Number(props.clipTime);
            hasChange = true;
          }
          // 淡入
          if (props.fadeInTime !== undefined && ['video', 'audio'].includes(el.type)) {
            el.fadeInTime = Number(props.fadeInTime);
            hasChange = true;
          }
          // 淡出
          if (props.fadeOutTime !== undefined && ['video', 'audio'].includes(el.type)) {
            el.fadeOutTime = Number(props.fadeOutTime);
            hasChange = true;
          }
          // 静音
          if (props.muted !== undefined && ['video', 'audio'].includes(el.type)) {
            el.muted = Boolean(props.muted);
            hasChange = true;
          }
          // Lottie 速度
          if (props.lottieSpeed !== undefined && el.type === 'lottie') {
            el.lottieSpeed = Number(props.lottieSpeed);
            hasChange = true;
          }
          // 水平翻转
          if (props.flipX !== undefined && el.type === 'image') {
            el.flipX = Number(props.flipX);
            hasChange = true;
          }
          // 裁切
          if (props.cropSize !== undefined && ['video', 'image'].includes(el.type)) {
            const cs = props.cropSize;
            el.cropSize = {
              x: Number(cs.x),
              y: Number(cs.y),
              width: Number(cs.width),
              height: Number(cs.height),
            };
            hasChange = true;
          }
          // 抠像
          if (props.matting !== undefined && ['video', 'image'].includes(el.type)) {
            el.matting = {
              type: props.matting.type || 'chroma',
              color: props.matting.color || '#00ff00',
              threshold: Number(props.matting.threshold) || 0.1,
            };
            hasChange = true;
          }
          // 图片播放速度
          if (props.imageSpeed !== undefined && el.type === 'image') {
            el.imageSpeed = Number(props.imageSpeed);
            hasChange = true;
          }

          if (hasChange) {
            el._dirty = String(Date.now());
            changedElems.push(el.name || el.id);
          }
        });

        if (changedElems.length === 0) return { success: false, message: '没有可修改的兼容属性' };
        editor.updateMovie();
        return {
          success: true,
          message: `已修改 ${changedElems.length} 个元素的属性: ${changedElems.join(', ')}`,
        };
      }

      case 'reorder_elements': {
        let elems: sdkTypes.BaseElement[];
        if (args.ids && Array.isArray(args.ids)) {
          elems = (data.elements || []).filter((e: any) => args.ids.includes(e.id));
        } else {
          const selectedIds = getTargetIds(editor);
          elems = selectedIds.length > 0
            ? (data.elements || []).filter((e: any) => selectedIds.includes(e.id))
            : (data.elements || []) as sdkTypes.BaseElement[];
        }
        if (elems.length === 0) return { success: false, message: '没有可排列的元素' };

        // 按 startTime 升序排列
        const sorted = [...elems].sort((a, b) => a.startTime - b.startTime);

        // 从起始 trackIndex 开始连续分配轨道，检查重叠
        const startTrackIdx = sorted[0].trackIndex;
        const trackEndTimes = new Map<number, number>();

        for (const elem of sorted) {
          const speed = (elem as any).speed ?? 1;
          const actualDuration = elem.duration / speed;
          const endTime = elem.startTime + actualDuration;

          let placed = false;
          let tryTrack = startTrackIdx;
          while (!placed) {
            const lastEnd = trackEndTimes.get(tryTrack) ?? 0;
            if (elem.startTime >= lastEnd) {
              elem.trackIndex = tryTrack;
              trackEndTimes.set(tryTrack, endTime);
              placed = true;
            } else {
              tryTrack++;
            }
          }
          (elem as any)._dirty = String(Date.now());
        }

        editor.updateMovie();
        editor.updateTimeline();
        return { success: true, message: `已重排 ${elems.length} 个元素的轨道，避免重叠` };
      }

      case 'remove_elements_in_range': {
        const rangeStart = Number(args.startTime);
        const rangeEnd = Number(args.endTime);
        if (rangeStart >= rangeEnd) return { success: false, message: 'startTime 必须小于 endTime' };

        const allElements = [...(data.elements || []), ...(data.captions || []), ...(data.cameras || [])] as any[];
        const toRemove = allElements.filter((el: any) => {
          const elEnd = el.startTime + el.duration;
          // 元素与时间范围有重叠
          return el.startTime < rangeEnd && elEnd > rangeStart;
        });

        if (toRemove.length === 0) {
          return { success: true, message: '指定时间范围内没有元素' };
        }

        const removeIds = toRemove.map((el: any) => el.id);
        const removedNames: string[] = [];

        // 从各数组中删除
        const arrays = [
          { arr: data.elements, label: '元素' },
          { arr: data.captions, label: '字幕' },
          { arr: data.cameras, label: '镜头' },
        ];
        for (const { arr } of arrays) {
          if (!arr) continue;
          for (let i = arr.length - 1; i >= 0; i--) {
            if (removeIds.includes((arr[i] as any).id)) {
              removedNames.push((arr[i] as any).name || (arr[i] as any).id);
              arr.splice(i, 1);
            }
          }
        }

        editor.setContorlAndSelectedElemenent([]);
        editor.updateMovie();
        editor.updateTimeline();
        return {
          success: true,
          message: `已删除时间范围 ${formatTime(rangeStart)}-${formatTime(rangeEnd)} 内的 ${removedNames.length} 个元素`,
          data: { removedCount: removedNames.length },
        };
      }

      default: {
        return { success: false, message: `未知工具: ${toolName}` };
      }
    }
  } catch (e: any) {
    return { success: false, message: `执行失败: ${e?.message || e}` };
  }
}

// ==================== Parsing ====================

interface ParsedToolCall {
  name: string;
  args: Record<string, any>;
}

/**
 * 从 AI 回复中解析 tool_calls JSON
 */
export function parseToolCalls(content: string): { text: string; calls: ParsedToolCall[] } {
  const calls: ParsedToolCall[] = [];
  let text = content;

  console.log('[parseToolCalls] 原始回复长度:', content?.length, '前200字:', content?.slice(0, 200));

  // 匹配 <tool_calls>...</tool_calls> 块（可能包裹在 markdown 代码块中）
  const regex = /(?:```(?:xml|json|html)?\s*)?<tool_calls>\s*([\s\S]*?)\s*<\/tool_calls>(?:\s*```)?/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    try {
      const inner = match[1].trim();
      console.log('[parseToolCalls] 匹配到 tool_calls, 内容:', inner.slice(0, 200));

      // 尝试解析：数组格式
      if (inner.startsWith('[')) {
        const arr = JSON.parse(inner);
        arr.forEach((item: any) => {
          if (item.name && item.args) {
            calls.push({ name: item.name, args: item.args });
          }
        });
      } else if (inner.startsWith('{')) {
        // 可能是单个对象，或多个对象用 }, { 分隔
        // 先尝试包装成数组
        try {
          const arr = JSON.parse(`[${inner}]`);
          arr.forEach((item: any) => {
            if (item.name && item.args) {
              calls.push({ name: item.name, args: item.args });
            }
          });
        } catch {
          // 包装成数组也失败，尝试作为单个对象
          const obj = JSON.parse(inner);
          if (obj.name && obj.args) {
            calls.push({ name: obj.name, args: obj.args });
          }
        }
      }
    } catch (e) {
      console.warn('[parseToolCalls] JSON 解析失败:', e);
    }
  }

  // 移除 tool_calls 块 — 必须用全新正则，避免 lastIndex 状态影响
  text = text.replace(/(?:```(?:xml|json|html)?\s*)?<tool_calls>[\s\S]*?<\/tool_calls>(?:\s*```)?/g, '').trim();

  return { text, calls };
}

// ==================== Helpers ====================

function findElement(editor: Editor, id: string): sdkTypes.BaseElement | undefined {
  return editor.data?.elements?.find((el: any) => el.id === id) as sdkTypes.BaseElement | undefined;
}

function getNextTrackIndex(editor: Editor): number {
  const elements = editor.data?.elements || [];
  if (elements.length === 0) return 0;
  const maxTrack = Math.max(...elements.map((e: any) => Number(e.trackIndex) || 0));
  return maxTrack + 1;
}

// 获取目标元素 ID 列表：优先用传入 id，否则用选中的元素
function getTargetIds(editor: Editor, id?: string): string[] {
  if (id) return [id];
  return [...editor.selectedElementIds];
}

// 获取单个目标元素：优先用传入 id，否则取第一个选中的元素
function resolveOneElement(editor: Editor, id?: string): sdkTypes.BaseElement | undefined {
  if (id) return findElement(editor, id);
  const selected = editor.selectedElementIds;
  if (selected.length === 0) return undefined;
  return findElement(editor, selected[0]);
}

// 获取目标元素列表：优先用传入 id，否则用所有选中的元素
function resolveElements(editor: Editor, id?: string): sdkTypes.BaseElement[] {
  if (id) {
    const el = findElement(editor, id);
    return el ? [el] : [];
  }
  return editor.selectedElementIds
    .map(sid => findElement(editor, sid))
    .filter(Boolean) as sdkTypes.BaseElement[];
}

// ==================== 命令拆分 ====================

interface SplitResult {
  splittable: boolean;
  commands: string[];
}

/**
 * 本地规则拆分：基于中文连接词和标点切分命令
 * 处理常见模式，避免依赖外部 AI 调用
 */
function localSplitCommand(command: string): string[] | null {
  // 去掉首尾空白
  const trimmed = command.trim();
  if (!trimmed) return null;

  // 定义命令动词前缀，用于判断拆分后的片段是否是一个独立命令
  const cmdVerbs = /^(把|在|给|让|删|添|复|修|移|调|选|取|设|更|增|减|翻转?|旋转?|缩放?|播放?|暂停?|导出?|保存?|分割?|合并|添加|删除|修改|调整|设置|移动|复制|粘贴|选中|取消|全屏|导出|下载|上传|替换|裁剪|放大|缩小|加速|减速|反转|倒放|静音|恢复|重命名|排序)/;

  // 步骤1：用"然后/接着/之后/再/最后/并/并且"拆分
  const seqDelimiters = /(?:然后|接着|之后|最后|再|并(?:且)?)(?=\s*[，,]?\s*)/g;

  const matches = trimmed.match(seqDelimiters);
  if (matches) {
    const parts = trimmed
      .split(seqDelimiters)
      .map(s => s.replace(/^[，,]\s*/, '').trim())
      .filter(s => s.length >= 3);

    if (parts.length >= 2 && parts.every(p => cmdVerbs.test(p) || p.length >= 6)) {
      console.log('[localSplit] 按连接词拆分:', parts);
      return parts;
    }
  }

  // 步骤2：用中文逗号拆分（仅当每个片段都有动词前缀时）
  const commaParts = trimmed
    .split(/[，,]/)
    .map(s => s.trim())
    .filter(s => s.length >= 3);

  if (commaParts.length >= 2 && commaParts.every(p => cmdVerbs.test(p) || p.length >= 6)) {
    console.log('[localSplit] 按逗号拆分:', commaParts);
    return commaParts;
  }

  return null;
}

/**
 * 分析用户命令是否可以拆分为多个子命令
 * 优先使用本地规则拆分，失败时通过 AI 判断
 */
export async function splitUserCommand(
  apiServer: any,
  userCommand: string,
): Promise<SplitResult> {
  // 1. 尝试本地规则拆分
  const localCommands = localSplitCommand(userCommand);
  if (localCommands) {
    return { splittable: true, commands: localCommands };
  }

  // 2. 本地拆分失败，使用 AI 拆分
  console.log('[splitUserCommand] 本地拆分失败，使用 AI 拆分...');
  const systemPrompt = `你是一个视频编辑命令分析器。分析用户输入的命令，按执行顺序拆分为多个有序的子任务。

规则：
1. 子命令按执行顺序排列，后续步骤可以依赖前序步骤的结果
2. 每个子命令应当是一个具体的操作描述（动词+对象+参数）
3. 如果只有一个简单任务，返回 splittable=false

输出格式（严格 JSON，不要包含其他文字）：
{"splittable": true, "commands": ["子命令1", "子命令2", "子命令3"]}
或
{"splittable": false, "commands": []}

示例1: "选中元素复制5份，开始时间依次增加0.2秒，透明度依次减少20%，让这些元素的结束时间和选中元素的结束时间保持一致"
→ {"splittable": true, "commands": ["复制选中元素5次到新轨道", "修改复制元素的开始时间，开始时间依次增加0.2秒", "修改复制元素的透明度，透明度依次减少20%", "修改复制元素的结束时间，结束时间和选中元素保持一致"]}

示例2: "在画面中间添加一行文字Hello，然后在上面加一个大标题World"
→ {"splittable": true, "commands": ["在画面中间添加一行文字Hello", "在画面上方添加大标题World"]}

示例3: "添加文字你好"
→ {"splittable": false, "commands": []}`;

  try {
    const [res, err] = await apiServer.openAiChat({
      model: DEFAULT_LLM_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userCommand },
      ],
    });

    if (err) {
      console.warn('[splitUserCommand] AI 拆分 API 错误:', err);
      return { splittable: false, commands: [] };
    }

    const content: string = res?.choices?.[0]?.message?.content || res?.content || '';
    console.log('[splitUserCommand] AI 返回:', content);

    // 尝试匹配 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.splittable && Array.isArray(parsed.commands) && parsed.commands.length > 0) {
        console.log('[splitUserCommand] AI 拆分成功:', parsed.commands);
        return { splittable: true, commands: parsed.commands };
      }
    }

    return { splittable: false, commands: [] };
  } catch (e) {
    console.warn('[splitUserCommand] AI 拆分失败:', e);
    return { splittable: false, commands: [] };
  }
}
