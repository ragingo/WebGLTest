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
class Graphics2 {
    constructor(gl) {
        this.m_DrawTagets = [];
        this.gl = gl;
    }
    init(w, h) {
        this.m_ViewportWidth = w;
        this.m_ViewportHeight = h;
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
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Graphics2.createIndexBuffer(gl, indexData));
        let that = this;
        vertices.forEach((vertex) => {
            let vbo_array = [
                {
                    buffer: Graphics2.createVertexBuffer(gl, vertex.pos),
                    location: gl.getAttribLocation(that.program, 'position'),
                    stride: 3
                },
                {
                    buffer: Graphics2.createVertexBuffer(gl, vertex.texCoord),
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
        let vs = await HttpUtils.getText("./glsl/default_vs.glsl");
        let fs = await HttpUtils.getText("./glsl/default_fs.glsl");
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
            let tex = Graphics2.createTexture(this.gl, img);
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
class ArrayUtils {
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
        this.fpsLabel = this.getById("fps");
        this.canvas = this.getById("canvas");
        this.effectSelector = this.getById("effectSelector");
        this.effectSelector.onchange = () => { this.onEffectTypeChanged(this.effectSelector); };
        ArrayUtils.pushAll([
            this.getById("slider_color_r"),
            this.getById("slider_color_g"),
            this.getById("slider_color_b"),
            this.getById("slider_color_a"),
        ], this.color);
        ArrayUtils.pushAll([
            this.getById("label_color_r_value"),
            this.getById("label_color_g_value"),
            this.getById("label_color_b_value"),
            this.getById("label_color_a_value"),
        ], this.colorLabels);
        this.color.forEach((x, i) => { x.oninput = () => this.onColorChanged(x, i); });
        ArrayUtils.pushAll([
            this.getById("slider_rotation_x"),
            this.getById("slider_rotation_y"),
            this.getById("slider_rotation_z"),
        ], this.rotation);
        ArrayUtils.pushAll([
            this.getById("label_rotation_x"),
            this.getById("label_rotation_y"),
            this.getById("label_rotation_z"),
        ], this.rotationLabels);
        this.rotation.forEach((x, i) => { x.oninput = () => this.onRotationChanged(x, i); });
        ArrayUtils.pushAll([
            this.getById("slider_scale_x"),
            this.getById("slider_scale_y"),
            this.getById("slider_scale_z"),
        ], this.scale);
        ArrayUtils.pushAll([
            this.getById("label_scale_x"),
            this.getById("label_scale_y"),
            this.getById("label_scale_z"),
        ], this.scaleLabels);
        this.scale.forEach((x, i) => { x.oninput = () => this.onScaleChanged(x, i); });
        ArrayUtils.pushAll([
            this.getById("slider_vivid_k1"),
            this.getById("slider_vivid_k2"),
        ], this.vivid);
        ArrayUtils.pushAll([
            this.getById("label_vivid_k1_value"),
            this.getById("label_vivid_k2_value"),
        ], this.vividLabels);
        this.vivid.forEach((x, i) => { x.oninput = () => this.onVividChanged(x, i); });
        this.polygonCount = this.getById("slider_polygon");
        this.polygonCount.onchange = () => { this.onPolygonCountChanged(this.polygonCount); };
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
    onEffectTypeChanged(sender) {
        let elems = ArrayUtils.toHTMLElements(document.getElementsByClassName("vivid_params"));
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
    }
}
function main2() {
    let view = new MainView();
    let gl = view.canvas.getContext("webgl");
    if (!gl) {
        console.log("webgl not supported.");
        return;
    }
    let gfx = new Graphics2(gl);
    if (!gfx.init(view.canvas.width, view.canvas.height)) {
        console.log("gfx init failed. ");
        return;
    }
    if (!gfx.prepare()) {
        console.log("gfx prepare failed. ");
        return;
    }
    gfx.pushRenderTarget(new DefaultDraw());
    let textureRender = new TextureRender();
    textureRender.textureDrawInfo = new TextureDrawInfo();
    gfx.pushRenderTarget(textureRender);
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
            view.setFpsLabel(frameCount + " FPS");
            frameCount = 0;
            elapsed -= 1000.0;
        }
        textureRender.textureDrawInfo.width = view.canvas.width;
        textureRender.textureDrawInfo.height = view.canvas.height;
        textureRender.textureDrawInfo.effectType = view.getEffectTypeValue();
        textureRender.textureDrawInfo.color = view.getColorValue();
        textureRender.textureDrawInfo.rotation = view.getRotationValue();
        textureRender.textureDrawInfo.scale = view.getScaleValue();
        textureRender.textureDrawInfo.vivid = view.getVividValue();
        textureRender.textureDrawInfo.polygonCount = view.getPolygonCountValue();
        gfx.render();
        window.requestAnimationFrame(frameRequestCallback);
    };
    window.requestAnimationFrame(frameRequestCallback);
}
