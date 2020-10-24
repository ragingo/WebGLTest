const getById = <T extends HTMLElement>(id: string): T => {
  return document.getElementById(id) as T;
}

export class MainView {
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
  // private polygonCount: HTMLInputElement;
  // private polygonCountLabel: HTMLLabelElement;

  public canvas: HTMLCanvasElement;

  public setFpsLabel(value: string) {
    this.fpsLabel.innerText = value;
  }

  public getColorValue() {
    const color = Array.from(this.color.map((x) => x.valueAsNumber));
    return {
      r: color[0],
      g: color[1],
      b: color[2],
      a: color[3],
    };
  }

  public getEffectTypeValue() {
    return parseInt(this.effectSelector.options[this.effectSelector.selectedIndex].value);
  }

  public getRotationValue() {
    const rotation = Array.from(this.rotation.map((x) => x.valueAsNumber));
    return {
      x: rotation[0],
      y: rotation[1],
      z: rotation[2],
    };
  }

  public getScaleValue() {
    const scale = Array.from(this.scale.map((x) => x.valueAsNumber));
    return {
      x: scale[0],
      y: scale[1],
      z: scale[2],
    };
  }

  public getVividValue() {
    const vivid = Array.from(this.vivid.map((x) => x.valueAsNumber));
    return {
      k1: vivid[0],
      k2: vivid[1],
    };
  }

  // public getPolygonCountValue() {
  //   return this.polygonCount.valueAsNumber;
  // }

  constructor() {
    this.reset = getById('reset');
    this.reset.onclick = this.onResetClick;

    this.fpsLabel = getById('fps');
    this.canvas = getById('canvas');

    this.effectSelector = getById('effectSelector');
    this.effectSelector.onchange = () => {
      this.onEffectTypeChanged(this.effectSelector);
    };

    this.color = [
      getById('slider_color_r'),
      getById('slider_color_g'),
      getById('slider_color_b'),
      getById('slider_color_a')
    ];
    this.colorLabels = [
      getById('label_color_r_value'),
      getById('label_color_g_value'),
      getById('label_color_b_value'),
      getById('label_color_a_value')
    ];
    this.color.forEach((x, i) => {
      x.oninput = () => this.onColorChanged(x, i);
    });

    this.rotation = [
      getById('slider_rotation_x'),
      getById('slider_rotation_y'),
      getById('slider_rotation_z')
    ];
    this.rotationLabels = [
      getById('label_rotation_x'),
      getById('label_rotation_y'),
      getById('label_rotation_z')
    ];
    this.rotation.forEach((x, i) => {
      x.oninput = () => this.onRotationChanged(x, i);
    });

    this.scale = [getById('slider_scale_x'), getById('slider_scale_y'), getById('slider_scale_z')];
    this.scaleLabels = [getById('label_scale_x'), getById('label_scale_y'), getById('label_scale_z')];
    this.scale.forEach((x, i) => {
      x.oninput = () => this.onScaleChanged(x, i);
    });

    this.vivid = [getById('slider_vivid_k1'), getById('slider_vivid_k2')];
    this.vividLabels = [getById('label_vivid_k1_value'), getById('label_vivid_k2_value')];
    this.vivid.forEach((x, i) => {
      x.oninput = () => this.onVividChanged(x, i);
    });

    // this.polygonCount = getById('slider_polygon');
    // this.polygonCount.oninput = () => {
    //   this.onPolygonCountChanged(this.polygonCount);
    // };
    // this.polygonCountLabel = getById('label_polygon');
  }

  public resetValues() {
    this.rotation.forEach((x) => (x.value = x.defaultValue));
    this.scale.forEach((x) => (x.value = x.defaultValue));
    this.color.forEach((x) => (x.value = x.defaultValue));
    this.effectSelector.value = '0';
    this.vivid.forEach((x) => (x.value = x.defaultValue));
    // this.polygonCount.value = this.polygonCount.defaultValue;

    this.rotation.forEach((x) => x.dispatchEvent(new Event('input')));
    this.scale.forEach((x) => x.dispatchEvent(new Event('input')));
    this.color.forEach((x) => x.dispatchEvent(new Event('input')));
    this.effectSelector.dispatchEvent(new Event('change'));
    this.vivid.forEach((x) => x.dispatchEvent(new Event('input')));
    // this.polygonCount.dispatchEvent(new Event('input'));
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

  // private onPolygonCountChanged(sender: HTMLInputElement) {
  //   this.polygonCountLabel.innerText = sender.value;
  // }
}
