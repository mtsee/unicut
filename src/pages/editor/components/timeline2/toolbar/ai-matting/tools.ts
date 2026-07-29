export function drawPNG(img, { width, height }) {
  // 创建一个 Canvas 元素
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");

  // 设置 Canvas 尺寸与图片尺寸相同
  canvas.width = width;
  canvas.height = height;

  // 在 Canvas 上绘制图片
  ctx.drawImage(img, 0, 0);

  // 获取图像的像素数据
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;

  // 寻找非透明像素的边界
  var minX = width;
  var minY = height;
  var maxX = -1;
  var maxY = -1;

  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  // 计算新的 Canvas 尺寸
  var newWidth = maxX - minX + 1;
  var newHeight = maxY - minY + 1;

  // 创建新的 Canvas
  var newCanvas = document.createElement("canvas");
  var newCtx = newCanvas.getContext("2d");
  newCanvas.width = newWidth;
  newCanvas.height = newHeight;

  // 在新的 Canvas 上绘制裁剪后的图像
  newCtx.drawImage(
    img,
    minX,
    minY,
    newWidth,
    newHeight,
    0,
    0,
    newWidth,
    newHeight
  );
  var imageDataURL = newCanvas.toDataURL("image/png");
  downImage(imageDataURL);
}

// 下载
export function downImage(imageDataURL) {
  // 创建一个链接元素，并设置其属性
  var downloadLink = document.createElement("a");
  downloadLink.href = imageDataURL;
  downloadLink.download = "output.png";
  // 将链接元素添加到文档中
  document.body.appendChild(downloadLink);
  // 模拟点击下载链接
  downloadLink.click();
  downloadLink.remove();
}

// 羽化边缘函数
export function featherEdge(data, width, height, featherSize) {
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var alpha = data[(y * width + x) * 4 + 3];

      if (alpha > 0) {
        for (var i = 1; i <= featherSize; i++) {
          var distance = i / featherSize;
          var alphaValue = alpha * (1 - distance * distance);

          // 模拟羽化效果，根据距离调整透明度
          data[((y - i) * width + x - i) * 4 + 3] += alphaValue;
          data[((y - i) * width + x) * 4 + 3] += alphaValue;
          data[((y - i) * width + x + i) * 4 + 3] += alphaValue;

          data[(y * width + x - i) * 4 + 3] += alphaValue;
          data[(y * width + x + i) * 4 + 3] += alphaValue;

          data[((y + i) * width + x - i) * 4 + 3] += alphaValue;
          data[((y + i) * width + x) * 4 + 3] += alphaValue;
          data[((y + i) * width + x + i) * 4 + 3] += alphaValue;
        }
      }
    }
  }
}

// 边缘缩小函数
export function shrinkEdge(data, width, height, shrinkSize) {
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      var alpha = data[(y * width + x) * 4 + 3];

      if (alpha > 0) {
        // 缩小边缘
        if (
          x < shrinkSize ||
          x >= width - shrinkSize ||
          y < shrinkSize ||
          y >= height - shrinkSize
        ) {
          data[(y * width + x) * 4 + 3] = 0;
        }
      }
    }
  }
}

// 抗锯齿处理函数
export function applyAntialiasing(ctx) {
  // 获取图像的像素数据
  var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  var data = imageData.data;

  // 通过平均值滤波来模拟抗锯齿效果
  for (var y = 1; y < ctx.canvas.height - 1; y++) {
    for (var x = 1; x < ctx.canvas.width - 1; x++) {
      var red = 0;
      var green = 0;
      var blue = 0;
      var alpha = 0;

      // 计算周围 9 个像素的平均值
      for (var offsetY = -1; offsetY <= 1; offsetY++) {
        for (var offsetX = -1; offsetX <= 1; offsetX++) {
          var pixelIndex =
            ((y + offsetY) * ctx.canvas.width + (x + offsetX)) * 4;
          red += data[pixelIndex];
          green += data[pixelIndex + 1];
          blue += data[pixelIndex + 2];
          alpha += data[pixelIndex + 3];
        }
      }
      // 计算平均值
      red /= 9;
      green /= 9;
      blue /= 9;
      alpha /= 9;

      // 更新当前像素的值
      var currentIndex = (y * ctx.canvas.width + x) * 4;
      data[currentIndex] = red;
      data[currentIndex + 1] = green;
      data[currentIndex + 2] = blue;
      data[currentIndex + 3] = alpha;
    }
  }

  // 将修改后的图像数据放回 Canvas
  ctx.putImageData(imageData, 0, 0);
}
