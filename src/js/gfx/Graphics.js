"use strict";
class Graphics {
    constructor(gl) {
        this.m_DrawTagets = [];
        this.gl = gl;
    }
    init(w, h) {
        this.gl.viewport(0, 0, w, h);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        return true;
    }
    prepare() {
        return true;
    }
    render() {
        this.m_DrawTagets.forEach((elem, i) => {
            elem.setContext(this.gl);
            elem.onBeginDraw();
        });
        this.m_DrawTagets.forEach((elem, i) => {
            elem.onDraw();
        });
        this.m_DrawTagets.forEach((elem, i) => {
            elem.onEndDraw();
        });
        this.gl.flush();
    }
    pushRenderTarget(d) {
        this.m_DrawTagets.push(d);
    }
    static createVertexBuffer(gl, data) {
        let buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return buf;
    }
    static createIndexBuffer(gl, data) {
        let buf = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return buf;
    }
    static createTexture(gl, img) {
        let tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return tex;
    }
}
