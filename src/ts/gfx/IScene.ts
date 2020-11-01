export interface IScene {
  canvas: HTMLCanvasElement | null;
  onPrepare(): void;
  onBeginDraw(): void;
  onDraw(): void;
  onEndDraw(): void;
}
