/**
 * AI 模型积分扣除规则配置
 *
 * 扣费类型：
 * - token: Token 计费（按输入/输出 token 扣除积分）
 * - image: 图片生成（按分辨率扣除积分）
 * - video: 视频生成（按分辨率扣除积分）
 *
 * 模型 ID 用于匹配代码中实际使用的 model 值，如 doubao-seedream-4-5-251128
 */

// ==================== Token 计费 ====================

interface TokenPrice {
  modelName: string;
  modelIds: string[];
  provider: string;
  baseRate: number;
  billingType: 'token';
  deductions: {
    input: number;   // 输入 token 扣除积分
    output: number;  // 输出 token 扣除积分
  };
}

const tokenPrices: TokenPrice[] = [
  {
    modelName: '豆包 seed2.0',
    modelIds: ['doubao-seed-2-0'],
    provider: 'huoshan',
    baseRate: 0.001,
    billingType: 'token',
    deductions: {
      input: 1,
      output: 1,
    },
  },
];

// ==================== 图片生成计费 ====================

interface ImagePrice {
  modelName: string;
  modelIds: string[];
  provider: string;
  baseRate: number;
  billingType: 'image';
  deductions: {
    resolution: string;  // 分辨率（1k / 2k / 4k）
    credits: number;      // 扣除积分
  }[];
}

const imagePrices: ImagePrice[] = [
  {
    modelName: 'Doubao-Seedream-5.0',
    modelIds: ['doubao-seedream-5-0-pro-260628', 'doubao-seedream-5-0-260128'],
    provider: 'huoshan',
    baseRate: 1.0,
    billingType: 'image',
    deductions: [
      { resolution: '2k', credits: 6 },
      { resolution: '4k', credits: 12 },
      // lite 模型积分减半
    ],
  },
  {
    modelName: 'Doubao-Seedream-5.0-lite',
    modelIds: [],
    provider: 'huoshan',
    baseRate: 1.0,
    billingType: 'image',
    deductions: [
      { resolution: '2k', credits: 3 },
      { resolution: '4k', credits: 6 },
    ],
  },
  {
    modelName: 'Doubao-Seedream-4.5',
    modelIds: ['doubao-seedream-4-5-251128'],
    provider: 'huoshan',
    baseRate: 1.0,
    billingType: 'image',
    deductions: [
      { resolution: '2k', credits: 3 },
      { resolution: '4k', credits: 6 },
    ],
  },
  {
    modelName: 'Doubao-Seedream-4.0',
    modelIds: ['doubao-seedream-4-0-250828'],
    provider: 'huoshan',
    baseRate: 1.0,
    billingType: 'image',
    deductions: [
      { resolution: '2k', credits: 2 },
      { resolution: '4k', credits: 4 },
    ],
  },
];

// ==================== 视频生成计费 ====================

interface VideoPrice {
  modelName: string;
  modelIds: string[];
  provider: string;
  baseRate: number;
  billingType: 'video';
  deductions: {
    resolution: string;  // 分辨率（480p / 720p / 1080p / 2k / 4k）
    credits: number;      // 扣除积分
  }[];
}

const videoPrices: VideoPrice[] = [
  {
    modelName: 'Doubao-Seedance-2.0',
    modelIds: [
      'doubao-seedance-2-0-260128',
      'doubao-seedance-2-0-fast-260128',
      'doubao-seedance-2-0-mini-260615',
    ],
    provider: 'huoshan',
    baseRate: 1.0,
    billingType: 'video',
    deductions: [
      { resolution: '480p', credits: 5 },
      { resolution: '720p', credits: 10 },
      { resolution: '1080p', credits: 20 },
      { resolution: '4k', credits: 80 },
    ],
  },
  {
    modelName: 'Doubao-Seedance-1.0',
    modelIds: ['doubao-seedance-1-0-pro-250528', 'doubao-seedance-1-0-pro-fast-251015'],
    provider: 'huoshan',
    baseRate: 1.0,
    billingType: 'video',
    deductions: [
      { resolution: '480p', credits: 5 },
      { resolution: '720p', credits: 10 },
    ],
  },
];

// ==================== 类型 & 导出 ====================

export type BillingType = 'token' | 'image' | 'video';

export interface PriceConfig {
  modelName: string;
  modelIds: string[];
  provider: string;
  baseRate: number;
  billingType: BillingType;
  tokenDeductions?: { input: number; output: number };
  resolutionDeductions?: { resolution: string; credits: number }[];
}

const priceConfigs: PriceConfig[] = [
  ...tokenPrices.map(p => ({ ...p, tokenDeductions: p.deductions })),
  ...imagePrices.map(p => ({ ...p, resolutionDeductions: p.deductions })),
  ...videoPrices.map(p => ({ ...p, resolutionDeductions: p.deductions })),
];

/**
 * 根据模型 ID 查找价格配置
 * @param modelId 如 doubao-seedream-4-5-251128
 */
export function getPriceConfigById(modelId: string): PriceConfig | undefined {
  return priceConfigs.find(c => c.modelIds.includes(modelId));
}

/**
 * 归一化分辨率字符串（不区分大小写）
 */
function normalizeResolution(resolution: string): string {
  return resolution.toLowerCase();
}

/**
 * 根据模型 ID + 分辨率获取单次生成消耗积分
 * @param modelId 模型 ID
 * @param resolution 分辨率（token 计费无需传）
 */
export function getCredits(
  modelId: string,
  resolution?: string,
): number {
  const config = getPriceConfigById(modelId);
  if (!config) return 0;

  if (config.billingType === 'token' && config.tokenDeductions) {
    // Token 计费返回输出 token 积分（单次对话预估）
    return config.tokenDeductions.output;
  }

  if (resolution && config.resolutionDeductions) {
    const normalized = normalizeResolution(resolution);
    const deduction = config.resolutionDeductions.find(
      d => normalizeResolution(d.resolution) === normalized,
    );
    if (deduction) return deduction.credits;

    // 1k 未配置则使用 2k 积分
    if (normalized === '1k') {
      const fallback = config.resolutionDeductions.find(
        d => normalizeResolution(d.resolution) === '2k',
      );
      if (fallback) return fallback.credits;
    }
  }

  return 0;
}
