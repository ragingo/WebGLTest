const getBySelector = <T extends HTMLElement>(selector: string): T => {
  return document.querySelector(selector) as T;
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

  constructor() {
    this.reset = getBySelector('.app__reset');
    this.reset.onclick = this.onResetClick;

    this.fpsLabel = getBySelector('.app__fps');
    this.canvas = getBySelector('.app__canvas');

    this.effectSelector = getBySelector('.app__effect-selector');
    const effects = [
      { id: 0, name: '通常' },
      { id: 1, name: 'グレースケール' },
      { id: 2, name: '2値化' },
      { id: 3, name: '二次微分 laplacian 4方向' },
      { id: 4, name: '二次微分 laplacian 8方向' },
      { id: 5, name: '一次微分 Roberts' },
      { id: 6, name: 'Prewitt' },
      { id: 7, name: '階調反転' },
      { id: 8, name: '色深度 8ビット' },
      { id: 9, name: '色深度 15ビット' },
      { id: 10, name: '色深度 16ビット' },
      { id: 11, name: '色深度 24ビット' },
      { id: 12, name: '色深度 32ビット' },
      { id: 13, name: '円' },
      { id: 14, name: '球' },
      { id: 15, name: '正弦波' },
      { id: 16, name: '鮮やか' },
    ];
    effects.forEach((x) => {
      const opt = document.createElement('option');
      opt.value = String(x.id);
      opt.textContent = x.name;
      this.effectSelector.add(opt);
    });
    this.effectSelector.onchange = () => {
      this.onEffectTypeChanged(this.effectSelector);
    };

    this.rotation = [
      getBySelector('.rotation--x > .rotation__slider'),
      getBySelector('.rotation--y > .rotation__slider'),
      getBySelector('.rotation--z > .rotation__slider'),
    ];
    this.rotationLabels = [
      getBySelector('.rotation--x > .rotation__label'),
      getBySelector('.rotation--y > .rotation__label'),
      getBySelector('.rotation--z > .rotation__label'),
    ];
    this.rotation.forEach((x, i) => {
      x.oninput = () => this.onRotationChanged(x, i);
    });

    this.scale = [
      getBySelector('.scale--x > .scale__slider'),
      getBySelector('.scale--y > .scale__slider'),
      getBySelector('.scale--z > .scale__slider'),
    ];
    this.scaleLabels = [
      getBySelector('.scale--x > .scale__label'),
      getBySelector('.scale--y > .scale__label'),
      getBySelector('.scale--z > .scale__label'),
    ];
    this.scale.forEach((x, i) => {
      x.oninput = () => this.onScaleChanged(x, i);
    });

    this.color = [
      getBySelector('.color--r > .color__slider'),
      getBySelector('.color--g > .color__slider'),
      getBySelector('.color--b > .color__slider'),
      getBySelector('.color--a > .color__slider'),
    ];
    this.colorLabels = [
      getBySelector('.color--r > .color__label'),
      getBySelector('.color--g > .color__label'),
      getBySelector('.color--b > .color__label'),
      getBySelector('.color--a > .color__label'),
    ];
    this.color.forEach((x, i) => {
      x.oninput = () => this.onColorChanged(x, i);
    });


    this.vivid = [
      getBySelector('.vivid--k1 > .vivid__slider'),
      getBySelector('.vivid--k2 > .vivid__slider'),
    ];
    this.vividLabels = [
      getBySelector('.vivid--k1 > .vivid__label'),
      getBySelector('.vivid--k2 > .vivid__label'),
    ];
    this.vivid.forEach((x, i) => {
      x.oninput = () => this.onVividChanged(x, i);
    });
  }

  public resetValues() {
    this.rotation.forEach((x) => (x.value = x.defaultValue));
    this.scale.forEach((x) => (x.value = x.defaultValue));
    this.color.forEach((x) => (x.value = x.defaultValue));
    this.effectSelector.value = '0';
    this.vivid.forEach((x) => (x.value = x.defaultValue));

    this.rotation.forEach((x) => x.dispatchEvent(new Event('input')));
    this.scale.forEach((x) => x.dispatchEvent(new Event('input')));
    this.color.forEach((x) => x.dispatchEvent(new Event('input')));
    this.effectSelector.dispatchEvent(new Event('change'));
    this.vivid.forEach((x) => x.dispatchEvent(new Event('input')));
  }

  private onResetClick = () => {
    this.resetValues();
  };

  private onEffectTypeChanged(sender: HTMLSelectElement) {
    const elem = getBySelector('.app__vivid');
    if (sender.selectedIndex == 16) {
      elem.style.display = 'block';
    } else {
      elem.style.display = 'none';
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
}
