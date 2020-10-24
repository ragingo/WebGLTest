import { Graphics } from "./Graphics";
import { ShaderLoader } from "./ShaderLoader";
import { ShaderProgram } from "./ShaderProgram";
import { CropInfo, Coordinate } from "./types";

export class Sprite {
  private gl: WebGLRenderingContext | null = null;
  private shaderProgram: ShaderProgram | null = null;
  private vertexShader: string | null = null;
  private fragmentShader: string | null = null;
  public texture: WebGLTexture | null = null;

  private isShaderLoaded() {
    return this.vertexShader && this.fragmentShader;
  }

  constructor(
    public left = 0,
    public top = 0,
    public width = 0,
    public height = 0,
    public depth = 0,
    public crop = new CropInfo(),
    public scale: { x: number; y: number; z: number; } = { x: 1, y: 1, z: 1 },
    public rotate: { x: number; y: number; z: number; } = { x: 0, y: 0, z: 0 },
    public color: { r: number; g: number; b: number; a: number; } = { r: 255, g: 255, b: 255, a: 255 },
    public vividParams: { k1: number; k2: number } = { k1: 1, k2: 1 },
    public effectType = 0,
    public sliceBorder = [0, 0, 0, 0],
    public showBorder = false,
  ) {}

  public initialize() {
    ShaderLoader.load('./glsl/texture_edit_vs.glsl', './glsl/texture_edit_fs.glsl', (vs, fs) => {
      this.vertexShader = vs;
      this.fragmentShader = fs;
    });
  }

  private compile() {
    if (!this.gl) {
      return;
    }
    if (!this.vertexShader || !this.fragmentShader) {
      return;
    }

    this.shaderProgram = new ShaderProgram(this.gl);

    if (!this.shaderProgram.compile(this.vertexShader, this.fragmentShader)) {
      console.log('shader compile failed.');
      return;
    }

    if (!this.shaderProgram.program) {
      console.log('webgl program is null.');
      return;
    }
  }

  public draw(ctx: WebGLRenderingContext) {
    this.gl = ctx;

    if (!this.isShaderLoaded) {
      return;
    }

    if (!this.shaderProgram) {
      this.compile();
    }

    if (!this.shaderProgram?.program) {
      return;
    }

    const tex_w = this.width;
    const tex_h = this.height;
    if (this.crop.width == 0) {
      this.crop.width = tex_w;
    }
    if (this.crop.height == 0) {
      this.crop.height = tex_h;
    }
    if (this.sliceBorder.length != 4) {
      return;
    }

    const gl = this.gl;
    const program = this.shaderProgram.program;

    gl.useProgram(program);

    if (this.texture && ctx.isTexture(this.texture)) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      // NPOT の場合は filter は linear, wrap は clamp to edge にしないといけない
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const uniformLocation = {
        scale: gl.getUniformLocation(program, 'scale'),
        rotation: gl.getUniformLocation(program, 'rotation'),
        sampler: gl.getUniformLocation(program, 'uSampler'),
        effectType: gl.getUniformLocation(program, 'effectType'),
        textureSize: gl.getUniformLocation(program, 'textureSize'),
        editColor: gl.getUniformLocation(program, 'editColor'),
        vividParams: gl.getUniformLocation(program, 'vividParams'),
        showBorder: gl.getUniformLocation(program, 'uShowBorder'),
      };

      // テクスチャ登録
      gl.uniform1i(uniformLocation.sampler, 0);

      if (uniformLocation.scale) {
        gl.uniform3fv(uniformLocation.scale, new Float32Array([this.scale.x, this.scale.y, this.scale.z]));
      }
      if (uniformLocation.rotation) {
        gl.uniform3fv(uniformLocation.rotation, new Float32Array([this.rotate.x, this.rotate.y, this.rotate.z]));
      }
      if (uniformLocation.textureSize) {
        gl.uniform2fv(uniformLocation.textureSize, [tex_w, tex_h]);
      }
      if (uniformLocation.editColor) {
        gl.uniform4fv(uniformLocation.editColor, new Float32Array([this.color.r, this.color.g, this.color.b, this.color.a]));
      }
      if (uniformLocation.vividParams) {
        gl.uniform2fv(uniformLocation.vividParams, new Float32Array([this.vividParams.k1, this.vividParams.k2]));
      }
      gl.uniform1i(uniformLocation.effectType, this.effectType);
      if (uniformLocation.showBorder) {
        gl.uniform1i(uniformLocation.showBorder, this.showBorder ? 1 : 0);
      }
    }

    const positions = [];
    const texcoords = [];

