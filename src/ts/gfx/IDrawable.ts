
interface IDrawable {
	getContext(): WebGLRenderingContext;
	setContext(gl: WebGLRenderingContext): void;
	onBeginDraw(): void;
	onDraw(): void;
	onEndDraw(): void;
}
