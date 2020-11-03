import { Graphics } from './Graphics';
import { ShaderProgram } from './ShaderProgram';
import { Crop, Coordinate, UniformInfo, Rotate, Scale, Size, FrameBufferObject } from './types';

type VertexBufferObject = {
  buffer: WebGLBuffer | null;
  location: number;
  stride: number;
};

export class Sprite {
  private gl: WebGLRenderingContext | null = null;
  private shaderProgram: ShaderProgram | null = null;
  private vertexBufferObjects: VertexBufferObject[] = [];
  private indexBuffer: WebGLBuffer | null = null;
  private indexData: number[] = [];
  private readonly frameBufferObject: FrameBufferObject = {
    buffer: null,
    texture: null
  };
  private drawCounter = 0;

  private textureSource: TexImageSource | null = null;
  private needsRefreshTexture = false;

  public updateTexture(img: TexImageSource | null) {
    this.textureSource = img;
    this.needsRefreshTexture = true;
  }

  public uniformLocationInfos: UniformInfo[] = [];

  constructor(
    private readonly canvasWidth: number,
    private readonly canvasHeight: number,
    private readonly vertexShader?: string,
    private readonly fragmentShader?: string,
    public size = new Size(),
    public depth = 0,
    public crop = new Crop(),
    public scale: Scale = { x: 1, y: 1, z: 1 },
    public rotate: Rotate = { x: 0, y: 0, z: 0 },
    public sliceBorder = [0, 0, 0, 0]
  ) {
    if (!this.vertexShader || this.vertexShader.length === 0) {
      this.vertexShader = require('../../glsl/default_vs.glsl').default;
    }
    if (!this.fragmentShader || this.fragmentShader.length === 0) {
      this.fragmentShader = require('../../glsl/default_fs.glsl').default;
    }
  }

  public initialize() {
    if (!this.vertexShader || !this.fragmentShader) {
      return;
    }

    if (!this.frameBufferObject.buffer) {
      const obj = Graphics.createFrameBufferWithTexture(this.canvasWidth, this.canvasHeight);
      this.frameBufferObject.buffer = obj.buffer;
      this.frameBufferObject.texture = obj.texture;
    }
  }

  private compile() {
    if (!this.gl) {
      return false;
    }
    if (!this.vertexShader || !this.fragmentShader) {
      return false;
    }

    this.shaderProgram = new ShaderProgram(this.gl);

    if (!this.shaderProgram.compile(this.vertexShader, this.fragmentShader)) {
      console.log('shader compile failed.');
      return false;
    }

    if (!this.shaderProgram.get()) {
      console.log('webgl program is null.');
      return false;
    }

    return true;
  }

  public draw(ctx: WebGLRenderingContext) {
    this.gl = ctx;

    if (!this.shaderProgram) {
      if (!this.compile()) {
        return;
      }
    }

    if (this.crop.width == 0) {
      this.crop.width = this.size.width;
    }
    if (this.crop.height == 0) {
      this.crop.height = this.size.height;
    }
    if (this.sliceBorder.length != 4) {
      return;
    }

    const gl = this.gl;
    const program = this.shaderProgram?.get();

    if (!program) {
      return;
    }

    gl.useProgram(program);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferObject.buffer);

