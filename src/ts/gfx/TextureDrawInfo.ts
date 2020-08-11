class TextureDrawInfo {
  private _width = 0;
  public get width() {
    return this._width;
  }
  public set width(v: number) {
    this._width = v;
  }

  private _height = 0;
  public get height() {
    return this._height;
  }
  public set height(v: number) {
    this._height = v;
  }

  private _effectType = 0;
  public get effectType() {
    return this._effectType;
  }
  public set effectType(v: number) {
    this._effectType = v;
  }

  private _color = new Float32Array();
  public get color() {
    return this._color;
  }
  public set color(v: Float32Array) {
    this._color = v;
  }

  private _rotation = new Float32Array();
  public get rotation() {
    return this._rotation;
  }
  public set rotation(v: Float32Array) {
    this._rotation = v;
  }

  private _scale = new Float32Array();
  public get scale() {
    return this._scale;
  }
  public set scale(v: Float32Array) {
    this._scale = v;
  }

  private _vivid = new Float32Array();
  public get vivid() {
    return this._vivid;
  }
  public set vivid(v: Float32Array) {
    this._vivid = v;
  }

  private _polygonCount = 0;
  public get polygonCount() {
    return this._polygonCount;
  }
  public set polygonCount(v: number) {
    this._polygonCount = v;
  }
}
