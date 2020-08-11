class Sprite {
  constructor() {}

  public initialize() {
    ShaderLoader.load('./glsl/default_vs.glsl', './glsl/default_fs.glsl', (vs, fs) => {
      this.m_VS = vs;
      this.m_FS = fs;
      this.m_ShaderLoaded = true;
    });
  }

  private compile() {
    if (!this.gl) {
      return;
    }
    if (!this.m_VS || !this.m_FS) {
      return;
    }

    this.m_ShaderProgram = new ShaderProgram(this.gl);

    if (!this.m_ShaderProgram.compile(this.m_VS, this.m_FS)) {
      console.log('shader compile failed.');
      return;
    }

    const program = this.m_ShaderProgram.getProgram();

    if (!program) {
      console.log('webgl program is null.');
      return;
    }

    this.program = program;
  }

  public draw(ctx: WebGLRenderingContext) {
    this.gl = ctx;
    const gl = this.gl;

    if (!this.m_ShaderLoaded) {
      return;
    }

    if (!this.m_ShaderProgram) {
      this.compile();
    }

    if (!this.program) {
      return;
    }

    let tex_w = 0;
    let tex_h = 0;
    if (this.m_OriginalImage) {
      tex_w = this.m_OriginalImage.naturalWidth;
      tex_h = this.m_OriginalImage.naturalHeight;
    }
    if (this.m_Width == 0) {
      this.m_Width = tex_w;
    }
    if (this.m_Height == 0) {
      this.m_Height = tex_h;
    }
    if (this.m_Crop.width == 0) {
      this.m_Crop.width = tex_w;
    }
    if (this.m_Crop.height == 0) {
      this.m_Crop.height = tex_h;
    }

    if (this.m_SliceBorder.length != 4) {
      return;
    }

    gl.useProgram(this.program);

    if (this.m_MainTexture && ctx.isTexture(this.m_MainTexture)) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.m_MainTexture);

      // NPOT の場合は filter は linear, wrap は clamp to edge にしないといけない
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.uniform1i(gl.getUniformLocation(this.program, 'uSampler'), 0);
      gl.uniform1i(gl.getUniformLocation(this.program, 'uShowBorder'), this.m_ShowBorder ? 1 : 0);
      {
        const loc = gl.getUniformLocation(this.program, 'uTextureSize');
        if (loc) {
          gl.uniform2fv(loc, [tex_w, tex_h]);
        }
      }
    }

    const positions = [];
    const texcoords = [];

    {
      // debug
      // this.m_SliceBorder = new Float32Array([20, 20, 20, 20]);
      // this.m_Left = 100;
      // this.m_Top = 100;
      // this.m_Width = 130;
      // this.m_Height = 100;
      // this.m_ScaleX = 2;
      // this.m_ScaleY = 2;
      // this.m_Crop = new CropInfo();
      // this.m_Crop.left = 0;
      // this.m_Crop.top = 0;
      // this.m_Crop.width = 130;
      // this.m_Crop.height = 100;
    }

    {
      let left_w = this.m_SliceBorder[0];
      let top_h = this.m_SliceBorder[1];
      let right_w = this.m_SliceBorder[2];
      let bottom_h = this.m_SliceBorder[3];

      let scaled_w = this.m_Width * this.m_ScaleX;
      let scaled_h = this.m_Height * this.m_ScaleY;
      let pos_lb_l = this.m_Left;
      let pos_tb_t = this.m_Top;
      let pos_cb_l = pos_lb_l + left_w;
      let pos_cb_t = pos_tb_t + top_h;
      let pos_cb_w = scaled_w - (left_w + right_w);
      let pos_cb_h = scaled_h - (top_h + bottom_h);
      let pos_rb_l = pos_lb_l + scaled_w - right_w;
      let pos_bb_t = pos_tb_t + scaled_h - bottom_h;

      let tc_cb_w = this.m_Crop.width - (left_w + right_w);
      let tc_cb_h = this.m_Crop.height - (top_h + bottom_h);
      let tc_rb_l = this.m_Crop.width - right_w;
      let tc_bb_t = this.m_Crop.height - bottom_h;

      /**
       * 0 1 2
       * 3 4 5
       * 6 7 8
       */

      //
      positions.push({ left: pos_lb_l, top: pos_tb_t, width: left_w, height: top_h });
      positions.push({ left: pos_cb_l, top: pos_tb_t, width: pos_cb_w, height: top_h });
      positions.push({ left: pos_rb_l, top: pos_tb_t, width: right_w, height: top_h });

      positions.push({ left: pos_lb_l, top: pos_cb_t, width: left_w, height: pos_cb_h });
      positions.push({ left: pos_cb_l, top: pos_cb_t, width: pos_cb_w, height: pos_cb_h });
      positions.push({ left: pos_rb_l, top: pos_cb_t, width: right_w, height: pos_cb_h });

      positions.push({ left: pos_lb_l, top: pos_bb_t, width: left_w, height: bottom_h });
      positions.push({ left: pos_cb_l, top: pos_bb_t, width: pos_cb_w, height: bottom_h });
      positions.push({ left: pos_rb_l, top: pos_bb_t, width: right_w, height: bottom_h });

      //
      texcoords.push({ left: 0, top: 0, width: left_w, height: top_h });
      texcoords.push({ left: left_w, top: 0, width: tc_cb_w, height: top_h });
      texcoords.push({ left: tc_rb_l, top: 0, width: right_w, height: top_h });

      texcoords.push({ left: 0, top: top_h, width: left_w, height: tc_cb_h });
      texcoords.push({ left: left_w, top: top_h, width: tc_cb_w, height: tc_cb_h });
      texcoords.push({ left: tc_rb_l, top: top_h, width: right_w, height: tc_cb_h });

      texcoords.push({ left: 0, top: tc_bb_t, width: left_w, height: bottom_h });
      texcoords.push({ left: left_w, top: tc_bb_t, width: tc_cb_w, height: bottom_h });
      texcoords.push({ left: tc_rb_l, top: tc_bb_t, width: right_w, height: bottom_h });
    }

    const canvas_w = 512.0;
    const canvas_h = 512.0;

    // 頂点バッファ更新
    const vertices_pos: number[] = [];
    const vertices_uv: number[] = [];

    for (let i = 0; i < positions.length; i++) {
      let screen_pos = positions[i];

      const world_pos = this.screenToWorld(
        new Coordinate(
          screen_pos.left / canvas_w,
          screen_pos.top / canvas_h,
          (screen_pos.left + screen_pos.width) / canvas_w,
          (screen_pos.top + screen_pos.height) / canvas_h
        )
      );

      [
        world_pos.left,
        world_pos.bottom,
        0,
        world_pos.right,
        world_pos.bottom,
        0,
        world_pos.left,
        world_pos.top,
        0,
        world_pos.right,
        world_pos.top,
        0
      ].forEach((v) => vertices_pos.push(v));
    }

    for (let i = 0; i < texcoords.length; i++) {
      const screen_tc = texcoords[i];
      const uv_tc = {
        left: screen_tc.left / tex_w,
        top: screen_tc.top / tex_h,
        right: (screen_tc.left + screen_tc.width) / tex_w,
        bottom: (screen_tc.top + screen_tc.height) / tex_h
      };

      [
        uv_tc.left,
        uv_tc.bottom,
        uv_tc.right,
        uv_tc.bottom,
        uv_tc.left,
        uv_tc.top,
        uv_tc.right,
        uv_tc.top
      ].forEach((v) => vertices_uv.push(v));
    }

    // インデックスバッファ生成 & 登録
    const indexData: number[] = [];

    for (let i = 0; i < 9; i++) {
      [0, 1, 2, 1, 3, 2]
        .map((v) => v + 4 * i)
        .forEach((v) => {
          indexData.push(v);
        });
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Graphics.createIndexBuffer(gl, indexData));

    const vbo_array = [
      {
        buffer: Graphics.createVertexBuffer(gl, vertices_pos),
        location: gl.getAttribLocation(this.program, 'position'),
        stride: 3
      },
      {
        buffer: Graphics.createVertexBuffer(gl, vertices_uv),
        location: gl.getAttribLocation(this.program, 'texCoord'),
        stride: 2
      }
    ];
    vbo_array.forEach(function (item, idx) {
      gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
      gl.enableVertexAttribArray(item.location);
      gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
    });

    let draw_mode = gl.TRIANGLES;
    let is_debug_mode = false;
    if (is_debug_mode) {
      draw_mode = gl.LINE_STRIP;
    }

    gl.drawElements(draw_mode, indexData.length, gl.UNSIGNED_SHORT, 0);
  }

  public get originalImage() {
    return this.m_OriginalImage;
  }
  public set originalImage(image: HTMLImageElement | null) {
    this.m_OriginalImage = image;
  }

  public get texture() {
    return this.m_MainTexture;
  }
  public set texture(texture: WebGLTexture | null) {
    this.m_MainTexture = texture;
  }

  private screenToWorld(coord: Coordinate): Coordinate {
    const world = new Coordinate();
    world.left = coord.left * 2.0 - 1.0;
    world.top = -(coord.top * 2.0 - 1.0);
    world.right = coord.right * 2.0 - 1.0;
    world.bottom = -(coord.bottom * 2.0 - 1.0);
    return world;
  }

  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private m_OriginalImage: HTMLImageElement | null = null;
  private m_MainTexture: WebGLTexture | null = null;
  private m_ShaderLoaded: boolean = false;
  private m_ShaderProgram: ShaderProgram | null = null;
  private m_VS: string | null = null;
  private m_FS: string | null = null;
  private m_SliceBorder = [0, 0, 0, 0];
  private m_Left = 0;
  private m_Top = 0;
  private m_Width = 0;
  private m_Height = 0;
  private m_Crop = new CropInfo();
  private m_ScaleX = 1;
  private m_ScaleY = 1;
  private m_ShowBorder = false;

  public get left() {
    return this.m_Left;
  }
  public set left(v: number) {
    this.m_Left = v;
  }

  public get top() {
    return this.m_Top;
  }
  public set top(v: number) {
    this.m_Top = v;
  }

  public get width() {
    return this.m_Width;
  }
  public set width(v: number) {
    this.m_Width = v;
  }

  public get height() {
    return this.m_Height;
  }
  public set height(v: number) {
    this.m_Height = v;
  }

  public get scaleX() {
    return this.m_ScaleX;
  }
  public set scaleX(v: number) {
    this.m_ScaleX = v;
  }

  public get scaleY() {
    return this.m_ScaleY;
  }
  public set scaleY(v: number) {
    this.m_ScaleY = v;
  }

  public get crop() {
    return this.m_Crop;
  }
  public set crop(v: CropInfo) {
    this.m_Crop = v;
  }

  public get sliceBorder() {
    return this.m_SliceBorder;
  }
  public set sliceBorder(v: number[]) {
    this.m_SliceBorder = v;
  }

  public get showBorder() {
    return this.m_ShowBorder;
  }
  public set showBorder(v: boolean) {
    this.m_ShowBorder = v;
  }
}