    if (this.textureSource) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.frameBufferObject.texture);

      if (this.needsRefreshTexture) {
        this.needsRefreshTexture = false;
        if (this.drawCounter++ === 0) {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureSource);
        } else {
          gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.textureSource);
        }
      }
    }

    // shader parameters
    {
      const infos: UniformInfo[] = [
        { type: 'int', name: 'uSampler', value: 0 },
        { type: 'float', name: 'scale', value: [this.scale.x, this.scale.y, this.scale.z] },
        { type: 'float', name: 'rotation', value: [this.rotate.x, this.rotate.y, this.rotate.z] },
        { type: 'float', name: 'textureSize', value: [this.size.width, this.size.height] }
      ];

      infos.forEach((x) => {
        Graphics.registerUniformLocation(program, x);
      });
      this.uniformLocationInfos.forEach((x) => {
        Graphics.registerUniformLocation(program, x);
      });
    }

    // index buffer
    if (!this.indexBuffer) {
      this.createIndexBuffer();
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    // vertex buffer objects
    if (this.vertexBufferObjects.length === 0) {
      this.vertexBufferObjects = this.createVertexBufferObjects();
    }
    this.vertexBufferObjects.forEach((item) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
      gl.enableVertexAttribArray(item.location);
      gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
    });

    let draw_mode = gl.TRIANGLES;
    const is_debug_mode = false;
    if (is_debug_mode) {
      draw_mode = gl.LINE_STRIP;
    }

    gl.drawElements(draw_mode, this.indexData.length, gl.UNSIGNED_SHORT, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.activeTexture(gl.TEXTURE0);
    gl.drawElements(draw_mode, this.indexData.length, gl.UNSIGNED_SHORT, 0);
  }

  private screenToWorld(coord: Coordinate) {
    const world = new Coordinate();
    world.left = coord.left * 2.0 - 1.0;
    world.top = -(coord.top * 2.0 - 1.0);
    world.right = coord.right * 2.0 - 1.0;
    world.bottom = -(coord.bottom * 2.0 - 1.0);
    return world;
  }

  private getPositions() {
    const positions = [];
    const [left_w, top_h, right_w, bottom_h] = this.sliceBorder;

    const scaled_w = this.size.width * this.scale.x;
    const scaled_h = this.size.height * this.scale.y;
    const pos_lb_l = this.size.left;
    const pos_tb_t = this.size.top;
    const pos_cb_l = pos_lb_l + left_w;
    const pos_cb_t = pos_tb_t + top_h;
    const pos_cb_w = scaled_w - (left_w + right_w);
    const pos_cb_h = scaled_h - (top_h + bottom_h);
    const pos_rb_l = pos_lb_l + scaled_w - right_w;
    const pos_bb_t = pos_tb_t + scaled_h - bottom_h;

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

    return positions;
  }

  private getTexcoords() {
    const texcoords = [];
    const [left_w, top_h, right_w, bottom_h] = this.sliceBorder;

    const tc_cb_w = this.crop.width - (left_w + right_w);
    const tc_cb_h = this.crop.height - (top_h + bottom_h);
    const tc_rb_l = this.crop.width - right_w;
    const tc_bb_t = this.crop.height - bottom_h;

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

    return texcoords;
  }

  private createIndexBuffer() {
    if (!this.gl) {
      return;
    }

    this.indexData.length = 0;

    for (let i = 0; i < 9; i++) {
      this.indexData.push(...[0, 1, 2, 1, 3, 2].map((v) => v + 4 * i));
    }

    this.indexBuffer = Graphics.createIndexBuffer(this.indexData);
  }

  private createVertexBufferObjects() {
    if (!this.gl) {
      return [];
    }

    const program = this.shaderProgram?.get();
    if (!program) {
      return [];
    }

    const vertices_pos: number[] = [];
    {
      const positions = this.getPositions();

      for (let i = 0; i < positions.length; i++) {
        const screen_pos = positions[i];

        const world_pos = this.screenToWorld(
          new Coordinate(
            screen_pos.left / this.canvasWidth,
            screen_pos.top / this.canvasHeight,
            (screen_pos.left + screen_pos.width) / this.canvasWidth,
            (screen_pos.top + screen_pos.height) / this.canvasHeight
          )
        );

        vertices_pos.push(
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
        );
      }
    }

    const vertices_uv: number[] = [];
    {
      const texcoords = this.getTexcoords();

      for (let i = 0; i < texcoords.length; i++) {
        const screen_tc = texcoords[i];
        const uv_tc = {
          left: screen_tc.left / this.size.width,
          top: screen_tc.top / this.size.height,
          right: (screen_tc.left + screen_tc.width) / this.size.width,
          bottom: (screen_tc.top + screen_tc.height) / this.size.height
        };

        vertices_uv.push(
          uv_tc.left,
          uv_tc.bottom,
          uv_tc.right,
          uv_tc.bottom,
          uv_tc.left,
          uv_tc.top,
          uv_tc.right,
          uv_tc.top
        );
      }
    }

    const objects = [
      {
        buffer: Graphics.createVertexBuffer(vertices_pos),
        location: this.gl.getAttribLocation(program, 'position'),
        stride: 3
      },
      {
        buffer: Graphics.createVertexBuffer(vertices_uv),
        location: this.gl.getAttribLocation(program, 'texCoord'),
        stride: 2
      }
    ];

    return objects;
  }
}
