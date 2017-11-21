
class TextureDrawInfo {

	private _width: number;
	public get width(): number {
		return this._width;
	}
	public set width(v: number) {
		this._width = v;
	}

	private _height: number;
	public get height(): number {
		return this._height;
	}
	public set height(v: number) {
		this._height = v;
	}

	private _effectType: number;
	public get effectType(): number {
		return this._effectType;
	}
	public set effectType(v: number) {
		this._effectType = v;
	}

	private _color: Float32Array;
	public get color(): Float32Array {
		return this._color;
	}
	public set color(v: Float32Array) {
		this._color = v;
	}

	private _rotation: Float32Array;
	public get rotation(): Float32Array {
		return this._rotation;
	}
	public set rotation(v: Float32Array) {
		this._rotation = v;
	}

	private _scale: Float32Array;
	public get scale(): Float32Array {
		return this._scale;
	}
	public set scale(v: Float32Array) {
		this._scale = v;
	}

	private _vivid: Float32Array;
	public get vivid(): Float32Array {
		return this._vivid;
	}
	public set vivid(v: Float32Array) {
		this._vivid = v;
	}

	private _polygonCount: number;
	public get polygonCount(): number {
		return this._polygonCount;
	}
	public set polygonCount(v: number) {
		this._polygonCount = v;
	}

}
