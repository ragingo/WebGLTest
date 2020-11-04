import { Graphics } from './Graphics';
import { Border, Coordinate, Crop, IndexBufferObject, Position, Scale, Size } from './types';

export class GraphicsUtils {
  public static create9SliceSpritePositions(size: Size, scale: Scale, border: Border) {
    const { left, top, right, bottom } = border;
    const scaled_w = size.width * scale.x;
    const scaled_h = size.height * scale.y;
    const pos_lb_l = size.left;
    const pos_tb_t = size.top;
    const pos_cb_l = pos_lb_l + left;
    const pos_cb_t = pos_tb_t + top;
    const pos_cb_w = scaled_w - (left + right);
    const pos_cb_h = scaled_h - (top + bottom);
    const pos_rb_l = pos_lb_l + scaled_w - right;
    const pos_bb_t = pos_tb_t + scaled_h - bottom;

    /**
     * 0 1 2
     * 3 4 5
     * 6 7 8
     */
    return [
      { left: pos_lb_l, top: pos_tb_t, right: left, bottom: top },
      { left: pos_cb_l, top: pos_tb_t, right: pos_cb_w, bottom: top },
      { left: pos_rb_l, top: pos_tb_t, right: right, bottom: top },
      { left: pos_lb_l, top: pos_cb_t, right: left, bottom: pos_cb_h },
      { left: pos_cb_l, top: pos_cb_t, right: pos_cb_w, bottom: pos_cb_h },
      { left: pos_rb_l, top: pos_cb_t, right: right, bottom: pos_cb_h },
      { left: pos_lb_l, top: pos_bb_t, right: left, bottom: bottom },
      { left: pos_cb_l, top: pos_bb_t, right: pos_cb_w, bottom: bottom },
      { left: pos_rb_l, top: pos_bb_t, right: right, bottom: bottom }
    ] as Position[];
  }

  public static create9SliceSpriteTextureCoordinates(crop: Crop, border: Border) {
    const { left, top, right, bottom } = border;
    const tc_cb_w = crop.width - (left + right);
    const tc_cb_h = crop.height - (top + bottom);
    const tc_rb_l = crop.width - right;
    const tc_bb_t = crop.height - bottom;

    return [
      { left: 0, top: 0, width: left, height: top },
      { left: left, top: 0, width: tc_cb_w, height: top },
      { left: tc_rb_l, top: 0, width: right, height: top },
      { left: 0, top: top, width: left, height: tc_cb_h },
      { left: left, top: top, width: tc_cb_w, height: tc_cb_h },
      { left: tc_rb_l, top: top, width: right, height: tc_cb_h },
      { left: 0, top: tc_bb_t, width: left, height: bottom },
      { left: left, top: tc_bb_t, width: tc_cb_w, height: bottom },
      { left: tc_rb_l, top: tc_bb_t, width: right, height: bottom }
    ];
  }

  public static screenToWorld(canvasWidth: number, canvasHeight: number, pos: Position) {
    const newPos: Position = {
      left: pos.left / canvasWidth,
      top: pos.top / canvasHeight,
      right: (pos.left + pos.right) / canvasWidth,
      bottom: (pos.top + pos.bottom) / canvasHeight
    };

    const world = new Coordinate();
    world.left = newPos.left * 2.0 - 1.0;
    world.top = -(newPos.top * 2.0 - 1.0);
    world.right = newPos.right * 2.0 - 1.0;
    world.bottom = -(newPos.bottom * 2.0 - 1.0);
    return world;
  }

  public static create9SliceSpriteIndexBufferObject() {
    const indices: number[] = [];
    for (let i = 0; i < 9; i++) {
      indices.push(...[0, 1, 2, 1, 3, 2].map((v) => v + 4 * i));
    }
    return {
      buffer: Graphics.createIndexBuffer(indices),
      size: indices.length
    } as IndexBufferObject;
  }

  public static createVertexBufferObject(
    program: WebGLProgram,
    canvasWidth: number,
    canvasHeight: number,
    size: Size,
    scale: Scale,
    depth: number,
    crop: Crop,
    border: Border
  ) {
    const vertices_pos: number[] = [];
    {
      const positions = GraphicsUtils.create9SliceSpritePositions(size, scale, border);

      for (let i = 0; i < positions.length; i++) {
        const pos = GraphicsUtils.screenToWorld(canvasWidth, canvasHeight, positions[i]);
        // prettier-ignore
        vertices_pos.push(
          pos.left, pos.bottom, depth,
          pos.right, pos.bottom, depth,
          pos.left, pos.top, depth,
          pos.right, pos.top, depth
        );
      }
    }

    const vertices_uv: number[] = [];
    {
      const texcoords = GraphicsUtils.create9SliceSpriteTextureCoordinates(crop, border);

      for (let i = 0; i < texcoords.length; i++) {
        const screen_tc = texcoords[i];
        const uv_tc = {
          left: screen_tc.left / size.width,
          top: screen_tc.top / size.height,
          right: (screen_tc.left + screen_tc.width) / size.width,
          bottom: (screen_tc.top + screen_tc.height) / size.height
        };

        // prettier-ignore
        vertices_uv.push(
          uv_tc.left, uv_tc.bottom, uv_tc.right, uv_tc.bottom,
          uv_tc.left, uv_tc.top, uv_tc.right, uv_tc.top
        );
      }
    }

    const gl = Graphics.gl;

    const obj = [
      {
        buffer: Graphics.createVertexBuffer(vertices_pos),
        location: gl.getAttribLocation(program, 'position'),
        stride: 3
      },
      {
        buffer: Graphics.createVertexBuffer(vertices_uv),
        location: gl.getAttribLocation(program, 'texCoord'),
        stride: 2
      }
    ];

    return obj;
  }
}
