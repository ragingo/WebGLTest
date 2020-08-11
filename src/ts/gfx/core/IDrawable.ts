
interface IDrawable {
	getContext(): WebGLRenderingContext | null;
	setContext(gl: WebGLRenderingContext | null): void;
	onBeginDraw(): void;
	onDraw(): void;
	onEndDraw(): void;
}
