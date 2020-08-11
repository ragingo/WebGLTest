class Graphics {
  private gl: WebGLRenderingContext;
  private m_DrawTagets: IDrawable[] = [];

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  public init(width: number, height: number) {
    this.gl.viewport(0, 0, width, height);

    // アルファブレンドの有効化
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    // 深度テストの有効化
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    return true;
  }

  public prepare() {
    return true;
  }

  public render() {
    // begin
    this.m_DrawTagets.forEach((elem, i) => {
      elem.setContext(this.gl);
      elem.onBeginDraw();
    });

    // rendering
    this.m_DrawTagets.forEach((elem, i) => {
      elem.onDraw();
    });

    // end
    this.m_DrawTagets.forEach((elem, i) => {
      elem.onEndDraw();
    });

    this.gl.flush();
  }

  public pushRenderTarget(d: IDrawable) {
    this.m_DrawTagets.push(d);
  }

  public static createVertexBuffer(gl: WebGLRenderingContext, data: any[]) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buf;
  }

  public static createIndexBuffer(gl: WebGLRenderingContext, data: any[]) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return buf;
  }

  public static createTexture(gl: WebGLRenderingContext, img: TexImageSource) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }
}
