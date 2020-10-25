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

  public bind() {
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    // NPOT の場合は filter は linear, wrap は clamp to edge にしないといけない
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
  }

  public unbind() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.deleteTexture(this.texture);
  }
}
