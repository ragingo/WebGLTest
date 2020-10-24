import { Graphics } from '../gfx/core/Graphics';
import { DefaultDraw } from '../gfx/DefaultDraw';
import { TextureRender } from '../gfx/TextureRender';
import { Camera } from '../media/Camera';
import { MainView } from '../views/MainView';
import { IAppFrame } from './IAppFrame';

export class MainFrame implements IAppFrame {
  private view: MainView;
  private textureRender: TextureRender;
  private gfx: Graphics | null = null;
  private camera = new Camera({
    video: {
      frameRate: 30,
      width: 640,
      height: 480
    },
    audio: false
  });

  constructor() {
    this.view = new MainView();
    this.view.resetValues();
    this.textureRender = new TextureRender();
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

    this.gfx = new Graphics(gl);

    if (!this.gfx.init(this.view.canvas.width, this.view.canvas.height)) {
      console.log('gfx init failed. ');
      return;
    }

    if (!this.gfx.prepare()) {
      console.log('gfx prepare failed. ');
      return;
    }

    this.gfx.pushRenderTarget(new DefaultDraw());
    this.gfx.pushRenderTarget(this.textureRender);
    // this.loadTextureFromImageFile('./res/Lenna.png').then((tex) => {
    //   this.textureRender.texture = tex;
    // });

    // TODO: error handling
    this.camera.open();
  }

  onUpdate() {
    if (!this.gfx) {
      return;
    }

    const drawInfo = this.textureRender.textureDrawInfo;
    drawInfo.width = this.view.canvas.width;
    drawInfo.height = this.view.canvas.height;
    drawInfo.effectType = this.view.getEffectTypeValue();
    drawInfo.color = this.view.getColorValue();
    drawInfo.rotation = this.view.getRotationValue();
    drawInfo.scale = this.view.getScaleValue();
    drawInfo.vivid = this.view.getVividValue();
    drawInfo.polygonCount = this.view.getPolygonCountValue();

    this.loadTextureFromCamera().then((tex) => {
      if (!tex) {
        return;
      }
      this.textureRender.texture = tex;
    });

    this.gfx.render();
  }

  // @ts-expect-error
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

    const frame = this.camera.consumeDecodedFrame();
    if (!frame) {
      return null;
    }

    // https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#imagebitmapoptions
    const bmp = await frame.createImageBitmap({
      resizeWidth: 512,
      resizeHeight: 512
    }) as ImageBitmap;

    const tex = Graphics.createTexture(this.gfx.gl, bmp);
    if (!tex) {
      console.log('texture is null.');
      return null;
    }

    return tex;
  }
}
