class MainFrame implements IAppFrame {
  private view: MainView;
  private textureRender: TextureRender;
  private gfx: Graphics | null = null;

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
  }

  onUpdate() {
    const drawInfo = this.textureRender.textureDrawInfo;
    drawInfo.width = this.view.canvas.width;
    drawInfo.height = this.view.canvas.height;
    drawInfo.effectType = this.view.getEffectTypeValue();
    drawInfo.color = this.view.getColorValue();
    drawInfo.rotation = this.view.getRotationValue();
    drawInfo.scale = this.view.getScaleValue();
    drawInfo.vivid = this.view.getVividValue();
    drawInfo.polygonCount = this.view.getPolygonCountValue();

    this.gfx?.render();
  }
}
