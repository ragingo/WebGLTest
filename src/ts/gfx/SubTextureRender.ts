class SubTextureRender implements IDrawable {
  constructor() {}

  getContext() {
    return this.gl;
  }

  setContext(gl: WebGLRenderingContext | null) {
    this.gl = gl;
  }

  onBeginDraw() {
    if (!this.m_TextureLoaded) {
      this.loadTexture().then((r2) => {});
    }
  }

  onDraw() {
    this.m_Sprites.forEach((x) => {
      if (!this.gl) {
        return;
      }
      x.draw(this.gl);
    });
  }

  onEndDraw() {}

  private async loadTexture() {
    if (this.m_Processing) {
      return false;
    }
    this.m_Processing = true;

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
          sprite.originalImage = img;
          sprite.texture = tex;
          sprite.width = 130;
          sprite.height = 100;
          sprite.sliceBorder = [20, 20, 20, 20];
          sprite.crop = new CropInfo(0, 0, 130, 100);
        }
        if (i == 1) {
          sprite.left = 150;
          sprite.top = 10;
          sprite.scaleX = 2;
          sprite.scaleY = 2;
          sprite.showBorder = false;
          sprite.originalImage = img;
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
        this.m_Sprites.push(sprite);
      }
      this.m_TextureLoaded = true;
      this.m_Processing = false;
      console.log('texture loaded.');
    };
    img.src = './res/sm9_small_256x256.jpg';

    return true;
  }

  private gl: WebGLRenderingContext | null = null;
  private m_TextureLoaded = false;
  private m_Processing = false;
  private m_Sprites: Sprite[] = [];
}
