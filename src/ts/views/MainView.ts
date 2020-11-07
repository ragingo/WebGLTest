import { Slider } from './Slider';

const getBySelector = <T extends HTMLElement>(selector: string): T => {
  return document.querySelector(selector) as T;
};

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
  { id: 17, name: '実験' }
];

export class MainView {
  private reset: HTMLButtonElement;
  private fpsLabel: HTMLParagraphElement;
  private effectSelector: HTMLSelectElement;
  private color: Slider[] = [];
  private rotation: Slider[] = [];
  private scale: Slider[] = [];
  private vivid: Slider[] = [];
  private binarize: Slider;

  public setFpsLabel(value: string) {
    this.fpsLabel.innerText = value;
  }

  public getEffectTypeValue() {
    return parseInt(this.effectSelector.options[this.effectSelector.selectedIndex].value);
  }

  public getRotationValue() {
    return {
      x: this.rotation[0].value,
      y: this.rotation[1].value,
      z: this.rotation[2].value
    };
  }

  public getScaleValue() {
    return {
      x: this.scale[0].value,
      y: this.scale[1].value,
      z: this.scale[2].value
    };
  }

  public getColorValue() {
    return {
      r: this.color[0].value,
      g: this.color[1].value,
      b: this.color[2].value,
      a: this.color[3].value
    };
  }

  public getBinarizeThresholdValue() {
    return this.binarize.value;
  }

  public getVividValue() {
    return {
      k1: this.vivid[0].value,
      k2: this.vivid[1].value
    };
  }

  public addCanvas(canvas: HTMLCanvasElement) {
    const parent = document.querySelector('.app__left');
    if (!parent) {
      return;
    }
    canvas.className = 'app__canvas';
    parent.appendChild(canvas);
  }

  constructor() {
    this.reset = getBySelector('.app__reset');
    this.reset.onclick = this.onResetClick;

    this.fpsLabel = getBySelector('.app__fps');

    this.effectSelector = getBySelector('.app__effect-selector');
    effects.forEach((x) => {
      const opt = document.createElement('option');
      opt.value = String(x.id);
      opt.textContent = x.name;
      this.effectSelector.add(opt);
    });
    this.effectSelector.onchange = () => {
      this.onEffectTypeChanged(this.effectSelector);
    };
    const selectedEffectType = localStorage.getItem('effectType');
    if (selectedEffectType && parseInt(selectedEffectType)) {
      this.effectSelector.value = selectedEffectType;
    }

    this.rotation = [
      new Slider('.rotation--x > .rotation__slider', '.rotation--x > .rotation__label'),
      new Slider('.rotation--y > .rotation__slider', '.rotation--y > .rotation__label'),
      new Slider('.rotation--z > .rotation__slider', '.rotation--z > .rotation__label')
    ];

    this.scale = [
      new Slider('.scale--x > .scale__slider', '.scale--x > .scale__label'),
      new Slider('.scale--y > .scale__slider', '.scale--y > .scale__label'),
      new Slider('.scale--z > .scale__slider', '.scale--z > .scale__label')
    ];

    this.color = [
      new Slider('.color--r > .color__slider', '.color--r > .color__label'),
      new Slider('.color--g > .color__slider', '.color--g > .color__label'),
      new Slider('.color--b > .color__slider', '.color--b > .color__label'),
      new Slider('.color--a > .color__slider', '.color--a > .color__label')
    ];

    this.binarize = new Slider('.binarize--value > .binarize__slider', '.binarize--value > .binarize__label');

    this.vivid = [
      new Slider('.vivid--k1 > .vivid__slider', '.vivid--k1 > .vivid__label'),
      new Slider('.vivid--k2 > .vivid__slider', '.vivid--k2 > .vivid__label')
    ];
  }

  public resetValues() {
    this.effectSelector.dispatchEvent(new Event('change'));
    this.rotation.forEach((x) => x.reset());
    this.scale.forEach((x) => x.reset());
    this.color.forEach((x) => x.reset());
    this.binarize.reset();
    this.vivid.forEach((x) => x.reset());
  }

  private onResetClick = () => {
    this.resetValues();
  };

  private onEffectTypeChanged(sender: HTMLSelectElement) {
    const binarize = getBySelector('.app__binarize');
    const vivid = getBySelector('.app__vivid');

    if (sender.selectedIndex === 2) {
      binarize.style.display = 'block';
    } else {
      binarize.style.display = 'none';
    }

    if (sender.selectedIndex === 16) {
      vivid.style.display = 'block';
    } else {
      vivid.style.display = 'none';
    }

    localStorage.setItem('effectType', sender.selectedIndex.toString());
  }
}
