class TextureRender implements IDrawable {
  private _textureDrawInfo: TextureDrawInfo;
  public get textureDrawInfo(): TextureDrawInfo {
    return this._textureDrawInfo;
  }
  public set textureDrawInfo(v: TextureDrawInfo) {
    this._textureDrawInfo = v;
  }

  constructor() {
    this._textureDrawInfo = new TextureDrawInfo();
  }

  getContext(): WebGLRenderingContext | null {
    return this.gl;
  }

  setContext(gl: WebGLRenderingContext | null): void {
    this.gl = gl;
  }

  onBeginDraw(): void {
    if (!this.m_ShaderLoaded) {
      this.loadShader().then((r) => {
        if (r) {
          this.m_ShaderLoaded = true;
          this.m_Processing = false;
        }
      });
    }
    if (!this.m_TextureLoaded) {
      this.loadTexture().then((r2) => {});
    }
  }

  onDraw(): void {
    if (!this.m_TextureLoaded) {
      return;
    }
    if (!this.gl) {
      return;
    }
    if (!this.program) {
      return;
    }

    let gl = this.gl;

    gl.useProgram(this.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.m_MainTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let uniformLocation = {
      scale: gl.getUniformLocation(this.program, 'scale'),
      rotatoin: gl.getUniformLocation(this.program, 'rotation'),
      sampler: gl.getUniformLocation(this.program, 'uSampler'),
      effectType: gl.getUniformLocation(this.program, 'effectType'),
      textureSize: gl.getUniformLocation(this.program, 'textureSize'),
      editColor: gl.getUniformLocation(this.program, 'editColor'),
      vividParams: gl.getUniformLocation(this.program, 'vividParams')
    };

    // テクスチャ登録
    gl.uniform1i(uniformLocation.sampler, 0);

    if (uniformLocation.scale) {
      gl.uniform3fv(uniformLocation.scale, this._textureDrawInfo.scale);
    }
    if (uniformLocation.rotatoin) {
      gl.uniform3fv(uniformLocation.rotatoin, this._textureDrawInfo.rotation);
    }
    if (uniformLocation.textureSize) {
      gl.uniform2fv(uniformLocation.textureSize, [this._textureDrawInfo.width, this._textureDrawInfo.height]);
    }
    if (uniformLocation.editColor) {
      gl.uniform4fv(uniformLocation.editColor, this._textureDrawInfo.color);
    }
    if (uniformLocation.vividParams) {
      gl.uniform2fv(uniformLocation.vividParams, this._textureDrawInfo.vivid);
    }
    gl.uniform1i(uniformLocation.effectType, this._textureDrawInfo.effectType);

    const tex_w = 512.0;
    const tex_h = 512.0;
    let texCoords = [
      { left: 0, top: 0, width: 256, height: 256 },
      { left: 0, top: 256, width: 256, height: 256 },
      { left: 256, top: 0, width: 256, height: 256 },
      { left: 256, top: 256, width: 256, height: 256 }
    ];

    // 遊び要素として、ただポリゴン数を後ろから削るだけ
    for (let i = 0; i < 4 - this._textureDrawInfo.polygonCount; i++) {
      texCoords.pop();
    }

    // 頂点バッファ更新
    let vertices = [];
    for (let i = 0; i < texCoords.length; i++) {
      let tc = texCoords[i];
      let tmp_pos = {
        left: (tc.left / tex_w) * 2.0 - 1.0,
        top: (tc.top / tex_h) * 2.0 - 1.0,
        width: (tc.width / tex_w) * 2.0 - 1.0,
        height: (tc.height / tex_h) * 2.0 - 1.0,
        right: ((tc.left + tc.width) / tex_w) * 2.0 - 1.0,
        bottom: ((tc.top + tc.height) / tex_h) * 2.0 - 1.0
      };
      let tmp_texCoord = {
        left: tc.left / tex_w,
        top: tc.top / tex_h,
        width: tc.width / tex_w,
        height: tc.height / tex_h,
        right: (tc.left + tc.width) / tex_w,
        bottom: (tc.top + tc.height) / tex_h
      };
      let pos = [
        tmp_pos.left,
        -tmp_pos.bottom,
        0,
        tmp_pos.right,
        -tmp_pos.bottom,
        0,
        tmp_pos.left,
        -tmp_pos.top,
        0,
        tmp_pos.right,
        -tmp_pos.top,
        0
      ];
      let texCoord = [
        tmp_texCoord.left,
        tmp_texCoord.bottom,
        tmp_texCoord.right,
        tmp_texCoord.bottom,
        tmp_texCoord.left,
        tmp_texCoord.top,
        tmp_texCoord.right,
        tmp_texCoord.top
      ];
      vertices.push({
        pos: pos,
        texCoord: texCoord
      });
    }

    // インデックスバッファ生成 & 登録
    let indexData = [0, 1, 2, 1, 3, 2];
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Graphics.createIndexBuffer(gl, indexData));

    vertices.forEach((vertex) => {
      if (!this.program) {
        return;
      }
      let vbo_array = [
        {
          buffer: Graphics.createVertexBuffer(gl, vertex.pos),
          location: gl.getAttribLocation(this.program, 'position'),
          stride: 3
        },
        {
          buffer: Graphics.createVertexBuffer(gl, vertex.texCoord),
          location: gl.getAttribLocation(this.program, 'texCoord'),
          stride: 2
        }
      ];
      vbo_array.forEach(function (item, idx) {
        gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
        gl.enableVertexAttribArray(item.location);
        gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
      });
      gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
    });
  }

  onEndDraw(): void {}

  private async loadShader(): Promise<boolean> {
    if (this.m_Processing) {
      return false;
    }
    this.m_Processing = true;

    let vs = await HttpUtil.getText('./glsl/texture_edit_vs.glsl');
    let fs = await HttpUtil.getText('./glsl/texture_edit_fs.glsl');
    if (!vs) {
      console.log('vs code not found.');
      return false;
    }
    if (!fs) {
      console.log('fs code not found.');
      return false;
    }
    if (!this.gl) {
      return false;
    }
    this.m_ShaderProgram = new ShaderProgram(this.gl);
    if (!this.m_ShaderProgram.compile(vs, fs)) {
      console.log('shader compile failed.');
      return false;
    }
    let program = this.m_ShaderProgram.getProgram();
    if (!program) {
      console.log('webgl program is null.');
      return false;
    }
    this.program = program;

    return true;
  }

  private async loadTexture(): Promise<boolean> {
    if (this.m_Processing) {
      return false;
    }
    this.m_Processing = true;

    let img = new Image();
    img.onload = () => {
      if (!this.gl) {
        return;
      }
      let tex = Graphics.createTexture(this.gl, img);
      if (!tex) {
        console.log('texture is null.');
        return;
      }
      this.m_MainTexture = tex;
      this.m_TextureLoaded = true;
      this.m_Processing = false;
      console.log('texture loaded.');
    };
    img.src = './res/Lenna.png';

    return true;
  }

  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private m_MainTexture: WebGLTexture | null = null;
  private m_TextureLoaded: boolean = false;
  private m_ShaderLoaded: boolean = false;
  private m_ShaderProgram: ShaderProgram | null = null;

  private m_Processing: boolean = false;
}
