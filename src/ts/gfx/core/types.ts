
class CropInfo {
	
	private _left : number;
	public get left() : number {
		return this._left;
	}
	public set left(v : number) {
		this._left = v;
	}

	private _top : number;
	public get top() : number {
		return this._top;
	}
	public set top(v : number) {
		this._top = v;
	}

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

}


class Coordinate {

	private _left: number;
	public get left(): number {
		return this._left;
	}
	public set left(v: number) {
		this._left = v;
	}

	private _top: number;
	public get top(): number {
		return this._top;
	}
	public set top(v: number) {
		this._top = v;
	}

	private _right: number;
	public get right(): number {
		return this._right;
	}
	public set right(v: number) {
		this._right = v;
	}

	private _bottom: number;
	public get bottom(): number {
		return this._bottom;
	}
	public set bottom(v: number) {
		this._bottom = v;
	}

	constructor(left: number = 0, top: number = 0, right: number = 0, bottom: number = 0) {
		this._left = left;
		this._top = top;
		this._right = right;
		this._bottom = bottom;
	}

}
