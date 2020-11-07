import { Texture } from './Texture';

export type Position = { left: number; top: number; right: number; bottom: number };

export type Scale = { x: number; y: number; z: number };

export type Rotate = { x: number; y: number; z: number };

export type Border = { left: number; top: number; right: number; bottom: number };

export class Size {
  constructor(public left = 0, public top = 0, public width = 0, public height = 0) {}
}

export class Crop {
  constructor(public left = 0, public top = 0, public width = 0, public height = 0) {}
}

export type Coordinate = { left: number; top: number; right: number; bottom: number };

export type UniformType = 'int' | 'uint' | 'float';

export type UniformInfo = {
  type: UniformType;
  value: any;
};

export type FrameBufferObject = {
  frameBuffer: WebGLBuffer | null;
  depthBuffer: WebGLBuffer | null;
  texture: Texture | null;
};

export type VertexBufferObject = {
  buffer: WebGLBuffer | null;
  location: number;
  stride: number;
};

export type IndexBufferObject = {
  buffer: WebGLBuffer | null;
  size: number;
};
