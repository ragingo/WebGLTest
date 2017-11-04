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
function main() {
    let view = new MainView();
    view.resetValues();
    let gl = view.canvas.getContext("webgl");
    if (!gl) {
        console.log("webgl not supported.");
        return;
    }
    let gfx = new Graphics(gl);
    if (!gfx.init(view.canvas.width, view.canvas.height)) {
        console.log("gfx init failed. ");
        return;
    }
    if (!gfx.prepare()) {
        console.log("gfx prepare failed. ");
        return;
    }
    let textureRender = new TextureRender();
    {
        gfx.pushRenderTarget(new DefaultDraw());
        gfx.pushRenderTarget(textureRender);
    }
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
