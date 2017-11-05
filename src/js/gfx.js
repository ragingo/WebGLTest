"use strict";
class ShaderProgram {
    constructor(gl) {
        this.gl = gl;
    }
    compileVS(src) {
        let vs = this.gl.createShader(this.gl.VERTEX_SHADER);
        if (!this.compileShader(vs, src)) {
            return false;
        }
        this.gl.attachShader(this.program, vs);
        return true;
    }
    compileFS(src) {
        let vs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        if (!this.compileShader(vs, src)) {
            return false;
        }
        this.gl.attachShader(this.program, vs);
        return true;
    }
    compileShader(shader, src) {
        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log(this.gl.getShaderInfoLog(shader));
            return false;
        }
        return true;
    }
    compile(vs, fs) {
        this.program = this.gl.createProgram();
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
        this.gl.useProgram(this.program);
        return true;
    }
    getProgram() {
        return this.program;
    }
}
class Graphics {
    constructor(gl) {
        this.m_DrawTagets = [];
        this.gl = gl;
    }
    init(w, h) {
        this.gl.viewport(0, 0, w, h);
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
class DefaultDraw {
    getContext() {
        return this.gl;
    }
    setContext(gl) {
        this.gl = gl;
    }
    onBeginDraw() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
    onDraw() {
    }
    onEndDraw() {
    }
}
class TextureDrawInfo {
    get width() {
        return this._width;
    }
    set width(v) {
        this._width = v;
    }
    get height() {
        return this._height;
    }
    set height(v) {
        this._height = v;
    }
    get effectType() {
        return this._effectType;
    }
    set effectType(v) {
        this._effectType = v;
    }
    get color() {
        return this._color;
    }
    set color(v) {
        this._color = v;
    }
    get rotation() {
        return this._rotation;
    }
    set rotation(v) {
        this._rotation = v;
    }
    get scale() {
        return this._scale;
    }
    set scale(v) {
        this._scale = v;
    }
    get vivid() {
        return this._vivid;
    }
    set vivid(v) {
        this._vivid = v;
    }
    get polygonCount() {
        return this._polygonCount;
    }
    set polygonCount(v) {
        this._polygonCount = v;
    }
}
class TextureRender {
    constructor() {
        this.m_TextureLoaded = false;
        this.m_ShaderLoaded = false;
        this.m_Processing = false;
        this._textureDrawInfo = new TextureDrawInfo();
    }
    get textureDrawInfo() {
        return this._textureDrawInfo;
    }
    set textureDrawInfo(v) {
        this._textureDrawInfo = v;
    }
    getContext() {
        return this.gl;
    }
    setContext(gl) {
        this.gl = gl;
    }
    onBeginDraw() {
        if (!this.m_ShaderLoaded) {
            this.loadShader().then(r => {
                if (r) {
                    this.m_ShaderLoaded = true;
                    this.m_Processing = false;
                }
            });
        }
        if (!this.m_TextureLoaded) {
            this.loadTexture().then(r2 => {
            });
        }
    }
    onDraw() {
        if (!this.m_TextureLoaded) {
            return;
        }
        let gl = this.gl;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.m_MainTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        let uniformLocation = {
            sampler: gl.getUniformLocation(this.program, 'uSampler'),
            effectType: gl.getUniformLocation(this.program, 'effectType'),
            textureSize: gl.getUniformLocation(this.program, 'textureSize'),
            editColor: gl.getUniformLocation(this.program, 'editColor'),
            vividParams: gl.getUniformLocation(this.program, 'vividParams'),
        };
        gl.uniform1i(uniformLocation.sampler, 0);
        if (uniformLocation.textureSize) {
            gl.uniform2fv(uniformLocation.textureSize, [this._textureDrawInfo.width, this._textureDrawInfo.height]);
        }
        if (uniformLocation.editColor) {
            gl.uniform4fv(uniformLocation.editColor, this._textureDrawInfo.color);
        }
        if (uniformLocation.vividParams) {
            gl.uniform2fv(uniformLocation.vividParams, this._textureDrawInfo.vivid);
        }
        gl.uniform1i(uniformLocation.effectType, this._textureDrawInfo.effectType);
        gl.vertexAttrib3fv(gl.getAttribLocation(this.program, 'scale'), this._textureDrawInfo.scale);
        gl.vertexAttrib3fv(gl.getAttribLocation(this.program, 'rotation'), this._textureDrawInfo.rotation);
        const tex_w = 512.0;
        const tex_h = 512.0;
        let texCoords = [
            { left: 0, top: 0, width: 256, height: 256 },
            { left: 0, top: 256, width: 256, height: 256 },
            { left: 256, top: 0, width: 256, height: 256 },
            { left: 256, top: 256, width: 256, height: 256 },
        ];
        for (let i = 0; i < 4 - this._textureDrawInfo.polygonCount; i++) {
            texCoords.pop();
        }
        let vertices = [];
        for (let i = 0; i < texCoords.length; i++) {
            let tc = texCoords[i];
            let tmp_pos = {
                left: (tc.left / tex_w) * 2.0 - 1.0,
                top: (tc.top / tex_h) * 2.0 - 1.0,
                width: (tc.width / tex_w) * 2.0 - 1.0,
                height: (tc.height / tex_h) * 2.0 - 1.0,
                right: ((tc.left + tc.width) / tex_w) * 2.0 - 1.0,
                bottom: ((tc.top + tc.height) / tex_h) * 2.0 - 1.0,
            };
            let tmp_texCoord = {
                left: tc.left / tex_w,
                top: tc.top / tex_h,
                width: tc.width / tex_w,
                height: tc.height / tex_h,
                right: (tc.left + tc.width) / tex_w,
                bottom: (tc.top + tc.height) / tex_h,
            };
            let pos = [
                tmp_pos.left, -tmp_pos.bottom, 0,
                tmp_pos.right, -tmp_pos.bottom, 0,
                tmp_pos.left, -tmp_pos.top, 0,
                tmp_pos.right, -tmp_pos.top, 0,
            ];
            let texCoord = [
                tmp_texCoord.left, tmp_texCoord.bottom,
                tmp_texCoord.right, tmp_texCoord.bottom,
                tmp_texCoord.left, tmp_texCoord.top,
                tmp_texCoord.right, tmp_texCoord.top,
            ];
            vertices.push({
                pos: pos,
                texCoord: texCoord,
            });
        }
        let indexData = [
            0, 1, 2,
            1, 3, 2,
        ];
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Graphics.createIndexBuffer(gl, indexData));
        let that = this;
        vertices.forEach((vertex) => {
            let vbo_array = [
                {
                    buffer: Graphics.createVertexBuffer(gl, vertex.pos),
                    location: gl.getAttribLocation(that.program, 'position'),
                    stride: 3
                },
                {
                    buffer: Graphics.createVertexBuffer(gl, vertex.texCoord),
                    location: gl.getAttribLocation(that.program, 'texCoord'),
                    stride: 2
                },
            ];
            vbo_array.forEach(function (item, idx) {
                gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
                gl.enableVertexAttribArray(item.location);
                gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
            });
            gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
        });
    }
    onEndDraw() {
        let gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    async loadShader() {
        if (this.m_Processing) {
            return false;
        }
        this.m_Processing = true;
        let vs = await HttpUtil.getText("./glsl/texture_edit_vs.glsl");
        let fs = await HttpUtil.getText("./glsl/texture_edit_fs.glsl");
        if (!vs) {
            console.log("vs code not found.");
            return false;
        }
        if (!fs) {
            console.log("fs code not found.");
            return false;
        }
        this.m_ShaderProgram = new ShaderProgram(this.gl);
        if (!this.m_ShaderProgram.compile(vs, fs)) {
            console.log("shader compile failed.");
            return false;
        }
        let program = this.m_ShaderProgram.getProgram();
        if (!program) {
            console.log("webgl program is null.");
            return false;
        }
        this.program = program;
        return true;
    }
    async loadTexture() {
        if (this.m_Processing) {
            return false;
        }
        this.m_Processing = true;
        let img = new Image();
        img.onload = () => {
            let tex = Graphics.createTexture(this.gl, img);
            if (!tex) {
                console.log("texture is null.");
                return;
            }
            this.m_MainTexture = tex;
            this.m_TextureLoaded = true;
            this.m_Processing = false;
            console.log("texture loaded.");
        };
        img.src = "./res/Lenna.png";
        return true;
    }
}
class SubTextureRender {
    constructor() {
        this.m_TextureLoaded = false;
        this.m_ShaderLoaded = false;
        this.m_Processing = false;
    }
    getContext() {
        return this.gl;
    }
    setContext(gl) {
        this.gl = gl;
    }
    onBeginDraw() {
        if (!this.m_ShaderLoaded) {
            this.loadShader().then(r => {
                if (r) {
                    this.m_ShaderLoaded = true;
                    this.m_Processing = false;
                }
            });
        }
        if (!this.m_TextureLoaded) {
            this.loadTexture().then(r2 => {
            });
        }
    }
    onDraw() {
        if (!this.m_TextureLoaded) {
            return;
        }
        let gl = this.gl;
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.m_MainTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(gl.getUniformLocation(this.program, 'uSampler'), 0);
        const tex_w = 512.0;
        const tex_h = 512.0;
        let texCoords = [
            { left: 0, top: 0, width: 128, height: 128 },
            { left: 0, top: 128, width: 128, height: 128 },
            { left: 128, top: 0, width: 128, height: 128 },
            { left: 128, top: 128, width: 128, height: 128 },
        ];
        let vertices = [];
        for (let i = 0; i < texCoords.length; i++) {
            let tc = texCoords[i];
            let tmp_pos = {
                left: (tc.left / tex_w) * 2.0 - 1.0,
                top: (tc.top / tex_h) * 2.0 - 1.0,
                width: (tc.width / tex_w) * 2.0 - 1.0,
                height: (tc.height / tex_h) * 2.0 - 1.0,
                right: ((tc.left + tc.width) / tex_w) * 2.0 - 1.0,
                bottom: ((tc.top + tc.height) / tex_h) * 2.0 - 1.0,
            };
            let tmp_texCoord = {
                left: tc.left / tex_w,
                top: tc.top / tex_h,
                width: tc.width / tex_w,
                height: tc.height / tex_h,
                right: (tc.left + tc.width) / tex_w,
                bottom: (tc.top + tc.height) / tex_h,
            };
            let pos = [
                tmp_pos.left, -tmp_pos.bottom, 0,
                tmp_pos.right, -tmp_pos.bottom, 0,
                tmp_pos.left, -tmp_pos.top, 0,
                tmp_pos.right, -tmp_pos.top, 0,
            ];
            let texCoord = [
                tmp_texCoord.left, tmp_texCoord.bottom,
                tmp_texCoord.right, tmp_texCoord.bottom,
                tmp_texCoord.left, tmp_texCoord.top,
                tmp_texCoord.right, tmp_texCoord.top,
            ];
            vertices.push({
                pos: pos,
                texCoord: texCoord,
            });
        }
        let indexData = [
            0, 1, 2,
            1, 3, 2,
        ];
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Graphics.createIndexBuffer(gl, indexData));
        let that = this;
        vertices.forEach((vertex) => {
            let vbo_array = [
                {
                    buffer: Graphics.createVertexBuffer(gl, vertex.pos),
                    location: gl.getAttribLocation(that.program, 'position'),
                    stride: 3
                },
                {
                    buffer: Graphics.createVertexBuffer(gl, vertex.texCoord),
                    location: gl.getAttribLocation(that.program, 'texCoord'),
                    stride: 2
                },
            ];
            vbo_array.forEach(function (item, idx) {
                gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
                gl.enableVertexAttribArray(item.location);
                gl.vertexAttribPointer(item.location, item.stride, gl.FLOAT, false, 0, 0);
            });
            gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
        });
    }
    onEndDraw() {
        let gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    async loadShader() {
        if (this.m_Processing) {
            return false;
        }
        this.m_Processing = true;
        let vs = await HttpUtil.getText("./glsl/default_vs.glsl");
        let fs = await HttpUtil.getText("./glsl/default_fs.glsl");
        if (!vs) {
            console.log("vs code not found.");
            return false;
        }
        if (!fs) {
            console.log("fs code not found.");
            return false;
        }
        this.m_ShaderProgram = new ShaderProgram(this.gl);
        if (!this.m_ShaderProgram.compile(vs, fs)) {
            console.log("shader compile failed.");
            return false;
        }
        let program = this.m_ShaderProgram.getProgram();
        if (!program) {
            console.log("webgl program is null.");
            return false;
        }
        this.program = program;
        return true;
    }
    async loadTexture() {
        if (this.m_Processing) {
            return false;
        }
        this.m_Processing = true;
        let img = new Image();
        img.onload = () => {
            let tex = Graphics.createTexture(this.gl, img);
            if (!tex) {
                console.log("texture is null.");
                return;
            }
            this.m_MainTexture = tex;
            this.m_TextureLoaded = true;
            this.m_Processing = false;
            console.log("texture loaded.");
        };
        img.src = "./res/smile_basic_font_table.png";
        return true;
    }
}
