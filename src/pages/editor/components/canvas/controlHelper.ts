export function getSizeFromTarget(target: HTMLDivElement): {
  top: number;
  left: number;
  width: number;
  height: number;
} {
  return {
    top: Number(target.style.top.replace('px', '')),
    left: Number(target.style.left.replace('px', '')),
    width: Number(target.style.width.replace('px', '')),
    height: Number(target.style.height.replace('px', '')),
  };
}

export function parseTransform(transformStr: string): {
  translatex: number;
  translatey: number;
  scalex: number;
  scaley: number;
  rotate: number;
} {
  const regex = /(\w+)\(([^\)]+)\)/g;
  const transformObj: any = {
    translatex: 0,
    translatey: 0,
    scalex: 1,
    scaley: 1,
    rotate: 0,
  };

  let match;
  while ((match = regex.exec(transformStr))) {
    const [, funcName, funcValue] = match;
    const values = funcValue.split(/\s*,\s*/).map(parseFloat);

    if (funcName === 'translate') {
      transformObj.translatex = values[0] || 0;
      transformObj.translatey = values[1] || 0;
    } else if (funcName === 'scale') {
      transformObj.scalex = values[0];
      transformObj.scaley = values[1] || values[0];
    } else if (funcName === 'rotate') {
      transformObj.rotate = values[0] || 0;
    }
  }

  return transformObj;
}
