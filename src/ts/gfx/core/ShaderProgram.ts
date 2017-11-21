
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

	private compileShader(shader: WebGLShader | null, src: string): boolean {
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
