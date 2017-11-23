
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

		if (this.m_MainTexture && ctx.isTexture(this.m_MainTexture)) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.m_MainTexture);

			// NPOT の場合は filter は linear, wrap は clamp to edge にしないといけない
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

			gl.uniform1i(gl.getUniformLocation(this.program, 'uSampler'), 0);
		}

		const tex_w = this.m_OriginalImage.naturalWidth;
		const tex_h = this.m_OriginalImage.naturalHeight;

		let coords = [];

		{
			// debug
			this.m_SliceBorder = new Float32Array([20, 20, 20, 20]);
			this.m_Width = 400;
		}

		if (this.m_SliceBorder.length != 4) {
			return;
		}

		{
			let left_w = this.m_SliceBorder[0];
			let top_h = this.m_SliceBorder[1];
			let right_w = this.m_SliceBorder[2];
			let bottom_h = this.m_SliceBorder[3];

			let center_block_w = this.m_Width - (left_w + right_w);
			let center_block_h = tex_h - (top_h + bottom_h);
			let right_block_l = this.m_Width - right_w;
			let bottom_block_t = tex_h - bottom_h;

			let uv_center_block_w = tex_w - (left_w + right_w);
			let uv_right_block_l = tex_w - right_w;

			/**
			 * 0 1 2
			 * 3 4 5
			 * 6 7 8
			 */

			// 0: r1 c1
			coords.push({ left: 0, top: 0, width: left_w, height: top_h, uv_w: left_w, uv_l: 0 });
			// 1: r1 c2
			coords.push({ left: left_w, top: 0, width: center_block_w, height: top_h, uv_w: uv_center_block_w, uv_l: left_w });
			// 2: r1 c3
			coords.push({ left: right_block_l, top: 0, width: right_w, height: top_h, uv_w: right_w, uv_l: uv_right_block_l });

			// 3: r2 c1
			coords.push({ left: 0, top: top_h, width: left_w, height: center_block_h, uv_w: left_w, uv_l: 0 });
			// 4: r2 c2
			coords.push({ left: left_w, top: top_h, width: center_block_w, height: center_block_h, uv_w: uv_center_block_w, uv_l: left_w });
			// 5: r2 c3
			coords.push({ left: right_block_l, top: top_h, width: right_w, height: center_block_h, uv_w: right_w, uv_l: uv_right_block_l });

			// 6: r3 c1
			coords.push({ left: 0, top: bottom_block_t, width: left_w, height: bottom_h, uv_w: left_w, uv_l: 0 });
			// 7: r3 c2
			coords.push({ left: left_w, top: bottom_block_t, width: center_block_w, height: bottom_h, uv_w: uv_center_block_w, uv_l: left_w });
			// 8: r3 c3
			coords.push({ left: right_block_l, top: bottom_block_t, width: right_w, height: bottom_h, uv_w: right_w, uv_l: uv_right_block_l });
		}


		const canvas_w = 512.0;
		const canvas_h = 512.0;

		// 頂点バッファ更新
		let vertices_pos: Array<number> = [];
		let vertices_uv: Array<number> = [];
		for (let i = 0; i < coords.length; i++) {
			let tc = coords[i];
			if (tc.width == 0 || tc.height == 0) {
				continue;
			}

			let tmp_pos = {
				left: (tc.left / canvas_w) * 2.0 - 1.0,
				top: (tc.top / canvas_h) * 2.0 - 1.0,
				right: ((tc.left + tc.width) / canvas_w) * 2.0 - 1.0,
				bottom: ((tc.top + tc.height) / canvas_h) * 2.0 - 1.0,
			};
			let tmp_texCoord = {
				left: tc.uv_l / tex_w,
				top: tc.top / tex_h,
				right: (tc.uv_l + tc.uv_w) / tex_w,
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

			pos.forEach(v => vertices_pos.push(v));
			texCoord.forEach(v => vertices_uv.push(v));
		}

		// インデックスバッファ生成 & 登録
		let indexData: Array<number> = [];

		for (let i = 0; i < 9; i++) {
			[0, 1, 2, 1, 3, 2]
				.map(v => v + (4 * i))
				.forEach(v => {
					indexData.push(v)
				});
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Graphics.createIndexBuffer(gl, indexData));

		let vbo_array = [
			{
				buffer: Graphics.createVertexBuffer(gl, vertices_pos),
				location: gl.getAttribLocation(this.program, 'position'),
				stride: 3
			},
			{
				buffer: Graphics.createVertexBuffer(gl, vertices_uv),
				location: gl.getAttribLocation(this.program, 'texCoord'),
				stride: 2
			},
		];
		vbo_array.forEach(function (item, idx) {
			gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
			gl.enableVertexAttribArray(item.location);
			gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
		});

		let draw_mode = gl.TRIANGLES;
		let is_debug_mode = true;
		if (is_debug_mode) {
			draw_mode = gl.LINE_STRIP;
		}

		gl.drawElements(draw_mode, indexData.length, gl.UNSIGNED_SHORT, 0);
	}

	public get originalImage(): HTMLImageElement {
		return this.m_OriginalImage;
	}
	public set originalImage(image: HTMLImageElement) {
		this.m_OriginalImage = image;
	}

	public get texture(): WebGLTexture {
		return this.m_MainTexture;
	}
	public set texture(texture: WebGLTexture) {
		this.m_MainTexture = texture;
	}

	private gl: WebGLRenderingContext;
	private program: WebGLProgram;
	private m_OriginalImage: HTMLImageElement;
	private m_MainTexture: WebGLTexture;
	private m_ShaderLoaded: boolean = false;
	private m_ShaderProgram: ShaderProgram;
	private m_VS: string;
	private m_FS: string;
	private m_SliceBorder: Float32Array;
	private m_Width: number = 0;
}
