"use strict";
function main() {
    Application.registerAppFrame(new MainFrame());
    Application.main();
}
class Application {
    static registerAppFrame(frame) {
        Application.s_AppFrames.push(frame);
    }
    static main() {
        Application.s_AppFrames.forEach(f => {
            f.onStart();
        });
        let frameCount = 0;
        let now = 0.0;
        let last = 0.0;
        let elapsed = 0.0;
        let frameRequestCallback = (time) => {
            now = time;
            elapsed += (now - last);
            last = now;
            frameCount++;
            if (elapsed >= 1000) {
                Application.s_AppFrames.forEach(f => {
                    f.onFpsUpdate(frameCount);
                });
                frameCount = 0;
                elapsed -= 1000.0;
            }
            Application.s_AppFrames.forEach(f => {
                f.onUpdate();
            });
            window.requestAnimationFrame(frameRequestCallback);
        };
        window.requestAnimationFrame(frameRequestCallback);
    }
}
Application.s_AppFrames = [];
class MainFrame {
    constructor() {
        this.m_View = new MainView();
        this.m_View.resetValues();
        this.m_TextureRender = new TextureRender();
    }
    onFpsUpdate(fps) {
        this.m_View.setFpsLabel(fps + "FPS");
    }
    onStart() {
        let gl = this.m_View.canvas.getContext("webgl");
        if (!gl) {
            console.log("webgl not supported.");
            return;
        }
        this.m_Gfx = new Graphics(gl);
        if (!this.m_Gfx.init(this.m_View.canvas.width, this.m_View.canvas.height)) {
            console.log("gfx init failed. ");
            return;
        }
        if (!this.m_Gfx.prepare()) {
            console.log("gfx prepare failed. ");
            return;
        }
        this.m_Gfx.pushRenderTarget(new DefaultDraw());
        this.m_Gfx.pushRenderTarget(this.m_TextureRender);
        this.m_Gfx.pushRenderTarget(new SubTextureRender());
    }
    onUpdate() {
        this.m_TextureRender.textureDrawInfo.width = this.m_View.canvas.width;
        this.m_TextureRender.textureDrawInfo.height = this.m_View.canvas.height;
        this.m_TextureRender.textureDrawInfo.effectType = this.m_View.getEffectTypeValue();
        this.m_TextureRender.textureDrawInfo.color = this.m_View.getColorValue();
        this.m_TextureRender.textureDrawInfo.rotation = this.m_View.getRotationValue();
        this.m_TextureRender.textureDrawInfo.scale = this.m_View.getScaleValue();
        this.m_TextureRender.textureDrawInfo.vivid = this.m_View.getVividValue();
        this.m_TextureRender.textureDrawInfo.polygonCount = this.m_View.getPolygonCountValue();
        this.m_Gfx.render();
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
class SubTextureRender {
    constructor() {
        this.m_TextureLoaded = false;
        this.m_Processing = false;
    }
    getContext() {
        return this.gl;
    }
    setContext(gl) {
        this.gl = gl;
    }
    onBeginDraw() {
        if (!this.m_TextureLoaded) {
            this.loadTexture().then(r2 => {
            });
        }
    }
    onDraw() {
        if (this.m_Sprite) {
            this.m_Sprite.draw(this.gl);
        }
    }
    onEndDraw() {
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
            this.m_Sprite = new Sprite();
            this.m_Sprite.texture = tex;
            this.m_Sprite.initialize();
            this.m_TextureLoaded = true;
            this.m_Processing = false;
            console.log("texture loaded.");
        };
        img.src = "./res/smile_basic_font_table.png";
        return true;
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
        gl.useProgram(this.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.m_MainTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        let uniformLocation = {
            scale: gl.getUniformLocation(this.program, 'scale'),
            rotatoin: gl.getUniformLocation(this.program, 'rotation'),
            sampler: gl.getUniformLocation(this.program, 'uSampler'),
            effectType: gl.getUniformLocation(this.program, 'effectType'),
            textureSize: gl.getUniformLocation(this.program, 'textureSize'),
            editColor: gl.getUniformLocation(this.program, 'editColor'),
            vividParams: gl.getUniformLocation(this.program, 'vividParams'),
        };
        gl.uniform1i(uniformLocation.sampler, 0);
        if (uniformLocation.scale) {
            gl.uniform3fv(uniformLocation.scale, this._textureDrawInfo.scale);
        }
        if (uniformLocation.rotatoin) {
            gl.uniform3fv(uniformLocation.rotatoin, this._textureDrawInfo.rotation);
        }
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
class ShaderLoadResult {
    constructor(success, vs = "", fs = "") {
        this.m_success = success;
        this.m_vs = vs;
        this.m_fs = fs;
    }
    get success() {
        return this.m_success;
    }
    get vs() {
        return this.m_vs;
    }
    get fs() {
        return this.m_fs;
    }
}
class ShaderLoader {
    static load(vs_path, fs_path, callback) {
        ShaderLoader.loadAsync(vs_path, fs_path).then(r => {
            if (r.success) {
                if (callback) {
                    callback(r.vs, r.fs);
                }
            }
        });
    }
    static async loadAsync(vs_path, fs_path) {
        let vs = await HttpUtil.getText(vs_path);
        let fs = await HttpUtil.getText(fs_path);
        if (!vs) {
            console.log("vs code not found.");
            return new ShaderLoadResult(false);
        }
        if (!fs) {
            console.log("fs code not found.");
            return new ShaderLoadResult(false);
        }
        return new ShaderLoadResult(true, vs, fs);
    }
}
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
        return true;
    }
    getProgram() {
        return this.program;
    }
}
class Sprite {
    constructor() {
        this.m_ShaderLoaded = false;
    }
    initialize() {
        ShaderLoader.load("./glsl/default_vs.glsl", "./glsl/default_fs.glsl", (vs, fs) => {
            this.m_VS = vs;
            this.m_FS = fs;
            this.m_ShaderLoaded = true;
        });
    }
    compile() {
        this.m_ShaderProgram = new ShaderProgram(this.gl);
        if (!this.m_ShaderProgram.compile(this.m_VS, this.m_FS)) {
            console.log("shader compile failed.");
            return;
        }
        let program = this.m_ShaderProgram.getProgram();
        if (!program) {
            console.log("webgl program is null.");
            return;
        }
        this.program = program;
    }
    draw(ctx) {
        this.gl = ctx;
        let gl = this.gl;
        if (!this.m_ShaderLoaded) {
            return;
        }
        if (!this.m_ShaderProgram) {
            this.compile();
        }
        if (!this.program) {
            return;
        }
        gl.useProgram(this.program);
        if (this.m_MainTexture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.m_MainTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.uniform1i(gl.getUniformLocation(this.program, 'uSampler'), 0);
        }
        const tex_w = 512.0;
        const tex_h = 512.0;
        let texCoords = [
            { left: 0, top: 0, width: 0, height: 0 },
            { left: 0, top: 0, width: 0, height: 0 },
            { left: 0, top: 0, width: 0, height: 0 },
            { left: 0, top: 0, width: 100, height: tex_h },
            { left: 100, top: 0, width: tex_w - 200, height: tex_h },
            { left: 412, top: 0, width: 100, height: tex_h },
            { left: 0, top: 0, width: 0, height: 0 },
            { left: 0, top: 0, width: 0, height: 0 },
            { left: 0, top: 0, width: 0, height: 0 },
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
        vertices.forEach((vertex) => {
            let vbo_array = [
                {
                    buffer: Graphics.createVertexBuffer(gl, vertex.pos),
                    location: gl.getAttribLocation(this.program, 'position'),
                    stride: 3
                },
                {
                    buffer: Graphics.createVertexBuffer(gl, vertex.texCoord),
                    location: gl.getAttribLocation(this.program, 'texCoord'),
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
    get texture() {
        return this.m_MainTexture;
    }
    set texture(texture) {
        this.m_MainTexture = texture;
    }
}
class ArrayUtil {
    static toHTMLElements(array) {
        let result = [];
        for (let i = 0; i < array.length; i++) {
            let item = array[i];
            result.push(item);
        }
        return result;
    }
    static pushAll(src, dst) {
        src.forEach(x => dst.push(x));
    }
}
class DomUtil {
    static getElems(key) {
        if (!key) {
            return null;
        }
        let result = [];
        if (key[0] == '#') {
            let elem = document.getElementById(key.substr(1));
            if (elem) {
                result.push(elem);
            }
        }
        else if (key[0] == '.') {
            let elems = document.getElementsByClassName(key.substr(1));
            for (let i = 0; i < elems.length; i++) {
                result.push(elems[i]);
            }
        }
        else if (/^<[0-9a-zA-Z]+>$/.test(key)) {
            let name = key.substring(1, key.length - 1);
            let elems = document.getElementsByTagName(name);
            for (let i = 0; i < elems.length; i++) {
                result.push(elems[i]);
            }
        }
        else {
            let elems = document.getElementsByName(key);
            for (let i = 0; i < elems.length; i++) {
                result.push(elems[i]);
            }
        }
        return result;
    }
    ;
    static getElem(key) {
        let elems = DomUtil.getElems(key);
        if (elems && elems.length > 0) {
            return elems[0];
        }
        return null;
    }
}
class HttpUtil {
    static async get(url, responseType) {
        return new Promise(resolve => {
            let xhr = new XMLHttpRequest();
            xhr.addEventListener("loadend", function () {
                if (xhr.readyState != 4) {
                    console.log("not ready.");
                    return;
                }
                if (xhr.status != 200) {
                    console.log("http response status error.");
                    return;
                }
                resolve(xhr);
                console.log("request completed.(" + url + ")");
            });
            if (responseType) {
                xhr.responseType = responseType;
            }
            xhr.open("GET", url);
            xhr.send();
            console.log("start http request. (" + url + ")");
        });
    }
    static async getText(url) {
        let xhr = await HttpUtil.get(url);
        return new Promise(resolve => {
            return resolve(xhr.responseText);
        });
    }
    static async getRaw(url) {
        let xhr = await HttpUtil.get(url);
        return new Promise(resolve => {
            return resolve(xhr.response);
        });
    }
    static async getBinary(url) {
        let xhr = await HttpUtil.get(url, "arraybuffer");
        return new Promise(resolve => {
            return resolve(xhr.response);
        });
    }
}
class ViewBase {
    getById(id) {
        return document.getElementById(id);
    }
}
class MainView extends ViewBase {
    constructor() {
        super();
        this.color = [];
        this.colorLabels = [];
        this.rotation = [];
        this.rotationLabels = [];
        this.scale = [];
        this.scaleLabels = [];
        this.vivid = [];
        this.vividLabels = [];
        this.reset = this.getById("reset");
        this.reset.onclick = () => { this.onResetClick(this.reset); };
        this.fpsLabel = this.getById("fps");
        this.canvas = this.getById("canvas");
        this.effectSelector = this.getById("effectSelector");
        this.effectSelector.onchange = () => { this.onEffectTypeChanged(this.effectSelector); };
        ArrayUtil.pushAll([
            this.getById("slider_color_r"),
            this.getById("slider_color_g"),
            this.getById("slider_color_b"),
            this.getById("slider_color_a"),
        ], this.color);
        ArrayUtil.pushAll([
            this.getById("label_color_r_value"),
            this.getById("label_color_g_value"),
            this.getById("label_color_b_value"),
            this.getById("label_color_a_value"),
        ], this.colorLabels);
        this.color.forEach((x, i) => { x.oninput = () => this.onColorChanged(x, i); });
        ArrayUtil.pushAll([
            this.getById("slider_rotation_x"),
            this.getById("slider_rotation_y"),
            this.getById("slider_rotation_z"),
        ], this.rotation);
        ArrayUtil.pushAll([
            this.getById("label_rotation_x"),
            this.getById("label_rotation_y"),
            this.getById("label_rotation_z"),
        ], this.rotationLabels);
        this.rotation.forEach((x, i) => { x.oninput = () => this.onRotationChanged(x, i); });
        ArrayUtil.pushAll([
            this.getById("slider_scale_x"),
            this.getById("slider_scale_y"),
            this.getById("slider_scale_z"),
        ], this.scale);
        ArrayUtil.pushAll([
            this.getById("label_scale_x"),
            this.getById("label_scale_y"),
            this.getById("label_scale_z"),
        ], this.scaleLabels);
        this.scale.forEach((x, i) => { x.oninput = () => this.onScaleChanged(x, i); });
        ArrayUtil.pushAll([
            this.getById("slider_vivid_k1"),
            this.getById("slider_vivid_k2"),
        ], this.vivid);
        ArrayUtil.pushAll([
            this.getById("label_vivid_k1_value"),
            this.getById("label_vivid_k2_value"),
        ], this.vividLabels);
        this.vivid.forEach((x, i) => { x.oninput = () => this.onVividChanged(x, i); });
        this.polygonCount = this.getById("slider_polygon");
        this.polygonCount.oninput = () => { this.onPolygonCountChanged(this.polygonCount); };
        this.polygonCountLabel = this.getById("label_polygon");
    }
    setFpsLabel(value) {
        this.fpsLabel.innerText = value;
    }
    getColorValue() {
        return new Float32Array(this.color.map(x => x.valueAsNumber));
    }
    getEffectTypeValue() {
        return parseInt(this.effectSelector.options[this.effectSelector.selectedIndex].value);
    }
    getRotationValue() {
        return new Float32Array(this.rotation.map(x => x.valueAsNumber));
    }
    getScaleValue() {
        return new Float32Array(this.scale.map(x => x.valueAsNumber));
    }
    getVividValue() {
        return new Float32Array(this.vivid.map(x => x.valueAsNumber));
    }
    getPolygonCountValue() {
        return this.polygonCount.valueAsNumber;
    }
    resetValues() {
        this.rotation.forEach(x => x.value = x.defaultValue);
        this.scale.forEach(x => x.value = x.defaultValue);
        this.color.forEach(x => x.value = x.defaultValue);
        this.effectSelector.value = "0";
        this.vivid.forEach(x => x.value = x.defaultValue);
        this.polygonCount.value = this.polygonCount.defaultValue;
        this.rotation.forEach(x => x.oninput.call(null));
        this.scale.forEach(x => x.oninput.call(null));
        this.color.forEach(x => x.oninput.call(null));
        this.effectSelector.onchange.call(null);
        this.vivid.forEach(x => x.oninput.call(null));
        this.polygonCount.oninput.call(null);
    }
    onResetClick(sender) {
        this.resetValues();
    }
    onEffectTypeChanged(sender) {
        let elems = ArrayUtil.toHTMLElements(document.getElementsByClassName("vivid_params"));
        if (sender.selectedIndex == 16) {
            elems.forEach(x => x.style.visibility = "visible");
        }
        else {
            elems.forEach(x => x.style.visibility = "collapse");
        }
    }
    onColorChanged(sender, index) {
        this.colorLabels[index].innerText = sender.value.toString();
    }
    onRotationChanged(sender, index) {
        this.rotationLabels[index].innerText = sender.value.toString();
    }
    onScaleChanged(sender, index) {
        this.scaleLabels[index].innerText = sender.value.toString();
    }
    onVividChanged(sender, index) {
        this.vividLabels[index].innerText = sender.value.toString();
    }
    onPolygonCountChanged(sender) {
        this.polygonCountLabel.innerText = sender.value;
    }
}
