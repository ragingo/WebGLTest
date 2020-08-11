class ViewBase {
  public getById<T extends HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
  }
}

class MainView extends ViewBase {
  reset: HTMLButtonElement;
  fpsLabel: HTMLParagraphElement;
  canvas: HTMLCanvasElement;
  effectSelector: HTMLSelectElement;
  color: Array<HTMLInputElement> = [];
  colorLabels: Array<HTMLLabelElement> = [];
  rotation: Array<HTMLInputElement> = [];
  rotationLabels: Array<HTMLLabelElement> = [];
  scale: Array<HTMLInputElement> = [];
  scaleLabels: Array<HTMLLabelElement> = [];
  vivid: Array<HTMLInputElement> = [];
  vividLabels: Array<HTMLLabelElement> = [];
  polygonCount: HTMLInputElement;
  polygonCountLabel: HTMLLabelElement;

  public setFpsLabel(value: string): void {
    this.fpsLabel.innerText = value;
  }

  public getColorValue(): Float32Array {
    return new Float32Array(this.color.map((x) => x.valueAsNumber));
  }

  public getEffectTypeValue(): number {
    return parseInt(this.effectSelector.options[this.effectSelector.selectedIndex].value);
  }

  public getRotationValue(): Float32Array {
    return new Float32Array(this.rotation.map((x) => x.valueAsNumber));
  }

  public getScaleValue(): Float32Array {
    return new Float32Array(this.scale.map((x) => x.valueAsNumber));
  }

  public getVividValue(): Float32Array {
    return new Float32Array(this.vivid.map((x) => x.valueAsNumber));
  }

  public getPolygonCountValue(): number {
    return this.polygonCount.valueAsNumber;
  }

  constructor() {
    super();

    this.reset = this.getById('reset');
    this.reset.onclick = () => {
      this.onResetClick(this.reset);
    };

    this.fpsLabel = this.getById('fps');
    this.canvas = this.getById('canvas');
    this.effectSelector = this.getById('effectSelector');
    this.effectSelector.onchange = () => {
      this.onEffectTypeChanged(this.effectSelector);
    };

    ArrayUtil.pushAll(
      [
        this.getById('slider_color_r'),
        this.getById('slider_color_g'),
        this.getById('slider_color_b'),
        this.getById('slider_color_a')
      ],
      this.color
    );
    ArrayUtil.pushAll(
      [
        this.getById('label_color_r_value'),
        this.getById('label_color_g_value'),
        this.getById('label_color_b_value'),
        this.getById('label_color_a_value')
      ],
      this.colorLabels
    );
    this.color.forEach((x, i) => {
      x.oninput = () => this.onColorChanged(x, i);
    });

    ArrayUtil.pushAll(
      [this.getById('slider_rotation_x'), this.getById('slider_rotation_y'), this.getById('slider_rotation_z')],
      this.rotation
    );
    ArrayUtil.pushAll(
      [this.getById('label_rotation_x'), this.getById('label_rotation_y'), this.getById('label_rotation_z')],
      this.rotationLabels
    );
    this.rotation.forEach((x, i) => {
      x.oninput = () => this.onRotationChanged(x, i);
    });

    ArrayUtil.pushAll(
      [this.getById('slider_scale_x'), this.getById('slider_scale_y'), this.getById('slider_scale_z')],
      this.scale
    );
    ArrayUtil.pushAll(
      [this.getById('label_scale_x'), this.getById('label_scale_y'), this.getById('label_scale_z')],
      this.scaleLabels
    );
    this.scale.forEach((x, i) => {
      x.oninput = () => this.onScaleChanged(x, i);
    });

    ArrayUtil.pushAll([this.getById('slider_vivid_k1'), this.getById('slider_vivid_k2')], this.vivid);
    ArrayUtil.pushAll([this.getById('label_vivid_k1_value'), this.getById('label_vivid_k2_value')], this.vividLabels);
    this.vivid.forEach((x, i) => {
      x.oninput = () => this.onVividChanged(x, i);
    });

    this.polygonCount = this.getById('slider_polygon');
    this.polygonCount.oninput = () => {
      this.onPolygonCountChanged(this.polygonCount);
    };
    this.polygonCountLabel = this.getById('label_polygon');
  }

  public resetValues(): void {
    this.rotation.forEach((x) => (x.value = x.defaultValue));
    this.scale.forEach((x) => (x.value = x.defaultValue));
    this.color.forEach((x) => (x.value = x.defaultValue));
    this.effectSelector.value = '0';
    this.vivid.forEach((x) => (x.value = x.defaultValue));
    this.polygonCount.value = this.polygonCount.defaultValue;

    this.rotation.forEach((x) => x.dispatchEvent(new Event('input')));
    this.scale.forEach((x) => x.dispatchEvent(new Event('input')));
    this.color.forEach((x) => x.dispatchEvent(new Event('input')));
    this.effectSelector.dispatchEvent(new Event('change'));
    this.vivid.forEach((x) => x.dispatchEvent(new Event('input')));
    this.polygonCount.dispatchEvent(new Event('input'));
  }

  private onResetClick(sender: HTMLElement) {
    this.resetValues();
  }

  private onEffectTypeChanged(sender: HTMLSelectElement) {
    let elems = ArrayUtil.toHTMLElements(document.getElementsByClassName('vivid_params'));
    if (sender.selectedIndex == 16) {
      elems.forEach((x) => (x.style.visibility = 'visible'));
    } else {
      elems.forEach((x) => (x.style.visibility = 'collapse'));
    }
  }

  private onColorChanged(sender: HTMLInputElement, index: number) {
    this.colorLabels[index].innerText = sender.value.toString();
  }

  private onRotationChanged(sender: HTMLInputElement, index: number) {
    this.rotationLabels[index].innerText = sender.value.toString();
  }

  private onScaleChanged(sender: HTMLInputElement, index: number) {
    this.scaleLabels[index].innerText = sender.value.toString();
  }

  private onVividChanged(sender: HTMLInputElement, index: number) {
    this.vividLabels[index].innerText = sender.value.toString();
  }

  private onPolygonCountChanged(sender: HTMLInputElement) {
    this.polygonCountLabel.innerText = sender.value;
  }
}
