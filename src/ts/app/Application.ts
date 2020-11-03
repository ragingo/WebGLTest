import { Graphics } from '../gfx/Graphics';
import { MainScene } from './MainScene';

export class Application {
  public static main() {
    const gfx = new Graphics();
    gfx.pushScene(new MainScene());
    gfx.init(512, 512);
    gfx.prepare();

    const callback = () => {
      gfx.render();
      window.requestAnimationFrame(callback);
    };

    window.requestAnimationFrame(callback);
  }
}
