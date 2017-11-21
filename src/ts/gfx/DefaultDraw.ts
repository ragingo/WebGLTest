
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
