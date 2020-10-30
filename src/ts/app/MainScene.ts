import { Camera } from "../media/Camera";
import { MainView } from "../views/MainView";
import { Graphics } from "../gfx/Graphics";
import { IScene } from "../gfx/IScene";
import { Sprite } from "../gfx/Sprite";
import { Size } from "../gfx/types";

export class MainScene implements IScene {
  public canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;
  private view: MainView;
  public canvasCtx: CanvasRenderingContext2D | null = null;
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

  public readonly sprites: Sprite[] = [];

  constructor(
    private readonly width: number,
    private readonly height: number,
  ) {
    this.view = new MainView();
  }

  getContext() {
    return this.gl;
  }

  setContext(gl: WebGLRenderingContext | null) {
    this.gl = gl;
  }

  onPrepare() {
    if (!this.gl || !this.canvas) {
      return;
    }

    this.view.resetValues();
    this.view.addCanvas(this.canvas);

    this.canvasCtx = this.canvas.getContext('2d');

    const backSprite = new Sprite(this.width, this.height, './glsl/texture_edit_vs.glsl', './glsl/texture_edit_fs.glsl');
    backSprite.initialize();
    backSprite.size = new Size(0, 0, 512, 512);
    backSprite.depth = 0.0001;
    this.sprites.push(backSprite);

    const frontSprite = new Sprite(this.width, this.height, './glsl/texture_edit_vs.glsl', './glsl/texture_edit_fs.glsl');
    frontSprite.initialize();
    frontSprite.size = new Size(512 / 4, 512 / 4, 512 / 2, 512 / 2);
    frontSprite.depth = 0;
    this.sprites.push(frontSprite);

    Graphics.loadTextureFromImageFile(this.gl, './res/Lenna.png').then((tex) => {
      backSprite.setTexture(tex);
    });

    this.camera.open().then((x) => this.isCameraOpened = x);
  }

  onBeginDraw() {
    if (!this.gl) {
      return;
    }
    // クリア
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  onDraw() {
    if (!this.gl) {
      return;
    }

    this.camera.consumeDecodedFrameAsTexture(this.gl).then((tex) => {
      if (!tex) {
        return;
      }
      this.sprites[1].setTexture(tex);
    });

    const sprite = this.isCameraOpened ? this.sprites[1] : this.sprites[0];

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

    this.sprites.forEach((sprite) => {
      if (!this.gl) {
        return;
      }
      sprite.draw(this.gl);
    })
  }

  onEndDraw() {
  }
}
