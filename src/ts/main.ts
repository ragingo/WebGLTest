
interface IDrawable {
	getContext(): WebGLRenderingContext;
	setContext(gl: WebGLRenderingContext): void;
	onBeginDraw(): void;
	onDraw(): void;
	onEndDraw(): void;
}

class ShaderProgram {

	private gl: WebGLRenderingContext;
	private program: WebGLProgram | null;

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
	}

	private compileVS(src: string): boolean {
		let vs = this.gl.createShader(this.gl.VERTEX_SHADER);
		if (!this.compileShader(vs, src)) {
			return false;
		}
		this.gl.attachShader(this.program, vs);
		return true;
	}

	private compileFS(src: string): boolean {
		let vs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		if (!this.compileShader(vs, src)) {
			return false;
		}
		this.gl.attachShader(this.program, vs);
		return true;
	}

	private compileShader(shader: WebGLShader | null, src: string ): boolean {
		this.gl.shaderSource(shader, src);
		this.gl.compileShader(shader);
		
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			console.log(this.gl.getShaderInfoLog(shader));
			return false;
		}

		return true;
	}

	public compile(vs: string, fs: string): boolean {
		this.program = this.gl.createProgram();

		if (!this.compileVS(vs)) {
			return false;
		}
		if (!this.compileFS(fs)) {
			return false;
		}

		this.gl.linkProgram(this.program);

		if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			console.log(this.gl.getProgramInfoLog(this.program));
			return false;
		}

		this.gl.useProgram(this.program);

		return true;
	}

	public getProgram(): WebGLProgram | null {
		return this.program;
	}

}

class Graphics2 {

	private gl: WebGLRenderingContext;
	private m_DrawTagets: Array<IDrawable> = [];
	private m_ViewportWidth: number;
	private m_ViewportHeight: number;

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
	}

	public init(w: number, h: number): boolean {
		this.m_ViewportWidth = w;
		this.m_ViewportHeight = h;
		this.gl.viewport(0, 0, w, h);

		// 深度テストの有効化
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);

		return true;
	}

	public prepare(): boolean{
		return true;
	}

	public render(): void {

		// begin
		this.m_DrawTagets.forEach((elem, i) => {
			elem.setContext(this.gl);
			elem.onBeginDraw();
		});

		// rendering
		this.m_DrawTagets.forEach((elem, i) => {
			elem.onDraw();
		});

		// end
		this.m_DrawTagets.forEach((elem, i) => {
			elem.onEndDraw();
		});

		this.gl.flush();
	}

	public pushRenderTarget(d: IDrawable): void {
		this.m_DrawTagets.push(d);
	}

	public static createVertexBuffer(gl: WebGLRenderingContext, data: Array<any>): WebGLBuffer | null {
		let buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		return buf;
	}

	public static createIndexBuffer(gl: WebGLRenderingContext, data: Array<any>): WebGLBuffer | null {
		let buf = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		return buf;
	}

	public static createTexture(gl: WebGLRenderingContext, img: ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): WebGLTexture | null {
		let tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return tex;
	}

}

class DefaultDraw implements IDrawable {
	
	getContext(): WebGLRenderingContext {
		return this.gl;
	}

	setContext(gl: WebGLRenderingContext): void {
		this.gl = gl;
	}

	onBeginDraw(): void {
		// クリア
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.clearDepth(1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}

	onDraw(): void {

	}

	onEndDraw(): void {

	}

	private gl: WebGLRenderingContext;

}

class TextureDrawInfo {
	
	private _width : number;
	public get width() : number {
		return this._width;
	}
	public set width(v : number) {
		this._width = v;
	}
	
	private _height : number;
	public get height() : number {
		return this._height;
	}
	public set height(v : number) {
		this._height = v;
	}

	private _effectType : number;
	public get effectType() : number {
		return this._effectType;
	}
	public set effectType(v : number) {
		this._effectType = v;
	}
	
	private _color : Float32Array;
	public get color() : Float32Array {
		return this._color;
	}
	public set color(v : Float32Array) {
		this._color = v;
	}
	
}

class TextureRender implements IDrawable {

	
	private _textureDrawInfo : TextureDrawInfo;
	public get textureDrawInfo() : TextureDrawInfo {
		return this._textureDrawInfo;
	}
	public set textureDrawInfo(v : TextureDrawInfo) {
		this._textureDrawInfo = v;
	}
	
	getContext(): WebGLRenderingContext {
		return this.gl;
	}

	setContext(gl: WebGLRenderingContext): void {
		this.gl = gl;
	}

