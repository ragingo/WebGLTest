import { Graphics } from './Graphics';
import { Border, Coordinate, Crop, IndexBufferObject, Position, Size } from './types';

export class GraphicsUtils {
  public static create9SliceSpritePositions(size: Size, border?: Border) {
    const { left, top, right, bottom } = border ?? { left: 0, top: 0, right: 0, bottom: 0 };

    const border_left = size.left;
    const border_right = border_left + size.width - right;
    const border_top = size.top;
    const border_bottom = border_top + size.height - bottom;

    const block_left = border_left + left;
    const block_top = border_top + top;
    const block_right = size.width - (left + right);
    const block_bottom = size.height - (top + bottom);

    /**
     * 0 1 2
     * 3 4 5
     * 6 7 8
     */
    // prettier-ignore
    return [
      { left: border_left,  top: border_top,    right: left,        bottom: top },
      { left: block_left,   top: border_top,    right: block_right, bottom: top },
      { left: border_right, top: border_top,    right: right,       bottom: top },
      { left: border_left,  top: block_top,     right: left,        bottom: block_bottom },
      { left: block_left,   top: block_top,     right: block_right, bottom: block_bottom },
      { left: border_right, top: block_top,     right: right,       bottom: block_bottom },
      { left: border_left,  top: border_bottom, right: left,        bottom: bottom },
      { left: block_left,   top: border_bottom, right: block_right, bottom: bottom },
      { left: border_right, top: border_bottom, right: right,       bottom: bottom }
    ] as Position[];
  }

  public static create9SliceSpriteTextureCoordinates(crop: Crop, border?: Border) {
    const { left, top, right, bottom } = border ?? { left: 0, top: 0, right: 0, bottom: 0 };

    const block_width = crop.width - (left + right);
    const block_height = crop.height - (top + bottom);

    const border_left = 0;
    const border_top = 0;
    const border_right = crop.width - right;
    const border_bottom = crop.height - bottom;

    // prettier-ignore
    return [
      { left: border_left,  top: border_top,    right: left,        bottom: top },
      { left: left,         top: border_top,    right: block_width, bottom: top },
      { left: border_right, top: border_top,    right: right,       bottom: top },
      { left: border_left,  top: top,           right: left,        bottom: block_height },
      { left: left,         top: top,           right: block_width, bottom: block_height },
      { left: border_right, top: top,           right: right,       bottom: block_height },
      { left: border_left,  top: border_bottom, right: left,        bottom: bottom },
      { left: left,         top: border_bottom, right: block_width, bottom: bottom },
      { left: border_right, top: border_bottom, right: right,       bottom: bottom }
    ] as Coordinate[];
  }

  public static screenToWorld(canvasSize: Size, pos: Position) {
    const newPos: Position = {
      left: pos.left / canvasSize.width,
      top: pos.top / canvasSize.height,
      right: (pos.left + pos.right) / canvasSize.width,
      bottom: (pos.top + pos.bottom) / canvasSize.height
    };

    const world: Position = {} as Position;
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
    canvasSize: Size,
    size: Size,
    depth: number,
    positions: Position[],
    texcoords: Coordinate[]
  ) {
    const vertices_pos: number[] = [];
    {
      for (let i = 0; i < positions.length; i++) {
        const pos = GraphicsUtils.screenToWorld(canvasSize, positions[i]);
        // prettier-ignore
        vertices_pos.push(
          pos.left,  pos.bottom, depth,
          pos.right, pos.bottom, depth,
          pos.left,  pos.top,    depth,
          pos.right, pos.top,    depth
        );
      }
    }

    const vertices_uv: number[] = [];
    {
      for (let i = 0; i < texcoords.length; i++) {
        const screen_tc = texcoords[i];
        const uv_tc = {
          left: screen_tc.left / size.width,
          top: screen_tc.top / size.height,
          right: (screen_tc.left + screen_tc.right) / size.width,
          bottom: (screen_tc.top + screen_tc.bottom) / size.height
        };

        // prettier-ignore
        vertices_uv.push(
          uv_tc.left, uv_tc.bottom, uv_tc.right, uv_tc.bottom,
          uv_tc.left, uv_tc.top,    uv_tc.right, uv_tc.top
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
