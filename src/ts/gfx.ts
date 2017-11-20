// /// <reference path="test.d.ts" />
// import default_vs from "../glsl/default_vs.glsl!text";

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

		return true;
	}

	public getProgram(): WebGLProgram | null {
		return this.program;
	}

}

class Graphics {

	private gl: WebGLRenderingContext;
	private m_DrawTagets: Array<IDrawable> = [];

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
	}

	public init(w: number, h: number): boolean {
		this.gl.viewport(0, 0, w, h);

		// アルファブレンドの有効化
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

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

	private _rotation : Float32Array;
	public get rotation() : Float32Array {
		return this._rotation;
	}
	public set rotation(v : Float32Array) {
		this._rotation = v;
	}

	private _scale : Float32Array;
	public get scale() : Float32Array {
		return this._scale;
	}
	public set scale(v : Float32Array) {
		this._scale = v;
	}

	private _vivid : Float32Array;
	public get vivid() : Float32Array {
		return this._vivid;
	}
	public set vivid(v : Float32Array) {
		this._vivid = v;
	}

	private _polygonCount : number;
	public get polygonCount() : number {
		return this._polygonCount;
	}
	public set polygonCount(v : number) {
		this._polygonCount = v;
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

	constructor() {
		this._textureDrawInfo = new TextureDrawInfo();
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

		gl.useProgram(this.program);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.m_MainTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		let uniformLocation = {
			scale: gl.getUniformLocation(this.program, 'scale'),
			rotatoin: gl.getUniformLocation(this.program, 'rotation'),
			sampler: gl.getUniformLocation(this.program, 'uSampler'),
			effectType: gl.getUniformLocation(this.program, 'effectType'),
			textureSize: gl.getUniformLocation(this.program, 'textureSize'),
			editColor: gl.getUniformLocation(this.program, 'editColor'),
			vividParams: gl.getUniformLocation(this.program, 'vividParams'),
		}
		
		// テクスチャ登録
		gl.uniform1i(uniformLocation.sampler, 0);

		if (uniformLocation.scale) {
			gl.uniform3fv(uniformLocation.scale, this._textureDrawInfo.scale);
		}
		if (uniformLocation.rotatoin) {
			gl.uniform3fv(uniformLocation.rotatoin, this._textureDrawInfo.rotation);
		}
		if (uniformLocation.textureSize){
			gl.uniform2fv(uniformLocation.textureSize, [this._textureDrawInfo.width, this._textureDrawInfo.height]);
		}
		if (uniformLocation.editColor) {
			gl.uniform4fv(uniformLocation.editColor, this._textureDrawInfo.color);
		}
		if (uniformLocation.vividParams) {
			gl.uniform2fv(uniformLocation.vividParams, this._textureDrawInfo.vivid);
		}
		gl.uniform1i(uniformLocation.effectType, this._textureDrawInfo.effectType);

		const tex_w = 512.0;
		const tex_h = 512.0;
		let texCoords = [
			{ left:   0, top:   0, width: 256, height: 256 },
			{ left:   0, top: 256, width: 256, height: 256 },
			{ left: 256, top:   0, width: 256, height: 256 },
			{ left: 256, top: 256, width: 256, height: 256 },
		];

		// 遊び要素として、ただポリゴン数を後ろから削るだけ
		for (let i = 0; i < 4 - this._textureDrawInfo.polygonCount; i++) {
			texCoords.pop();
		}

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
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Graphics.createIndexBuffer(gl, indexData));

		let that = this;
		vertices.forEach((vertex) => {
			let vbo_array = [
				{
					buffer: Graphics.createVertexBuffer(gl, vertex.pos),
					location: gl.getAttribLocation(that.program, 'position'),
					stride: 3
				},
				{
					buffer: Graphics.createVertexBuffer(gl, vertex.texCoord),
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

		let vs = await HttpUtil.getText("./glsl/texture_edit_vs.glsl");
		let fs = await HttpUtil.getText("./glsl/texture_edit_fs.glsl");
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
			let tex = Graphics.createTexture(this.gl, img);
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
		if (this.m_Sprite) {
			this.m_Sprite.draw(this.gl);
		}
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
			this.m_Sprite = new Sprite();
			this.m_Sprite.texture = tex;
			this.m_Sprite.initialize();
			this.m_TextureLoaded = true;
			this.m_Processing = false;
			console.log("texture loaded.");
		};
		img.src = "./res/smile_basic_font_table.png";

		return true;
	}

	private gl: WebGLRenderingContext;
	private m_TextureLoaded: boolean = false;
	private m_Processing: boolean = false;
	private m_Sprite: Sprite;
}

class Sprite
{
	constructor() {
	}

	public initialize(): void {
	}

	public draw(ctx: WebGLRenderingContext): void {

		this.gl = ctx;
		let gl = this.gl;

		if (!this.m_ShaderLoaded && !this.m_ShaderLoading) {
			this.m_ShaderLoading = true;
			this.loadShader().then(r => {
				if (r) {
					this.m_ShaderLoaded = true;
					this.m_ShaderLoading = false;
				}
			});
			return;
		}

		if (!this.m_ShaderLoaded) {
			return;
		}

		gl.useProgram(this.program);

		if (this.m_MainTexture) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.m_MainTexture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

			gl.uniform1i(gl.getUniformLocation(this.program, 'uSampler'), 0);
		}

		// 9 slice これでいいのか・・・？
		// TODO: 外から固定範囲を与える
		const tex_w = 512.0;
		const tex_h = 512.0;
		let texCoords = [
			{ left: 0, top: 0, width:     0, height:     0 },
			{ left: 0, top: 0, width:     0, height:     0 },
			{ left: 0, top: 0, width:     0, height:     0 },

			{ left: 0, top: 0, width: 100, height: tex_h },
			{ left: 100, top: 0, width: tex_w-200, height: tex_h },
			{ left: 412, top: 0, width:   100, height:   tex_h },

			{ left: 0, top: 0, width:     0, height:     0 },
			{ left: 0, top: 0, width:     0, height:     0 },
			{ left: 0, top: 0, width:     0, height:     0 },
		];

		// 頂点バッファ更新
		let vertices = [];
		for (let i = 0; i < texCoords.length; i++) {
			let tc = texCoords[i];
			let tmp_pos = {
				left: (tc.left / tex_w) * 2.0 - 1.0,
				top: (tc.top / tex_h) * 2.0 - 1.0,
				width: (tc.width / tex_w) * 2.0 - 1.0,
				height: (tc.height / tex_h) * 2.0 - 1.0,
				right: ((tc.left + tc.width) / tex_w) * 2.0 - 1.0,
				bottom: ((tc.top + tc.height) / tex_h) * 2.0 - 1.0,
			};
			let tmp_texCoord = {
				left: tc.left / tex_w,
				top: tc.top / tex_h,
				width: tc.width / tex_w,
				height: tc.height / tex_h,
				right: (tc.left + tc.width) / tex_w,
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

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Graphics.createIndexBuffer(gl, indexData));

		vertices.forEach((vertex) => {
			let vbo_array = [
				{
					buffer: Graphics.createVertexBuffer(gl, vertex.pos),
					location: gl.getAttribLocation(this.program, 'position'),
					stride: 3
				},
				{
					buffer: Graphics.createVertexBuffer(gl, vertex.texCoord),
					location: gl.getAttribLocation(this.program, 'texCoord'),
					stride: 2
				},
			];
			vbo_array.forEach(function (item, idx) {
				gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
				gl.enableVertexAttribArray(item.location);
				gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
			});
			gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
		});
	}

	private async loadShader(): Promise<boolean> {

		if (this.m_Processing) {
			return false;
		}
		this.m_Processing = true;

		let vs = await HttpUtil.getText("./glsl/default_vs.glsl");
		let fs = await HttpUtil.getText("./glsl/default_fs.glsl");
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

	public get texture(): WebGLTexture {
		return this.m_MainTexture;
	}
	public set texture(texture: WebGLTexture) {
		this.m_MainTexture = texture;
	}

	private gl: WebGLRenderingContext;
	private program: WebGLProgram;
	private m_MainTexture: WebGLTexture;
	private m_ShaderLoaded: boolean = false;
	private m_ShaderLoading: boolean = false;
	private m_ShaderProgram: ShaderProgram;
	private m_Processing:boolean = false;
}
