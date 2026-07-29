const { minify } = require('terser');
const fs = require('fs');
const path = require('path');

function mkdirPath(p) {
  let url = path.join(__dirname, p);
  if (!fs.existsSync(url)) {
    fs.mkdirSync(url);
  }
}

async function minscript({ input, output, beforeRun }) {
  let code = fs.readFileSync(input, 'utf8');
  if (beforeRun) {
    code = beforeRun(code);
  }
  const result = await minify(code, {
    // 压缩配置 - 重中之重
    compress: {
      drop_console: true, // ✅ 核心开关：彻底移除所有 console 语句
      drop_debugger: true, // ✅ 顺带移除 debugger 断点语句（开发必加）
      pure_funcs: ['console.log', 'console.info'], // 【可选】精准指定要移除的console方法，和drop_console二选一即可
    },
    format: {
      comments: false, // 移除所有注释（版权注释可以单独配置保留）
    },
    sourceMap: false, // 是否生成map文件，生产环境关闭，调试环境开启为 true
  });
  fs.writeFileSync(output, result.code, 'utf8');
}

async function main() {
  // 创建目录
  // mkdirPath('dist/assets/mp4box-min');
  // 打包JS
  minscript({
    input: 'public/worker/decode.worker.js',
    output: 'public/assets/worker/decode.worker.js',
  });
  minscript({
    input: 'public/worker/demuxer.worker.js',
    output: 'public/assets/worker/demuxer.worker.js',
  });
  minscript({
    input: 'public/worker/mp4box.all.js',
    output: 'public/assets/worker/mp4box.all.js',
  });
}

main();
