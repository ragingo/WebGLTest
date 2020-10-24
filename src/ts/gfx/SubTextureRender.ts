import { Graphics } from "./core/Graphics";
import { IDrawable } from "./core/IDrawable";
import { Sprite } from "./core/Sprite";
import { CropInfo } from "./core/types";

export class SubTextureRender implements IDrawable {
  private gl: WebGLRenderingContext | null = null;
  private textureLoaded = false;
  private isProcessing = false;
  private sprites: Sprite[] = [];

  constructor() {}

  getContext() {
    return this.gl;
  }

  setContext(gl: WebGLRenderingContext | null) {
    this.gl = gl;
  }

  onBeginDraw() {
    if (!this.textureLoaded) {
      this.loadTexture();
    }
  }

  onDraw() {
    this.sprites.forEach((x) => {
      if (!this.gl) {
        return;
      }
      x.draw(this.gl);
    });
  }

  onEndDraw() {}

  private async loadTexture() {
    if (this.isProcessing) {
      return false;
    }
    this.isProcessing = true;

    const img = new Image();
    img.onload = () => {
      if (!this.gl) {
        return;
      }
      const tex = Graphics.createTexture(this.gl, img);
      if (!tex) {
        console.log('texture is null.');
        return;
      }

      for (let i = 0; i < 3; i++) {
        const sprite = new Sprite();
        sprite.initialize();
        if (i == 0) {
          sprite.left = 10;
          sprite.top = 10;
          sprite.showBorder = true;
          sprite.texture = tex;
          sprite.width = 130;
          sprite.height = 100;
          sprite.sliceBorder = [20, 20, 20, 20];
          sprite.crop = new CropInfo(0, 0, 130, 100);
        }
        if (i == 1) {
          sprite.left = 150;
          sprite.top = 10;
          sprite.scale.x = 2;
          sprite.scale.y = 2;
          sprite.showBorder = false;
          sprite.texture = tex;
          sprite.width = 130;
          sprite.height = 100;
          sprite.sliceBorder = [20, 20, 20, 20];
          sprite.crop = new CropInfo(0, 0, 130, 100);
        }
        if (i == 2) {
          sprite.left = 10;
          sprite.top = 200;
          sprite.width = 130;
          sprite.height = 2;
          sprite.sliceBorder = [0, 0, 0, 0];
          sprite.crop = new CropInfo(0, 0, 0, 0);
          sprite.showBorder = true;
        }
        this.sprites.push(sprite);
      }
      this.textureLoaded = true;
      this.isProcessing = false;
      console.log('texture loaded.');
    };
    img.src = './res/sm9_small_256x256.jpg';

    return true;
  }
}
