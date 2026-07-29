export function fetchJSON(url: string) {
  return fetch(url)
    .then(response => {
      // 检查响应状态是否为 200-299 之间
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // 将响应数据解析为 JSON 格式
      return response.json();
    })
    .catch(error => {
      // 处理请求过程中出现的错误
      console.error('Fetch error:', error);
    });
}

/**
 * 增强版：添加容差范围判断
 * @param {number} width - 视频宽度
 * @param {number} height - 视频高度
 * @param {number} tolerance - 容差范围，默认0.05
 * @returns {object} - 包含比例和是否精确匹配的信息
 */
export function getClosestVideoRatioEnhanced(width, height, tolerance = 0.05) {
  const presetRatios = {
    '16:9': 16 / 9,
    '9:16': 9 / 16,
    '4:3': 4 / 3,
    '3:4': 3 / 4,
    '1:1': 1,
    '21:9': 21 / 9,
  };

  const actualRatio = width / height;
  let closestRatio = 'unknown';
  let minDifference = Infinity;
  let isExactMatch = false;

  for (const [ratioName, ratioValue] of Object.entries(presetRatios)) {
    const difference = Math.abs(ratioValue - actualRatio);

    if (difference < minDifference) {
      minDifference = difference;
      closestRatio = ratioName;
      isExactMatch = difference <= tolerance;
    }
  }

  return {
    ratio: closestRatio,
    exactMatch: isExactMatch,
    actualRatio: actualRatio,
    difference: minDifference,
  };
}
