import { Graphics } from './Graphics';

export class Texture {
  private textureSource: TexImageSource | null = null;

  public get() {
    return this.texture;
  }

  public getSource() {
    return this.textureSource;
  }

  public isValid() {
    return this.gl.isTexture(this.texture);
  }

  constructor(private gl: WebGLRenderingContext, private texture: WebGLTexture | null) {}

  public activate() {
    this.gl.activeTexture(this.gl.TEXTURE0);
  }

  public bind() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }

  public unbind() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  public dispose() {
    this.gl.deleteTexture(this.texture);
    this.texture = null;
  }

  public updateTextureSource(source: TexImageSource | null) {
    const gl = Graphics.gl;

    if (!source) {
      return;
    }

    if (this.textureSource !== source) {
      if (!this.textureSource) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      } else {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
      }
      this.textureSource = source;
    }
  }
}
