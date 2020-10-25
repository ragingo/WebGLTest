import { Graphics } from '../gfx/core/Graphics';
import { Sprite } from '../gfx/core/Sprite';
import { DefaultDraw } from '../gfx/DefaultDraw';
import { Camera } from '../media/Camera';
import { MainView } from '../views/MainView';
import { IAppFrame } from './IAppFrame';

export class MainFrame implements IAppFrame {
  private view: MainView;
  private defaultDraw = new DefaultDraw();
  private gfx: Graphics | null = null;
  private camera = new Camera({
    video: {
      allow: true,
      input: {
        frameRate: 30,
        width: 640,
        height: 480
      },
      output: {
        width: 512,
        height: 512
      }
    },
    audio: {
      allow: true
    }
  });

  constructor() {
    this.view = new MainView();
    this.view.resetValues();
  }

  onFpsUpdate(fps: number) {
    this.view.setFpsLabel(fps + 'FPS');
  }

  onStart() {
    const gl = this.view.canvas.getContext('webgl');
    if (!gl) {
      console.log('webgl not supported.');
      return;
    }

    this.view.canvas.width = 512;
    this.view.canvas.height = 512;

    this.gfx = new Graphics(gl);

    if (!this.gfx.init(this.view.canvas.width, this.view.canvas.height)) {
      console.log('gfx init failed. ');
      return;
    }

    if (!this.gfx.prepare()) {
      console.log('gfx prepare failed. ');
      return;
    }

    this.gfx.pushRenderTarget(this.defaultDraw);

    const backSprite = new Sprite(this.view.canvas.width, this.view.canvas.height);
    backSprite.initialize();
    backSprite.left = 0;
    backSprite.top = 0;
    backSprite.width = 512;
    backSprite.height = 512;
    backSprite.depth = 0.0001;
    this.defaultDraw.sprites.push(backSprite);

    const frontSprite = new Sprite(this.view.canvas.width, this.view.canvas.height);
    frontSprite.initialize();
    frontSprite.left = 512 / 4;
    frontSprite.top = 512 / 4;
    frontSprite.width = 512 / 2;
    frontSprite.height = 512 / 2;
    frontSprite.depth = 0;
    this.defaultDraw.sprites.push(frontSprite);

    this.loadTextureFromImageFile('./res/Lenna.png').then((tex) => {
      backSprite.setTexture(tex);
    });

    this.camera.open();
  }

  onUpdate() {
    if (!this.gfx) {
      return;
    }

    this.loadTextureFromCamera().then((tex) => {
      if (!tex) {
        return;
      }
      this.defaultDraw.sprites[1].setTexture(tex);
    });

    this.defaultDraw.sprites.forEach((sprite) => {
      sprite.color = this.view.getColorValue();
      sprite.rotate = this.view.getRotationValue();
      sprite.scale = this.view.getScaleValue();
      sprite.vividParams = this.view.getVividValue();
      sprite.effectType = this.view.getEffectTypeValue();
      sprite.binarizeThreshold = this.view.getBinarizeThresholdValue();
      sprite.showBorder = true;
    });

    this.gfx.render();
  }

  private loadTextureFromImageFile(src: string) {
    return new Promise<WebGLTexture | null>((resolve) => {
      let img = new Image();
      img.onload = () => {
        if (!this.gfx) {
          resolve(null);
          return;
        }

        const tex = Graphics.createTexture(this.gfx.gl, img);
        if (!tex) {
          console.log('texture is null.');
          resolve(null);
          return;
        }

        resolve(tex);
        console.log('texture loaded.');
      };

      img.src = src;
    });
  }

  private async loadTextureFromCamera() {
    if (!this.gfx) {
      return null;
    }

    const bmp = await this.camera.consumeDecodedFrameAsImageBitmap();
    if (!bmp) {
      return null;
    }

    const tex = Graphics.createTexture(this.gfx.gl, bmp);
    if (!tex) {
      console.log('texture is null.');
      return null;
    }

    return tex;
  }
}
