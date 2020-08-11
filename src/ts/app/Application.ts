class Application {
  private static s_AppFrames: Array<IAppFrame> = [];

  public static registerAppFrame(frame: IAppFrame) {
    Application.s_AppFrames.push(frame);
  }

  public static main(): void {
    Application.s_AppFrames.forEach((f) => {
      f.onStart();
    });

    let frameCount: number = 0;
    let now: number = 0.0;
    let last: number = 0.0;
    let elapsed: number = 0.0;

    let frameRequestCallback = (time: number) => {
      now = time;
      elapsed += now - last;
      last = now;

      frameCount++;

      if (elapsed >= 1000) {
        Application.s_AppFrames.forEach((f) => {
          f.onFpsUpdate(frameCount);
        });
        frameCount = 0;
        elapsed -= 1000.0;
      }

      Application.s_AppFrames.forEach((f) => {
        f.onUpdate();
      });

      window.requestAnimationFrame(frameRequestCallback);
    };

    window.requestAnimationFrame(frameRequestCallback);
  }
}
