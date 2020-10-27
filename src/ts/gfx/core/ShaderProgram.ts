export class ShaderProgram {
  private program: WebGLProgram | null = null;

  public get() {
    return this.program;
  }

  constructor(private gl: WebGLRenderingContext) {}

  private compileVS(program: WebGLProgram, src: string) {
    const vs = this.gl.createShader(this.gl.VERTEX_SHADER);
    if (!vs || !this.compileShader(vs, src)) {
      return false;
    }
    this.gl.attachShader(program, vs);
    return true;
  }

  private compileFS(program: WebGLProgram, src: string) {
    const fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    if (!fs || !this.compileShader(fs, src)) {
      return false;
    }
    this.gl.attachShader(program, fs);
    return true;
  }

  private compileShader(shader: WebGLShader | null, src: string) {
    if (!shader) {
      return false;
    }

    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.log(this.gl.getShaderInfoLog(shader));
      return false;
    }

    return true;
  }

  public compile(vs: string, fs: string) {
    this.program = this.gl.createProgram();
    if (!this.program) {
      return false;
    }
    if (!this.compileVS(this.program, vs)) {
      return false;
    }
    if (!this.compileFS(this.program, fs)) {
      return false;
    }

    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.log(this.gl.getProgramInfoLog(this.program));
      return false;
    }

    return true;
  }
}
