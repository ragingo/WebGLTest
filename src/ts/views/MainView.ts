class ViewBase {
  public getById<T extends HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
  }
}

export class MainView extends ViewBase {
  private reset: HTMLButtonElement;
  private fpsLabel: HTMLParagraphElement;
  private effectSelector: HTMLSelectElement;
  private color: HTMLInputElement[] = [];
  private colorLabels: HTMLLabelElement[] = [];
  private rotation: HTMLInputElement[] = [];
  private rotationLabels: HTMLLabelElement[] = [];
  private scale: HTMLInputElement[] = [];
  private scaleLabels: HTMLLabelElement[] = [];
  private vivid: HTMLInputElement[] = [];
  private vividLabels: HTMLLabelElement[] = [];
  private polygonCount: HTMLInputElement;
  private polygonCountLabel: HTMLLabelElement;

  public canvas: HTMLCanvasElement;

  public setFpsLabel(value: string) {
    this.fpsLabel.innerText = value;
  }

  public getColorValue() {
    return new Float32Array(this.color.map((x) => x.valueAsNumber));
  }

  public getEffectTypeValue() {
    return parseInt(this.effectSelector.options[this.effectSelector.selectedIndex].value);
  }

  public getRotationValue() {
    return new Float32Array(this.rotation.map((x) => x.valueAsNumber));
  }

  public getScaleValue() {
    return new Float32Array(this.scale.map((x) => x.valueAsNumber));
  }

  public getVividValue() {
    return new Float32Array(this.vivid.map((x) => x.valueAsNumber));
  }

  public getPolygonCountValue() {
    return this.polygonCount.valueAsNumber;
  }

  constructor() {
    super();

    this.reset = this.getById('reset');
    this.reset.onclick = this.onResetClick;

    this.fpsLabel = this.getById('fps');
    this.canvas = this.getById('canvas');

    this.effectSelector = this.getById('effectSelector');
    this.effectSelector.onchange = () => {
      this.onEffectTypeChanged(this.effectSelector);
    };

    this.color = [
      this.getById('slider_color_r'),
      this.getById('slider_color_g'),
      this.getById('slider_color_b'),
      this.getById('slider_color_a')
    ];
    this.colorLabels = [
      this.getById('label_color_r_value'),
      this.getById('label_color_g_value'),
      this.getById('label_color_b_value'),
      this.getById('label_color_a_value')
    ];
    this.color.forEach((x, i) => {
      x.oninput = () => this.onColorChanged(x, i);
    });

    this.rotation = [
      this.getById('slider_rotation_x'),
      this.getById('slider_rotation_y'),
      this.getById('slider_rotation_z')
    ];
    this.rotationLabels = [
      this.getById('label_rotation_x'),
      this.getById('label_rotation_y'),
      this.getById('label_rotation_z')
    ];
    this.rotation.forEach((x, i) => {
      x.oninput = () => this.onRotationChanged(x, i);
    });

    this.scale = [this.getById('slider_scale_x'), this.getById('slider_scale_y'), this.getById('slider_scale_z')];
    this.scaleLabels = [this.getById('label_scale_x'), this.getById('label_scale_y'), this.getById('label_scale_z')];
    this.scale.forEach((x, i) => {
      x.oninput = () => this.onScaleChanged(x, i);
    });

    this.vivid = [this.getById('slider_vivid_k1'), this.getById('slider_vivid_k2')];
    this.vividLabels = [this.getById('label_vivid_k1_value'), this.getById('label_vivid_k2_value')];
    this.vivid.forEach((x, i) => {
      x.oninput = () => this.onVividChanged(x, i);
    });

    this.polygonCount = this.getById('slider_polygon');
    this.polygonCount.oninput = () => {
      this.onPolygonCountChanged(this.polygonCount);
    };
    this.polygonCountLabel = this.getById('label_polygon');
  }

  public resetValues() {
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

  private onResetClick = () => {
    this.resetValues();
  };

  private onEffectTypeChanged(sender: HTMLSelectElement) {
    const elems = Array.from(document.getElementsByClassName('vivid_params')).map((x) => x as HTMLElement);
    if (sender.selectedIndex == 16) {
      elems.forEach((x) => (x.style.visibility = 'visible'));
    } else {
      elems.forEach((x) => (x.style.visibility = 'collapse'));
    }
  }

  private onColorChanged(sender: HTMLInputElement, index: number) {
    this.colorLabels[index].innerText = sender.value;
  }

  private onRotationChanged(sender: HTMLInputElement, index: number) {
    this.rotationLabels[index].innerText = sender.value;
  }

  private onScaleChanged(sender: HTMLInputElement, index: number) {
    this.scaleLabels[index].innerText = sender.value;
  }

  private onVividChanged(sender: HTMLInputElement, index: number) {
    this.vividLabels[index].innerText = sender.value;
  }

  private onPolygonCountChanged(sender: HTMLInputElement) {
    this.polygonCountLabel.innerText = sender.value;
  }
}
