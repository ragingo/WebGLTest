class ShaderProgram {
  private program: WebGLProgram | null = null;

  constructor(private gl: WebGLRenderingContext) {}

  private compileVS(src: string) {
    if (!this.program) {
      return false;
    }
    const vs = this.gl.createShader(this.gl.VERTEX_SHADER);
    if (!vs || !this.compileShader(vs, src)) {
      return false;
    }
    this.gl.attachShader(this.program, vs);
    return true;
  }

  private compileFS(src: string) {
    if (!this.program) {
      return false;
    }
    const fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    if (!fs || !this.compileShader(fs, src)) {
      return false;
    }
    this.gl.attachShader(this.program, fs);
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
    if (!this.compileVS(vs)) {
      return false;
    }
    if (!this.compileFS(fs)) {
      return false;
    }

    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.log(this.gl.getProgramInfoLog(this.program));
      return false;
    }

    return true;
  }

  public getProgram() {
    return this.program;
  }
}
