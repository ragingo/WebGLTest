export class TextureDrawInfo {
  constructor(
    public width = 0,
    public height = 0,
    public effectType = 0,
    public color = new Float32Array(),
    public rotation = new Float32Array(),
    public scale = new Float32Array(),
    public vivid = new Float32Array(),
    public polygonCount = 0
  ) {}
}
