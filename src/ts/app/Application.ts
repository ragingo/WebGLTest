import { Graphics } from "../gfx/Graphics";
import { MainScene } from "./MainScene";

export class Application {

  public static main() {
    const gfx = new Graphics();
    gfx.pushScene(new MainScene(512, 512));
    gfx.init(512, 512);
    gfx.prepare();

    // let frameCount = 0;
    let now = 0.0;
    let last = 0.0;
    let elapsed = 0.0;

    const frameRequestCallback = (time: number) => {
      now = time;
      elapsed += now - last;
      last = now;

      // frameCount++;

      if (elapsed >= 1000) {
        // Application.s_AppFrames.forEach((f) => {
        //   f.onFpsUpdate(frameCount);
        // });
        // frameCount = 0;
        elapsed -= 1000.0;
      }

      gfx.render();

      window.requestAnimationFrame(frameRequestCallback);
    };

    window.requestAnimationFrame(frameRequestCallback);
  }
}
