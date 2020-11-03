export type Scale = { x: number; y: number; z: number };

export type Rotate = { x: number; y: number; z: number };

export class Size {
  constructor(public left = 0, public top = 0, public width = 0, public height = 0) {}
}

export class Crop {
  constructor(public left = 0, public top = 0, public width = 0, public height = 0) {}
}

export class Coordinate {
  constructor(public left = 0, public top = 0, public right = 0, public bottom = 0) {}
}

export type UniformType = 'int' | 'uint' | 'float';

export type UniformInfo = { type: UniformType; name: string; value: any };

export type FrameBufferObject = { buffer: WebGLBuffer | null; texture: WebGLTexture | null };
