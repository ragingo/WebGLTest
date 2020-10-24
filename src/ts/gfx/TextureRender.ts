import { Graphics } from "./core/Graphics";
import { IDrawable } from "./core/IDrawable";
import { ShaderLoader } from "./core/ShaderLoader";
import { ShaderProgram } from "./core/ShaderProgram";
import { TextureDrawInfo } from "./TextureDrawInfo";

export class TextureRender implements IDrawable {
  private gl: WebGLRenderingContext | null = null;
  private isShaderLoaded = false;
  private shaderProgram: ShaderProgram | null = null;
  private isProcessing = false;

  public texture: WebGLTexture | null = null;

  constructor(public readonly textureDrawInfo: TextureDrawInfo = new TextureDrawInfo()) {}

  getContext() {
    return this.gl;
  }

  setContext(gl: WebGLRenderingContext | null) {
    this.gl = gl;
  }

  onBeginDraw() {
    if (!this.isShaderLoaded) {
      this.loadShader().then((r) => {
        if (r) {
          this.isShaderLoaded = true;
          this.isProcessing = false;
        }
      });
    }
  }

  onDraw() {
    if (!this.gl) {
      return;
    }
    if (!this.shaderProgram?.program) {
      return;
    }
    if (!this.texture) {
      return;
    }

    const gl = this.gl;
    const program = this.shaderProgram.program;

    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const uniformLocation = {
      scale: gl.getUniformLocation(program, 'scale'),
      rotatoin: gl.getUniformLocation(program, 'rotation'),
      sampler: gl.getUniformLocation(program, 'uSampler'),
      effectType: gl.getUniformLocation(program, 'effectType'),
      textureSize: gl.getUniformLocation(program, 'textureSize'),
      editColor: gl.getUniformLocation(program, 'editColor'),
      vividParams: gl.getUniformLocation(program, 'vividParams')
    };

    // テクスチャ登録
    gl.uniform1i(uniformLocation.sampler, 0);

    if (uniformLocation.scale) {
      gl.uniform3fv(uniformLocation.scale, this.textureDrawInfo.scale);
    }
    if (uniformLocation.rotatoin) {
      gl.uniform3fv(uniformLocation.rotatoin, this.textureDrawInfo.rotation);
    }
    if (uniformLocation.textureSize) {
      gl.uniform2fv(uniformLocation.textureSize, [this.textureDrawInfo.width, this.textureDrawInfo.height]);
    }
    if (uniformLocation.editColor) {
      gl.uniform4fv(uniformLocation.editColor, this.textureDrawInfo.color);
    }
    if (uniformLocation.vividParams) {
      gl.uniform2fv(uniformLocation.vividParams, this.textureDrawInfo.vivid);
    }
    gl.uniform1i(uniformLocation.effectType, this.textureDrawInfo.effectType);

    const tex_w = 512.0;
    const tex_h = 512.0;
    const texCoords = [
      { left: 0, top: 0, width: 256, height: 256 },
      { left: 0, top: 256, width: 256, height: 256 },
      { left: 256, top: 0, width: 256, height: 256 },
      { left: 256, top: 256, width: 256, height: 256 }
    ];

    // 遊び要素として、ただポリゴン数を後ろから削るだけ
    for (let i = 0; i < 4 - this.textureDrawInfo.polygonCount; i++) {
      texCoords.pop();
    }

    // 頂点バッファ更新
    const vertices = [];
    for (let i = 0; i < texCoords.length; i++) {
      const tc = texCoords[i];
      const tmp_pos = {
        left: (tc.left / tex_w) * 2.0 - 1.0,
        top: (tc.top / tex_h) * 2.0 - 1.0,
        width: (tc.width / tex_w) * 2.0 - 1.0,
        height: (tc.height / tex_h) * 2.0 - 1.0,
        right: ((tc.left + tc.width) / tex_w) * 2.0 - 1.0,
        bottom: ((tc.top + tc.height) / tex_h) * 2.0 - 1.0
      };
      const tmp_texCoord = {
        left: tc.left / tex_w,
        top: tc.top / tex_h,
        width: tc.width / tex_w,
        height: tc.height / tex_h,
        right: (tc.left + tc.width) / tex_w,
        bottom: (tc.top + tc.height) / tex_h
      };
      const pos = [
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
      const texCoord = [
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
    const indexData = [0, 1, 2, 1, 3, 2];
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Graphics.createIndexBuffer(gl, indexData));

    vertices.forEach((vertex) => {
      if (!program) {
        return;
      }
      const vbo_array = [
        {
          buffer: Graphics.createVertexBuffer(gl, vertex.pos),
          location: gl.getAttribLocation(program, 'position'),
          stride: 3
        },
        {
          buffer: Graphics.createVertexBuffer(gl, vertex.texCoord),
          location: gl.getAttribLocation(program, 'texCoord'),
          stride: 2
        }
      ];
      vbo_array.forEach((item) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
        gl.enableVertexAttribArray(item.location);
        gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
      });
      gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
    });
  }

  onEndDraw() {}

  private async loadShader() {
    if (this.isProcessing) {
      return false;
    }
    this.isProcessing = true;

    const loader = await ShaderLoader.loadAsync('./glsl/texture_edit_vs.glsl', './glsl/texture_edit_fs.glsl');
    if (!loader.success) {
      console.log('shader load failed.');
      return false;
    }

    if (!this.gl) {
      return false;
    }

    this.shaderProgram = new ShaderProgram(this.gl);
    if (!this.shaderProgram.compile(loader.vs, loader.fs)) {
      console.log('shader compile failed.');
      return false;
    }

    if (!this.shaderProgram.program) {
      console.log('webgl program is null.');
      return false;
    }

    return true;
  }
}
