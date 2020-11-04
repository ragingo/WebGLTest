import DefaultFragmentShader from '../../glsl/default_fs.glsl';
import DefaultVertexShader from '../../glsl/default_vs.glsl';
import { Graphics } from './Graphics';
import { GraphicsUtils } from './GraphicsUtils';
import { ShaderProgram } from './ShaderProgram';
import { Texture } from './Texture';
import {
  Border,
  Crop,
  FrameBufferObject,
  IndexBufferObject,
  Rotate,
  Scale,
  Size,
  UniformInfo,
  VertexBufferObject
} from './types';

export class Sprite {
  private shaderProgram: ShaderProgram | null = null;
  private vertexBufferObjects: VertexBufferObject[] = [];
  private readonly frameBufferObjects: FrameBufferObject[] = [];
  private indexBufferObject: IndexBufferObject | null = null;
  private baseTexture: Texture | null = null;
  private textureSource: TexImageSource | null = null;

  public uniformLocationInfos: UniformInfo[] = [];
  public isVisible = true;
  public isDisposed = false;

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
    public border: Border = { left: 0, top: 0, right: 0, bottom: 0 }
  ) {
    if (!this.vertexShader || this.vertexShader.length === 0) {
      this.vertexShader = DefaultVertexShader;
    }
    if (!this.fragmentShader || this.fragmentShader.length === 0) {
      this.fragmentShader = DefaultFragmentShader;
    }
  }

  public initialize() {
    if (!this.vertexShader || !this.fragmentShader) {
      return;
    }

    if (this.frameBufferObjects.length === 0) {
      const obj1 = Graphics.createFrameBufferWithTexture(this.canvasWidth, this.canvasHeight);
      this.frameBufferObjects.push(obj1);

      const obj2 = Graphics.createFrameBufferWithTexture(this.canvasWidth, this.canvasHeight);
      this.frameBufferObjects.push(obj2);
    }
  }

  public dispose() {
    const gl = Graphics.gl;

    this.vertexBufferObjects.forEach((vbo) => {
      gl.deleteBuffer(vbo.buffer);
      vbo.buffer = null;
    });

    if (this.indexBufferObject) {
      gl.deleteBuffer(this.indexBufferObject.buffer);
      this.indexBufferObject.buffer = null;
    }

    this.frameBufferObjects.forEach((obj) => {
      gl.deleteFramebuffer(obj.frameBuffer);
      obj.frameBuffer = null;
      obj.texture?.dispose();
    });

    this.isDisposed = true;
  }

  public updateTexture(img: TexImageSource | null) {
    this.textureSource = img;
  }

  public isDrawable() {
    if (!this.isVisible || this.isDisposed) {
      return false;
    }
    return true;
  }

  public draw() {
    if (!this.isDrawable()) {
      return;
    }

    if (this.crop.width == 0) {
      this.crop.width = this.size.width;
    }
    if (this.crop.height == 0) {
      this.crop.height = this.size.height;
    }

    if (!this.shaderProgram) {
      if (!this.compile()) {
        return;
      }
    }

    const program = this.shaderProgram?.get();
    if (!program) {
      return;
    }

    Graphics.gl.useProgram(program);
    this.prepare(program);
    this.draw1st();

    // TODO: どうにかする
    Graphics.gl.uniform1i(Graphics.gl.getUniformLocation(program, 'effectType'), -1);

    this.draw2nd();
  }

  private prepare(program: WebGLProgram) {
    const gl = Graphics.gl;

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
    this.indexBufferObject ??= GraphicsUtils.create9SliceSpriteIndexBufferObject();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferObject.buffer);

    // vertex buffer object
    if (this.vertexBufferObjects.length === 0) {
      this.vertexBufferObjects = GraphicsUtils.createVertexBufferObject(
        program,
        this.canvasWidth,
        this.canvasHeight,
        this.size,
        this.scale,
        this.depth,
        this.crop,
        this.border
      );
    }
    this.vertexBufferObjects.forEach((item) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
      gl.enableVertexAttribArray(item.location);
      gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
    });
  }

  private draw1st() {
    if (!this.indexBufferObject) {
      return;
    }

    const gl = Graphics.gl;

    if (!this.baseTexture && this.textureSource) {
      const tex = Graphics.createTextureFromImage(this.textureSource);
      this.baseTexture = new Texture(gl, tex);
    }

    if (this.baseTexture) {
      this.baseTexture.activate();
      this.baseTexture.bind();
      this.baseTexture.updateTextureSource(this.textureSource);
    }

    const fbo = this.frameBufferObjects[0];
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.frameBuffer);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);

    gl.drawElements(gl.TRIANGLES, this.indexBufferObject.size, gl.UNSIGNED_SHORT, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (fbo.texture) {
      fbo.texture.activate();
      fbo.texture.bind();
    }
  }

  private draw2nd() {
    if (!this.indexBufferObject) {
      return;
    }

    const gl = Graphics.gl;

    const fbo2 = this.frameBufferObjects[1];
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2.frameBuffer);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);

    // TODO: ここで書き込んだ結果、一辺の長さが 1/4 になってる・・・どうにかして直す
    gl.drawElements(gl.TRIANGLES, this.indexBufferObject.size, gl.UNSIGNED_SHORT, 0);

    if (fbo2.texture) {
      fbo2.texture.activate();
      fbo2.texture.bind();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.drawElements(gl.TRIANGLES, this.indexBufferObject.size, gl.UNSIGNED_SHORT, 0);
  }

  private compile() {
    if (!this.vertexShader || !this.fragmentShader) {
      return false;
    }

    this.shaderProgram = new ShaderProgram(Graphics.gl);

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
}