	onBeginDraw(): void {
		if (!this.m_ShaderLoaded) {
			this.loadShader().then(r => {
				if (r) {
					this.m_ShaderLoaded = true;
					this.m_Processing = false;
				}
			});
		}
		if (!this.m_TextureLoaded) {
			this.loadTexture().then(r2 => {
			});
		}
	}

	onDraw(): void {

		if (!this.m_TextureLoaded) {
			return;
		}

		let gl = this.gl;

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.m_MainTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		let uniformLocation = {
			sampler: gl.getUniformLocation(this.program, 'uSampler'),
			effectType: gl.getUniformLocation(this.program, 'effectType'),
			textureSize: gl.getUniformLocation(this.program, 'textureSize'),
			editColor: gl.getUniformLocation(this.program, 'editColor'),
			vividParams: gl.getUniformLocation(this.program, 'vividParams'),
		}
		
		// テクスチャ登録
		gl.uniform1i(uniformLocation.sampler, 0);

		if (uniformLocation.textureSize){
			gl.uniform2fv(uniformLocation.textureSize, [this._textureDrawInfo.width, this._textureDrawInfo.height]);
		}
		if (uniformLocation.editColor) {
			gl.uniform4fv(uniformLocation.editColor, this._textureDrawInfo.color);
		}

		//gl.uniform2fv(uniformLocation.vividParams, view.getVividEffectParameters());

		// エフェクト切り替え
		//gl.uniform1i(uniformLocation.effectType, view.getSelectedEffectType());
		gl.uniform1i(uniformLocation.effectType, this._textureDrawInfo.effectType);

		// let scale = view.getScale();
		// gl.vertexAttrib3f(gl.getAttribLocation(this.program, 'scale'), scale.x, scale.y, scale.z);
		gl.vertexAttrib3f(gl.getAttribLocation(this.program, 'scale'), 1, 1, 1);

		// let rotation = view.getRotation();
		// gl.vertexAttrib3f(gl.getAttribLocation(this.program, 'rotation'), rotation.x, rotation.y, rotation.z);
		gl.vertexAttrib3f(gl.getAttribLocation(this.program, 'rotation'), 1, 1, 1);

		const tex_w = 512.0;
		const tex_h = 512.0;
		let texCoords = [
			{ left:   0, top:   0, width: 256, height: 256 },
			{ left:   0, top: 256, width: 256, height: 256 },
			{ left: 256, top:   0, width: 256, height: 256 },
			{ left: 256, top: 256, width: 256, height: 256 },
		];

		// 遊び要素として、ただポリゴン数を後ろから削るだけ
		// for (let i = 0; i < 4 - view.getPolygonCount(); i++) {
		// 	texCoords.pop();
		// }

		// 頂点バッファ更新
		let vertices = [];
		for (let i = 0; i < texCoords.length; i++) {
			let tc = texCoords[i];
			let tmp_pos = {
				left:   (tc.left / tex_w) * 2.0 - 1.0,
				top:    (tc.top / tex_h) * 2.0 - 1.0,
				width:  (tc.width / tex_w) * 2.0 - 1.0,
				height: (tc.height / tex_h) * 2.0 - 1.0,
				right:  ((tc.left + tc.width) / tex_w) * 2.0 - 1.0,
				bottom: ((tc.top + tc.height) / tex_h) * 2.0 - 1.0,
			};
			let tmp_texCoord = {
				left:   tc.left / tex_w,
				top:    tc.top / tex_h,
				width:  tc.width / tex_w,
				height: tc.height / tex_h,
				right:  (tc.left + tc.width) / tex_w,
				bottom: (tc.top + tc.height) / tex_h,
			};
			let pos = [
				tmp_pos.left, -tmp_pos.bottom, 0,
				tmp_pos.right, -tmp_pos.bottom, 0,
				tmp_pos.left, -tmp_pos.top, 0,
				tmp_pos.right, -tmp_pos.top, 0,
			];
			let texCoord = [
				tmp_texCoord.left, tmp_texCoord.bottom,
				tmp_texCoord.right, tmp_texCoord.bottom,
				tmp_texCoord.left, tmp_texCoord.top,
				tmp_texCoord.right, tmp_texCoord.top,
			];
			vertices.push({
				pos: pos,
				texCoord: texCoord,
			});
		}

		// インデックスバッファ生成 & 登録
		let indexData = [
			0, 1, 2,
			1, 3, 2,
		];
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Graphics2.createIndexBuffer(gl, indexData));

