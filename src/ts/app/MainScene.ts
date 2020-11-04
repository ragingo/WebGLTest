import FragmentShader from '../../glsl/texture_edit_fs.glsl';
import VertexShader from '../../glsl/texture_edit_vs.glsl';
import Lenna from '../../img/Lenna.png';
import { Graphics } from '../gfx/Graphics';
import { IScene } from '../gfx/IScene';
import { Sprite } from '../gfx/Sprite';
import { Size } from '../gfx/types';
import { Camera } from '../media/Camera';
import { MainView } from '../views/MainView';

export class MainScene implements IScene {
  public canvas: HTMLCanvasElement | null = null;
  private view = new MainView();
  public canvasCtx: CanvasRenderingContext2D | null = null;
  private backgroundSprite: Sprite | null = null;
  private cameraSprite: Sprite | null = null;

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

  onPrepare() {
    if (!this.canvas) {
      return;
    }

    this.view.resetValues();
    this.view.addCanvas(this.canvas);

    this.canvasCtx = this.canvas.getContext('2d');

    this.backgroundSprite = new Sprite(this.canvas.width, this.canvas.height, VertexShader, FragmentShader);
    this.backgroundSprite.initialize();
    this.backgroundSprite.size = new Size(0, 0, this.canvas.width, this.canvas.height);
    this.backgroundSprite.depth = 0.0001;

    this.cameraSprite = new Sprite(this.canvas.width, this.canvas.height, VertexShader, FragmentShader);
    this.cameraSprite.initialize();
    this.cameraSprite.size = new Size(
      this.canvas.width / 4,
      this.canvas.height / 4,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    this.cameraSprite.depth = 0;

    Graphics.loadTextureFromImageFile(Lenna).then((tex) => {
      this.backgroundSprite?.updateTexture(tex);
    });

    this.camera.open().then((result) => {
      this.isCameraOpened = result;
      if (!result) {
        this.cameraSprite?.dispose();
        this.cameraSprite = null;
      }
    });
  }

  onBeginDraw() {
    const gl = Graphics.gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  onDraw() {
    this.camera.consumeDecodedFrameAsImageBitmap().then((tex) => {
      if (!tex) {
        return;
      }
      if (!this.cameraSprite) {
        return;
      }
      this.cameraSprite.updateTexture(tex);
    });

    const sprite = this.isCameraOpened ? this.cameraSprite : this.backgroundSprite;
    if (!sprite) {
      return;
    }

    sprite.rotate = this.view.getRotationValue();
    sprite.scale = this.view.getScaleValue();
    sprite.uniformLocationInfos.length = 0;

    const color = this.view.getColorValue();
    const vivid = this.view.getVividValue();
    sprite.uniformLocationInfos.push({ type: 'float', name: 'editColor', value: [color.r, color.g, color.b, color.a] });
    sprite.uniformLocationInfos.push({ type: 'int', name: 'effectType', value: this.view.getEffectTypeValue() });
    sprite.uniformLocationInfos.push({
      type: 'float',
      name: 'binarizeThreshold',
      value: this.view.getBinarizeThresholdValue()
    });
    sprite.uniformLocationInfos.push({ type: 'float', name: 'vividParams', value: [vivid.k1, vivid.k2] });
    sprite.uniformLocationInfos.push({ type: 'int', name: 'uShowBorder', value: true ? 1 : 0 });

    this.backgroundSprite?.draw();
    this.cameraSprite?.draw();
  }

  onEndDraw() {}
}
