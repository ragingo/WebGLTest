
class SubTextureRender implements IDrawable {

	constructor() {
	}

	getContext(): WebGLRenderingContext {
		return this.gl;
	}

	setContext(gl: WebGLRenderingContext): void {
		this.gl = gl;
	}

	onBeginDraw(): void {
		if (!this.m_TextureLoaded) {
			this.loadTexture().then(r2 => {
			});
		}
	}

	onDraw(): void {
		this.m_Sprites.forEach(x => {
			x.draw(this.gl);
		});
	}

	onEndDraw(): void {
	}

	private async loadTexture(): Promise<boolean> {

		if (this.m_Processing) {
			return false;
		}
		this.m_Processing = true;

		let img = new Image();
		img.onload = () => {
			let tex = Graphics.createTexture(this.gl, img);
			if (!tex) {
				console.log("texture is null.");
				return;
			}

			for (let i = 0; i < 2; i++) {
				let sprite = new Sprite();
				sprite.originalImage = img;
				sprite.texture = tex;
				sprite.width = 130;
				sprite.height = 100;
				sprite.sliceBorder = [20, 20, 20, 20];
				sprite.crop = new CropInfo(0, 0, 130, 100);
				sprite.initialize();
				if (i == 0) {
					sprite.left = 10;
					sprite.top = 10;
				}
				if (i == 1) {
					sprite.left = 130;
					sprite.top = 10;
					sprite.scaleX = 2;
					sprite.scaleY = 2;
				}
				this.m_Sprites.push(sprite);
			}
			this.m_TextureLoaded = true;
			this.m_Processing = false;
			console.log("texture loaded.");
		};
		img.src = "./res/sm9_small_256x256.jpg";

		return true;
	}

	private gl: WebGLRenderingContext;
	private m_TextureLoaded: boolean = false;
	private m_Processing: boolean = false;
	private m_Sprites: Array<Sprite> = [];
}
