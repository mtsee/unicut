class WebGL2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!this.gl) {
      throw new Error('WebGL not supported');
    }

    // 状态管理
    this.stateStack = [];
    this.currentState = {
      transform: [1, 0, 0, 1, 0, 0], // 2D变换矩阵 [a, b, c, d, tx, ty]
      fillStyle: '#000000',
      globalAlpha: 1.0,
    };

    // 初始化WebGL
    this._initShaders();
    this._initBuffers();
    this._resizeCanvas();

    // 默认设置
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    // window.addEventListener('resize', () => this._resizeCanvas());
  }

  // ========== 初始化方法 ==========
  _initShaders() {
    // 顶点着色器
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      uniform mat3 u_transform;
      varying vec2 v_texCoord;
      
      void main() {
        vec3 pos = u_transform * vec3(a_position, 1);
        gl_Position = vec4(pos.xy, 0, 1);
        v_texCoord = a_texCoord;
      }
    `;

    // 片段着色器
    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform vec4 u_color;
      uniform sampler2D u_image;
      uniform bool u_useTexture;
      uniform float u_globalAlpha;
      
      void main() {
        if (u_useTexture) {
          gl_FragColor = texture2D(u_image, v_texCoord) * u_globalAlpha;
        } else {
          gl_FragColor = u_color * u_globalAlpha;
        }
      }
    `;

    this.program = this._createProgram(vertexShaderSource, fragmentShaderSource);
    this.gl.useProgram(this.program);

    // 获取uniform和attribute位置
    this.uniformLocations = {
      transform: this.gl.getUniformLocation(this.program, 'u_transform'),
      color: this.gl.getUniformLocation(this.program, 'u_color'),
      useTexture: this.gl.getUniformLocation(this.program, 'u_useTexture'),
      image: this.gl.getUniformLocation(this.program, 'u_image'),
      globalAlpha: this.gl.getUniformLocation(this.program, 'u_globalAlpha'),
    };

    this.attribLocations = {
      position: this.gl.getAttribLocation(this.program, 'a_position'),
      texCoord: this.gl.getAttribLocation(this.program, 'a_texCoord'),
    };
  }

  _createProgram(vsSource, fsSource) {
    const gl = this.gl;

    const vertexShader = this._compileShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this._compileShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('Program link error: ' + gl.getProgramInfoLog(program));
    }

    return program;
  }

  _compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('Shader compile error: ' + error);
    }

    return shader;
  }

  _initBuffers() {
    const gl = this.gl;

    // 位置缓冲区
    this.positionBuffer = gl.createBuffer();

    // 纹理坐标缓冲区
    this.texCoordBuffer = gl.createBuffer();

    // 索引缓冲区（用于绘制两个三角形组成矩形）
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 1, 2, 3]), gl.STATIC_DRAW);
  }

  _resizeCanvas() {
    // const devicePixelRatio = 1; // window.devicePixelRatio || 1;
    // this.canvas.width = this.canvas.width * devicePixelRatio;
    // this.canvas.height = this.canvas.height * devicePixelRatio;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  // ========== 公共API方法 ==========
  save() {
    // 深拷贝当前状态
    this.stateStack.push({
      transform: [...this.currentState.transform],
      fillStyle: this.currentState.fillStyle,
      globalAlpha: this.currentState.globalAlpha,
    });
  }

  restore() {
    if (this.stateStack.length > 0) {
      this.currentState = this.stateStack.pop();
    }
  }

  translate(x, y) {
    const [a, b, c, d, tx, ty] = this.currentState.transform;
    this.currentState.transform = [a, b, c, d, tx + x, ty + y];
  }

  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const [a, b, c, d, tx, ty] = this.currentState.transform;

    this.currentState.transform = [a * cos + c * sin, b * cos + d * sin, c * cos - a * sin, d * cos - b * sin, tx, ty];
  }

  set fillStyle(color) {
    this.currentState.fillStyle = color;
  }

  get fillStyle() {
    return this.currentState.fillStyle;
  }

  set globalAlpha(alpha) {
    this.currentState.globalAlpha = alpha;
  }

  get globalAlpha() {
    return this.currentState.globalAlpha;
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  fillRect(x, y, width, height) {
    const gl = this.gl;

    // 设置顶点数据
    const positions = new Float32Array([x, y, x + width, y, x, y + height, x + width, y + height]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // 设置纹理坐标（虽然不使用纹理，但着色器需要）
    const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    // 设置uniform
    this._updateTransform();
    this._updateColor();
    gl.uniform1i(this.uniformLocations.useTexture, false);
    gl.uniform1f(this.uniformLocations.globalAlpha, this.currentState.globalAlpha);

    // 绘制
    this._drawElements();
  }

  async drawImage(image, dx, dy, dWidth, dHeight) {
    const gl = this.gl;

    // 创建纹理（如果尚未创建）
    if (!this.texture) {
      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
    image = await createImageBitmap(image);
    console.log('image.format', image);

    // 上传图像数据到纹理
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // 设置顶点数据
    const positions = new Float32Array([dx, dy, dx + dWidth, dy, dx, dy + dHeight, dx + dWidth, dy + dHeight]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // 设置纹理坐标
    const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    // 设置uniform
    this._updateTransform();
    gl.uniform1i(this.uniformLocations.useTexture, true);
    gl.uniform1f(this.uniformLocations.globalAlpha, this.currentState.globalAlpha);

    // 绘制
    this._drawElements();
  }

  // ========== 辅助方法 ==========
  _updateTransform() {
    const [a, b, c, d, tx, ty] = this.currentState.transform;
    const transformMatrix = new Float32Array([a, c, tx, b, d, ty, 0, 0, 1]);

    this.gl.uniformMatrix3fv(this.uniformLocations.transform, false, transformMatrix);
  }

  _updateColor() {
    const color = this._hexToRgb(this.currentState.fillStyle);
    this.gl.uniform4f(this.uniformLocations.color, color.r, color.g, color.b, 1.0);
  }

  _drawElements() {
    const gl = this.gl;

    // 启用属性
    gl.enableVertexAttribArray(this.attribLocations.position);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.attribLocations.position, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(this.attribLocations.texCoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(this.attribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);

    // 绘制
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  _hexToRgb(hex) {
    // 移除#号
    hex = hex.replace('#', '');

    // 处理缩写形式如 #FFF
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    // 解析RGB值并归一化到0-1范围
    const bigint = parseInt(hex, 16);
    return {
      r: ((bigint >> 16) & 255) / 255,
      g: ((bigint >> 8) & 255) / 255,
      b: (bigint & 255) / 255,
    };
  }
}
