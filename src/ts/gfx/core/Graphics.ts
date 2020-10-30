import { IDrawable } from "./IDrawable";
import { UniformInfo } from "./types";

export class Graphics {
  private drawTargets: IDrawable[] = [];

  constructor(public readonly gl: WebGLRenderingContext) {}

  public init(width: number, height: number) {
    this.gl.viewport(0, 0, width, height);

    // アルファブレンドの有効化
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    // 深度テストの有効化
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    return true;
  }

  public prepare() {
    return true;
  }

  public render() {
    // begin
    this.drawTargets.forEach((elem) => {
      elem.setContext(this.gl);
      elem.onBeginDraw();
    });

    // rendering
    this.drawTargets.forEach((elem) => {
      elem.onDraw();
    });

    // end
    this.drawTargets.forEach((elem) => {
      elem.onEndDraw();
    });

    this.gl.flush();
  }

  public pushRenderTarget(d: IDrawable) {
    this.drawTargets.push(d);
  }

  public static createVertexBuffer(gl: WebGLRenderingContext, data: number[]) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buf;
  }

  public static createIndexBuffer(gl: WebGLRenderingContext, data: number[]) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return buf;
  }

  public static createFrameBuffer(gl: WebGLRenderingContext, width: number, height: number) {
    const buf = gl.createFramebuffer();
    gl.bindBuffer(gl.FRAMEBUFFER, buf);

    const tex = this.createTexture(gl, width, height);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindBuffer(gl.FRAMEBUFFER, null);
    return buf;
  }

  public static createTexture(gl: WebGLRenderingContext, width: number, height: number) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

    // NPOT の場合は filter は linear, wrap は clamp to edge にしないといけない
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }

  public static createTextureFromImage(gl: WebGLRenderingContext, img: TexImageSource) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    // gl.generateMipmap(gl.TEXTURE_2D);

    // NPOT の場合は filter は linear, wrap は clamp to edge にしないといけない
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }

  public static registerUniformLocation(gl: WebGLRenderingContext, program: WebGLProgram, info: UniformInfo) {
    const { type, name, value } = info;
    switch (type) {
      case 'int':
        gl.uniform1i(gl.getUniformLocation(program, name), value);
        break;

      case 'float':
        if (Array.isArray(value)) {
          switch (value.length) {
            case 2:
              gl.uniform2fv(gl.getUniformLocation(program, name), new Float32Array(value));
              break;
            case 3:
              gl.uniform3fv(gl.getUniformLocation(program, name), new Float32Array(value));
              break;
            case 4:
              gl.uniform4fv(gl.getUniformLocation(program, name), new Float32Array(value));
              break;
          }
        } else {
          gl.uniform1f(gl.getUniformLocation(program, name), value);
        }
        break;
    }
  }

  public static loadTextureFromImageFile(gl: WebGLRenderingContext, src: string) {
    return new Promise<WebGLTexture | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const tex = Graphics.createTextureFromImage(gl, img);
        if (!tex) {
          console.log('texture is null.');
          resolve(null);
          return;
        }

        resolve(tex);
        console.log('texture loaded.');
      };

      img.src = src;
    });
  }
}
