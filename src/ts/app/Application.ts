class Application {
  private static s_AppFrames: IAppFrame[] = [];

  public static registerAppFrame(frame: IAppFrame) {
    Application.s_AppFrames.push(frame);
  }

  public static main() {
    Application.s_AppFrames.forEach((f) => {
      f.onStart();
    });

    let frameCount = 0;
    let now = 0.0;
    let last = 0.0;
    let elapsed = 0.0;

    const frameRequestCallback = (time: number) => {
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