    {
      const left_w = this.sliceBorder[0];
      const top_h = this.sliceBorder[1];
      const right_w = this.sliceBorder[2];
      const bottom_h = this.sliceBorder[3];

      const scaled_w = this.width * this.scale.x;
      const scaled_h = this.height * this.scale.y;
      const pos_lb_l = this.left;
      const pos_tb_t = this.top;
      const pos_cb_l = pos_lb_l + left_w;
      const pos_cb_t = pos_tb_t + top_h;
      const pos_cb_w = scaled_w - (left_w + right_w);
      const pos_cb_h = scaled_h - (top_h + bottom_h);
      const pos_rb_l = pos_lb_l + scaled_w - right_w;
      const pos_bb_t = pos_tb_t + scaled_h - bottom_h;

      const tc_cb_w = this.crop.width - (left_w + right_w);
      const tc_cb_h = this.crop.height - (top_h + bottom_h);
      const tc_rb_l = this.crop.width - right_w;
      const tc_bb_t = this.crop.height - bottom_h;

      /**
       * 0 1 2
       * 3 4 5
       * 6 7 8
       */

      positions.push(
        { left: pos_lb_l, top: pos_tb_t, width: left_w, height: top_h },
        { left: pos_cb_l, top: pos_tb_t, width: pos_cb_w, height: top_h },
        { left: pos_rb_l, top: pos_tb_t, width: right_w, height: top_h },
        { left: pos_lb_l, top: pos_cb_t, width: left_w, height: pos_cb_h },
        { left: pos_cb_l, top: pos_cb_t, width: pos_cb_w, height: pos_cb_h },
        { left: pos_rb_l, top: pos_cb_t, width: right_w, height: pos_cb_h },
        { left: pos_lb_l, top: pos_bb_t, width: left_w, height: bottom_h },
        { left: pos_cb_l, top: pos_bb_t, width: pos_cb_w, height: bottom_h },
        { left: pos_rb_l, top: pos_bb_t, width: right_w, height: bottom_h }
      );

      texcoords.push(
        { left: 0, top: 0, width: left_w, height: top_h },
        { left: left_w, top: 0, width: tc_cb_w, height: top_h },
        { left: tc_rb_l, top: 0, width: right_w, height: top_h },
        { left: 0, top: top_h, width: left_w, height: tc_cb_h },
        { left: left_w, top: top_h, width: tc_cb_w, height: tc_cb_h },
        { left: tc_rb_l, top: top_h, width: right_w, height: tc_cb_h },
        { left: 0, top: tc_bb_t, width: left_w, height: bottom_h },
        { left: left_w, top: tc_bb_t, width: tc_cb_w, height: bottom_h },
        { left: tc_rb_l, top: tc_bb_t, width: right_w, height: bottom_h }
      );
    }

    const canvas_w = 512.0;
    const canvas_h = 512.0;

    // 頂点バッファ更新
    const vertices_pos: number[] = [];
    const vertices_uv: number[] = [];

    for (let i = 0; i < positions.length; i++) {
      const screen_pos = positions[i];

      const world_pos = this.screenToWorld(
        new Coordinate(
          screen_pos.left / canvas_w,
          screen_pos.top / canvas_h,
          (screen_pos.left + screen_pos.width) / canvas_w,
          (screen_pos.top + screen_pos.height) / canvas_h
        )
      );

      vertices_pos.push(
        ...[
          world_pos.left,
          world_pos.bottom,
          this.depth,
          world_pos.right,
          world_pos.bottom,
          this.depth,
          world_pos.left,
          world_pos.top,
          this.depth,
          world_pos.right,
          world_pos.top,
          this.depth
        ]
      );
    }

    for (let i = 0; i < texcoords.length; i++) {
      const screen_tc = texcoords[i];
      const uv_tc = {
        left: screen_tc.left / tex_w,
        top: screen_tc.top / tex_h,
        right: (screen_tc.left + screen_tc.width) / tex_w,
        bottom: (screen_tc.top + screen_tc.height) / tex_h
      };

      vertices_uv.push(
        ...[uv_tc.left, uv_tc.bottom, uv_tc.right, uv_tc.bottom, uv_tc.left, uv_tc.top, uv_tc.right, uv_tc.top]
      );
    }

    // インデックスバッファ生成 & 登録
    const indexData: number[] = [];

    for (let i = 0; i < 9; i++) {
      indexData.push(...[0, 1, 2, 1, 3, 2].map((v) => v + 4 * i));
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Graphics.createIndexBuffer(gl, indexData));

    const vbo_array = [
      {
        buffer: Graphics.createVertexBuffer(gl, vertices_pos),
        location: gl.getAttribLocation(program, 'position'),
        stride: 3
      },
      {
        buffer: Graphics.createVertexBuffer(gl, vertices_uv),
        location: gl.getAttribLocation(program, 'texCoord'),
        stride: 2
      }
    ];
    vbo_array.forEach((item) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
      gl.enableVertexAttribArray(item.location);
      gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
    });

    let draw_mode = gl.TRIANGLES;
    const is_debug_mode = false;
    if (is_debug_mode) {
      draw_mode = gl.LINE_STRIP;
    }

    gl.drawElements(draw_mode, indexData.length, gl.UNSIGNED_SHORT, 0);
  }

  private screenToWorld(coord: Coordinate) {
    const world = new Coordinate();
    world.left = coord.left * 2.0 - 1.0;
    world.top = -(coord.top * 2.0 - 1.0);
    world.right = coord.right * 2.0 - 1.0;
    world.bottom = -(coord.bottom * 2.0 - 1.0);
    return world;
  }
}
