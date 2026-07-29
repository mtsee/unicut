// 检测是否为谷歌浏览器
export function isChrome() {
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
}

export function isEdgeBrowser() {
  const isEdge = /Edg(e)?\/|Edge\//i.test(navigator.userAgent);
  return isEdge;
}

// 获取谷歌浏览器的版本号
export function getChromeVersion() {
  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// 检查谷歌浏览器版本是否大于98
export function isChromeVersionGreaterThan(ver: number) {
  if (isMobile()) {
    return false;
  }
  if (isEdgeBrowser()) {
    return false;
  }
  const chromeVersion = getChromeVersion();
  return chromeVersion && chromeVersion > ver;
}

/**
 * 判断是否为移动端设备（基于 User-Agent）
 * @returns {boolean} true=移动端，false=PC端
 */
export function isMobile() {
  // 正则匹配移动端特征关键词
  const mobileReg = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|Windows Phone/i;
  // 获取浏览器的用户代理字符串
  //@ts-ignore
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return mobileReg.test(userAgent);
}
