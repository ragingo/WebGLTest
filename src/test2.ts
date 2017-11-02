class Graphics2 {

	private gl: WebGLRenderingContext;
	private m_VsCode: string;

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
	}

	init(): boolean {
		return true;
	}

	prepare(): boolean{
		return true;
	}

	render(): void {
	}

}
