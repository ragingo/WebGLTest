import { IDrawable } from "./core/IDrawable";

export class DefaultDraw implements IDrawable {
  getContext() {
    return this.gl;
  }

  setContext(gl: WebGLRenderingContext | null) {
    this.gl = gl;
  }

  onBeginDraw() {
    if (!this.gl) {
      return;
    }
    // クリア
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  onDraw() {}

  onEndDraw() {}

  private gl: WebGLRenderingContext | null = null;
}
