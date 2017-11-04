"use strict";
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
function main() {
    Application.registerAppFrame(new MainFrame());
    Application.main();
}
