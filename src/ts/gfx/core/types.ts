class CropInfo {
  private _left: number;
  public get left() {
    return this._left;
  }
  public set left(v: number) {
    this._left = v;
  }

  private _top: number;
  public get top() {
    return this._top;
  }
  public set top(v: number) {
    this._top = v;
  }

  private _width: number;
  public get width() {
    return this._width;
  }
  public set width(v: number) {
    this._width = v;
  }

  private _height: number;
  public get height() {
    return this._height;
  }
  public set height(v: number) {
    this._height = v;
  }

  constructor(left = 0, top = 0, width = 0, height = 0) {
    this._left = left;
    this._top = top;
    this._width = width;
    this._height = height;
  }
}

class Coordinate {
  private _left: number;
  public get left() {
    return this._left;
  }
  public set left(v: number) {
    this._left = v;
  }

  private _top: number;
  public get top() {
    return this._top;
  }
  public set top(v: number) {
    this._top = v;
  }

  private _right: number;
  public get right() {
    return this._right;
  }
  public set right(v: number) {
    this._right = v;
  }

  private _bottom: number;
  public get bottom() {
    return this._bottom;
  }
  public set bottom(v: number) {
    this._bottom = v;
  }

  constructor(left = 0, top = 0, right = 0, bottom = 0) {
    this._left = left;
    this._top = top;
    this._right = right;
    this._bottom = bottom;
  }
}