		let that = this;
		vertices.forEach((vertex) => {
			let vbo_array = [
				{
					buffer: Graphics2.createVertexBuffer(gl, vertex.pos),
					location: gl.getAttribLocation(that.program, 'position'),
					stride: 3
				},
				{
					buffer: Graphics2.createVertexBuffer(gl, vertex.texCoord),
					location: gl.getAttribLocation(that.program, 'texCoord'),
					stride: 2
				},
			];
			vbo_array.forEach(function(item, idx) {
				gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
				gl.enableVertexAttribArray(item.location);
				gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
			});
			gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
		});
	}

	onEndDraw(): void {
	}

	private async loadShader(): Promise<boolean> {

		if (this.m_Processing) {
			return false;
		}
		this.m_Processing = true;

		let vs = await HttpUtils.getText("./glsl/default_vs.glsl");
		let fs = await HttpUtils.getText("./glsl/default_fs.glsl");
		if (!vs) {
			console.log("vs code not found.");
			return false;
		}
		if (!fs) {
			console.log("fs code not found.");
			return false;
		}

		this.m_ShaderProgram = new ShaderProgram(this.gl);
		if (!this.m_ShaderProgram.compile(vs, fs)) {
			console.log("shader compile failed.");
			return false;
		}
		let program = this.m_ShaderProgram.getProgram();
		if (!program) {
			console.log("webgl program is null.");
			return false;
		}
		this.program = program;

		return true;
	}

	private async loadTexture(): Promise<boolean> {

		if (this.m_Processing) {
			return false;
		}
		this.m_Processing = true;

		let img = new Image();
		img.onload = () => {
			let tex = Graphics2.createTexture(this.gl, img);
			if (!tex) {
				console.log("texture is null.");
				return;
			}
			this.m_MainTexture = tex;
			this.m_TextureLoaded = true;
			this.m_Processing = false;
			console.log("texture loaded.");
		};
		img.src = "./res/Lenna.png";

		return true;
	}

	private gl: WebGLRenderingContext;
	private program: WebGLProgram;
	private m_MainTexture: WebGLTexture;
	private m_TextureLoaded: boolean = false;
	private m_ShaderLoaded: boolean = false;
	private m_ShaderProgram: ShaderProgram;

	private m_Processing: boolean = false;
}

class MainView
{
	fps: HTMLParagraphElement;
	canvas: HTMLCanvasElement;
	effectSelector: HTMLSelectElement;
	color: Array<HTMLInputElement>;

	public setFps(value: string): void {
		this.fps.innerText = value;
	}

	public getColor(): Float32Array {
		return new Float32Array(this.color.map(x => parseInt(x.value)));
	}

	public getEffectType(): number {
		return parseInt(this.effectSelector.options[this.effectSelector.selectedIndex].value);
	}

	constructor() {
		this.fps = document.getElementById("fps") as HTMLParagraphElement;
		this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
		this.effectSelector = document.getElementById("effectSelector") as HTMLSelectElement;
		this.color = [
			document.getElementById("slider_color_r") as HTMLInputElement,
			document.getElementById("slider_color_g") as HTMLInputElement,
			document.getElementById("slider_color_b") as HTMLInputElement,
			document.getElementById("slider_color_a") as HTMLInputElement,
		];
	}
}

function main2()
{
	let view: MainView = new MainView();

	let gl = view.canvas.getContext("webgl");
	if (!gl) {
		console.log("webgl not supported.");
		return;
	}

	let gfx = new Graphics2(gl);

	if (!gfx.init(view.canvas.width, view.canvas.height)) {
		console.log("gfx init failed. ");
		return;
	}

	if (!gfx.prepare()) {
		console.log("gfx prepare failed. ");
		return;
	}

	gfx.pushRenderTarget(new DefaultDraw());

	let textureRender = new TextureRender();
	textureRender.textureDrawInfo = new TextureDrawInfo();
	gfx.pushRenderTarget(textureRender);

	let frameCount: number = 0;
	let now: number = 0.0;
	let last: number = 0.0;
	let elapsed: number = 0.0;


	let frameRequestCallback = (time: number) => {
		now = time;
		elapsed += (now - last);
		last = now;

		frameCount++;

		if (elapsed >= 1000) {
			view.setFps(frameCount + " FPS");
			frameCount = 0;
			elapsed -= 1000.0;
		}

		textureRender.textureDrawInfo.width = view.canvas.width;
		textureRender.textureDrawInfo.height = view.canvas.height;
		textureRender.textureDrawInfo.effectType = view.getEffectType();
		textureRender.textureDrawInfo.color = view.getColor();
		
		gfx.render();

		window.requestAnimationFrame(frameRequestCallback);
	};

	window.requestAnimationFrame(frameRequestCallback);
}