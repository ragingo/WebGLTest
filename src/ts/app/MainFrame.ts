import { Graphics } from '../gfx/core/Graphics';
import { Sprite } from '../gfx/core/Sprite';
import { Size } from '../gfx/core/types';
import { DefaultDraw } from '../gfx/DefaultDraw';
import { Camera } from '../media/Camera';
import { MainView } from '../views/MainView';
import { IAppFrame } from './IAppFrame';

export class MainFrame implements IAppFrame {
  private view: MainView;
  private defaultDraw = new DefaultDraw();
  private gfx: Graphics | null = null;
  private isCameraOpened = false;
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

    const backSprite = new Sprite(this.view.canvas.width, this.view.canvas.height, './glsl/texture_edit_vs.glsl', './glsl/texture_edit_fs.glsl');
    backSprite.initialize();
    backSprite.size = new Size(0, 0, 512, 512);
    backSprite.depth = 0.0001;
    this.defaultDraw.sprites.push(backSprite);

    const frontSprite = new Sprite(this.view.canvas.width, this.view.canvas.height, './glsl/texture_edit_vs.glsl', './glsl/texture_edit_fs.glsl');
    frontSprite.initialize();
    frontSprite.size = new Size(512 / 4, 512 / 4, 512 / 2, 512 / 2);
    frontSprite.depth = 0;
    this.defaultDraw.sprites.push(frontSprite);

    this.loadTextureFromImageFile('./res/Lenna.png').then((tex) => {
      backSprite.setTexture(tex);
    });

    this.camera.open().then((x) => this.isCameraOpened = x);
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

    const sprite = this.isCameraOpened ? this.defaultDraw.sprites[1] : this.defaultDraw.sprites[0];

    sprite.rotate = this.view.getRotationValue();
    sprite.scale = this.view.getScaleValue();
    sprite.uniformLocationInfos.length = 0;

    const color = this.view.getColorValue()
    const vivid = this.view.getVividValue();
    sprite.uniformLocationInfos.push({ type: 'float', name: 'editColor', value: [color.r, color.g, color.b, color.a] });
    sprite.uniformLocationInfos.push({ type: 'int', name: 'effectType', value: this.view.getEffectTypeValue() });
    sprite.uniformLocationInfos.push({ type: 'float', name: 'binarizeThreshold', value: this.view.getBinarizeThresholdValue() });
    sprite.uniformLocationInfos.push({ type: 'float', name: 'vividParams', value: [vivid.k1, vivid.k2] });
    sprite.uniformLocationInfos.push({ type: 'int', name: 'uShowBorder', value: true ? 1 : 0 });

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

        const tex = Graphics.createTextureFromImage(this.gfx.gl, img);
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

    const tex = Graphics.createTextureFromImage(this.gfx.gl, bmp);
    bmp.close();

    if (!tex) {
      console.log('texture is null.');
      return null;
    }

    return tex;
  }
}
