
class Sprite {

	constructor() {
	}

	public initialize(): void {
		ShaderLoader.load(
			"./glsl/default_vs.glsl",
			"./glsl/default_fs.glsl",
			(vs: string, fs: string) => {
				this.m_VS = vs;
				this.m_FS = fs;
				this.m_ShaderLoaded = true;
			}
		);
	}

	private compile() {

		this.m_ShaderProgram = new ShaderProgram(this.gl);

		if (!this.m_ShaderProgram.compile(this.m_VS, this.m_FS)) {
			console.log("shader compile failed.");
			return;
		}

		let program = this.m_ShaderProgram.getProgram();

		if (!program) {
			console.log("webgl program is null.");
			return;
		}

		this.program = program;
	}

	public draw(ctx: WebGLRenderingContext): void {

		this.gl = ctx;
		let gl = this.gl;

		if (!this.m_ShaderLoaded) {
			return;
		}

		if (!this.m_ShaderProgram) {
			this.compile();
		}

		if (!this.program) {
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
			{ left: 0, top: 0, width: 0, height: 0 },
			{ left: 0, top: 0, width: 0, height: 0 },
			{ left: 0, top: 0, width: 0, height: 0 },

			{ left: 0, top: 0, width: 100, height: tex_h },
			{ left: 100, top: 0, width: tex_w - 200, height: tex_h },
			{ left: 412, top: 0, width: 100, height: tex_h },

			{ left: 0, top: 0, width: 0, height: 0 },
			{ left: 0, top: 0, width: 0, height: 0 },
			{ left: 0, top: 0, width: 0, height: 0 },
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
	private m_ShaderProgram: ShaderProgram;
	private m_VS: string;
	private m_FS: string;
}
