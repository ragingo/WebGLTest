import { IScene } from './IScene';
import { Texture } from './Texture';
import { FrameBufferObject, UniformInfo } from './types';

export class Graphics {
  private scenes: IScene[] = [];
  private static readonly canvas = document.createElement('canvas');
  public static readonly gl = Graphics.canvas.getContext('webgl')!;

  public init(width: number, height: number) {
    Graphics.canvas.width = width;
    Graphics.canvas.height = height;

    const gl = Graphics.gl;

    gl.viewport(0, 0, width, height);

    // アルファブレンドの有効化
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 深度テストの有効化
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    return true;
  }

  public prepare() {
    this.scenes.forEach((scene) => {
      scene.canvas = Graphics.canvas;
      scene.onPrepare();
    });
    return true;
  }

  public render() {
    // begin
    this.scenes.forEach((scene) => {
      scene.onBeginDraw();
    });

    // rendering
    this.scenes.forEach((scene) => {
      scene.onDraw();
    });

    // end
    this.scenes.forEach((scene) => {
      scene.onEndDraw();
    });

    Graphics.gl.flush();
  }

  public pushScene(scene: IScene) {
    this.scenes.push(scene);
  }

  public static createVertexBuffer(data: number[]) {
    const gl = Graphics.gl;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buf;
  }

  public static createIndexBuffer(data: number[]) {
    const gl = Graphics.gl;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return buf;
  }

  public static createFrameBufferWithTexture(width: number, height: number) {
    const gl = Graphics.gl;

    const buf = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, buf);

    const tex = new Texture(gl, this.createTexture(width, height));
    gl.bindTexture(gl.TEXTURE_2D, tex.get());
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex.get(), 0);

    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return { frameBuffer: buf, depthBuffer: depthBuffer, texture: tex } as FrameBufferObject;
  }

  public static createTexture(width: number, height: number) {
    const gl = Graphics.gl;

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // NPOT の場合は filter は linear, wrap は clamp to edge にしないといけない
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }

  public static createTextureFromImage(img: TexImageSource) {
    const gl = Graphics.gl;

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    // NPOT の場合は filter は linear, wrap は clamp to edge にしないといけない
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }

  public static registerUniformLocation(program: WebGLProgram, info: UniformInfo) {
    const gl = Graphics.gl;

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

  public static loadTextureFromImageFile(src: string) {
    return new Promise<TexImageSource | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };

      img.src = src;
    });
  }
}
