import { glMatrix, mat4, vec3 } from 'gl-matrix';
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
  private vertexBufferObjectsForFrameBuffer: VertexBufferObject[] = [];
  private readonly frameBufferObjects: FrameBufferObject[] = [];
  private indexBufferObject: IndexBufferObject | null = null;
  private baseTexture: Texture | null = null;
  private textureSource: TexImageSource | null = null;

  public uniformLocationInfos: Map<string, UniformInfo> = new Map();
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

    this.vertexBufferObjectsForFrameBuffer.forEach((vbo) => {
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

    const gl = Graphics.gl;
    gl.useProgram(program);
    this.prepare(program);

    {
      if (!this.baseTexture && this.textureSource) {
        const tex = Graphics.createTextureFromImage(this.textureSource);
        this.baseTexture = new Texture(gl, tex);
      }

      if (this.baseTexture) {
        this.baseTexture.activate();
        this.baseTexture.bind();
        this.baseTexture.updateTextureSource(this.textureSource);
      }
    }

    this.draw1st(program);
    this.draw2nd(program);
    this.draw3rd(program);

    // this.debugDraw();
  }

  private prepare(program: WebGLProgram) {
    const gl = Graphics.gl;

    {
      const model = mat4.identity(mat4.create());
      const view = mat4.identity(mat4.create());
      const proj = mat4.identity(mat4.create());
      const mvp = mat4.identity(mat4.create());

      // mat4.perspective(proj, glMatrix.toRadian(10), 1, 0.01, 100);
      // mat4.lookAt(view, vec3.fromValues(0, 0, -10), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

      mat4.rotateX(model, model, glMatrix.toRadian(this.rotate.x));
      mat4.rotateY(model, model, glMatrix.toRadian(this.rotate.y));
      mat4.rotateZ(model, model, glMatrix.toRadian(this.rotate.z));
      mat4.scale(model, model, vec3.fromValues(this.scale.x, this.scale.y, this.scale.z));
      mat4.mul(mvp, mvp, proj);
      mat4.mul(mvp, mvp, view);
      mat4.mul(mvp, mvp, model);
      gl.uniformMatrix4fv(gl.getUniformLocation(program, 'mvp'), false, mvp);
    }

    // shader parameters
    {
      const infos: { name: string, info: UniformInfo }[] = [
        { name: 'uSampler', info: { type: 'int', value: 0 } },
        { name: 'textureSize', info: { type: 'float', value: [this.size.width, this.size.height] } },
      ];

      infos.forEach((x) => {
        Graphics.registerUniformLocation(program, x.name, x.info);
      });
      this.uniformLocationInfos.forEach((v, k) => {
        Graphics.registerUniformLocation(program, k, v);
      });
    }

    // index buffer
    this.indexBufferObject ??= GraphicsUtils.create9SliceSpriteIndexBufferObject();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferObject.buffer);

    // vertex buffer object
    if (this.vertexBufferObjects.length === 0) {
      this.vertexBufferObjects = GraphicsUtils.createVertexBufferObject(
        program,
        { left: 0, top: 0, width: this.canvasWidth, height: this.canvasHeight },
        this.size,
        this.depth,
        GraphicsUtils.create9SliceSpritePositions(this.size, this.border),
        GraphicsUtils.create9SliceSpriteTextureCoordinates(this.crop, this.border)
      );
    }
    this.vertexBufferObjects.forEach((item) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
      gl.enableVertexAttribArray(item.location);
      gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
    });

    // vertex buffer object for frame buffer
    if (this.vertexBufferObjectsForFrameBuffer.length === 0) {
      this.vertexBufferObjectsForFrameBuffer = GraphicsUtils.createVertexBufferObject(
        program,
        { left: 0, top: 0, width: this.canvasWidth, height: this.canvasHeight },
        { left: 0, top: 0, width: this.canvasWidth, height: this.canvasHeight },
        this.depth,
        GraphicsUtils.create9SliceSpritePositions({ left: 0, top: 0, width: this.canvasWidth, height: this.canvasHeight }),
        GraphicsUtils.create9SliceSpriteTextureCoordinates({ left: 0, top: 0, width: this.canvasWidth, height: this.canvasHeight })
      );
    }
  }

  // @ts-ignore
  private debugDraw() {
    if (!this.indexBufferObject) {
      return;
    }
    const gl = Graphics.gl;
    gl.drawElements(gl.TRIANGLES, this.indexBufferObject.size, gl.UNSIGNED_SHORT, 0);
  }

  private draw1st(program: WebGLProgram) {
    if (!this.indexBufferObject) {
      return;
    }

    const gl = Graphics.gl;

    const fbo = this.frameBufferObjects[0];
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.frameBuffer);

    gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1i(gl.getUniformLocation(program, 'nthPass'), 1);

    gl.drawElements(gl.TRIANGLES, this.indexBufferObject.size, gl.UNSIGNED_SHORT, 0);

    if (fbo.texture) {
      fbo.texture.activate();
      fbo.texture.bind();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private draw2nd(program: WebGLProgram) {
    if (!this.indexBufferObject) {
      return;
    }

    const gl = Graphics.gl;

    const fbo = this.frameBufferObjects[1];
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.frameBuffer);

    gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.vertexBufferObjectsForFrameBuffer.forEach((item) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
      gl.enableVertexAttribArray(item.location);
      gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
    });

    gl.uniform1i(gl.getUniformLocation(program, 'nthPass'), 2);

    gl.drawElements(gl.TRIANGLES, this.indexBufferObject.size, gl.UNSIGNED_SHORT, 0);

    if (fbo.texture) {
      fbo.texture.activate();
      fbo.texture.bind();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private draw3rd(program: WebGLProgram) {
    if (!this.indexBufferObject) {
      return;
    }

    const gl = Graphics.gl;

    const fbo = this.frameBufferObjects[0];
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.frameBuffer);

    gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.vertexBufferObjectsForFrameBuffer.forEach((item) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
      gl.enableVertexAttribArray(item.location);
      gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
    });

    gl.uniform1i(gl.getUniformLocation(program, 'nthPass'), 3);

    gl.drawElements(gl.TRIANGLES, this.indexBufferObject.size, gl.UNSIGNED_SHORT, 0);

    if (fbo.texture) {
      fbo.texture.activate();
      fbo.texture.bind();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.uniform1i(gl.getUniformLocation(program, 'nthPass'), 4);
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
