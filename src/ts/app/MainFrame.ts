class MainFrame implements IAppFrame {
  constructor() {
    this.m_View = new MainView();
    this.m_View.resetValues();

    this.m_TextureRender = new TextureRender();
  }

  onFpsUpdate(fps: number): void {
    this.m_View.setFpsLabel(fps + 'FPS');
  }

  onStart(): void {
    let gl = this.m_View.canvas.getContext('webgl');
    if (!gl) {
      console.log('webgl not supported.');
      return;
    }

    this.m_Gfx = new Graphics(gl);

    if (!this.m_Gfx.init(this.m_View.canvas.width, this.m_View.canvas.height)) {
      console.log('gfx init failed. ');
      return;
    }

    if (!this.m_Gfx.prepare()) {
      console.log('gfx prepare failed. ');
      return;
    }

    this.m_Gfx.pushRenderTarget(new DefaultDraw());
    this.m_Gfx.pushRenderTarget(this.m_TextureRender);
  }

  onUpdate(): void {
    this.m_TextureRender.textureDrawInfo.width = this.m_View.canvas.width;
    this.m_TextureRender.textureDrawInfo.height = this.m_View.canvas.height;
    this.m_TextureRender.textureDrawInfo.effectType = this.m_View.getEffectTypeValue();
    this.m_TextureRender.textureDrawInfo.color = this.m_View.getColorValue();
    this.m_TextureRender.textureDrawInfo.rotation = this.m_View.getRotationValue();
    this.m_TextureRender.textureDrawInfo.scale = this.m_View.getScaleValue();
    this.m_TextureRender.textureDrawInfo.vivid = this.m_View.getVividValue();
    this.m_TextureRender.textureDrawInfo.polygonCount = this.m_View.getPolygonCountValue();

    this.m_Gfx?.render();
  }

  private m_View: MainView;
  private m_Gfx: Graphics | null = null;
  private m_TextureRender: TextureRender;
}
