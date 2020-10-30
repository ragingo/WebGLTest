export interface IScene {
  canvas: HTMLCanvasElement | null;
  getContext(): WebGLRenderingContext | null;
  setContext(gl: WebGLRenderingContext | null): void;
  onPrepare(): void;
  onBeginDraw(): void;
  onDraw(): void;
  onEndDraw(): void;
}
