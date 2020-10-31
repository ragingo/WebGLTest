export class Texture {
  public get() {
    return this.texture;
  }

  public isValid() {
    return this.gl.isTexture(this.texture);
  }

  constructor(
    private gl: WebGLRenderingContext,
    private texture: WebGLTexture | null
  ) {
  }

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
}
