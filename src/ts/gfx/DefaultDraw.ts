import { IDrawable } from "./core/IDrawable";
import { Sprite } from "./core/Sprite";

export class DefaultDraw implements IDrawable {
  public readonly sprites: Sprite[] = [];

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

  onDraw() {
    this.sprites.forEach((sprite) => {
      if (!this.gl) {
        return;
      }
      sprite.draw(this.gl);
    })
  }

  onEndDraw() {}

  private gl: WebGLRenderingContext | null = null;
}
