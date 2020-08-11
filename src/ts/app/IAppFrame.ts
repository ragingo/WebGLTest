interface IAppFrame {
  onFpsUpdate(fps: number): void;
  onStart(): void;
  onUpdate(): void;
}
