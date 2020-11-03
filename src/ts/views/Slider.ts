export class Slider {
  private slider: HTMLInputElement | null = null;
  private label: HTMLElement | null = null;

  public get value() {
    return this.slider?.valueAsNumber ?? 0;
  }

  constructor(sliderSelector: string, labelSelector: string) {
    this.slider = document.querySelector(sliderSelector);
    this.label = document.querySelector(labelSelector);
    this.slider?.addEventListener('input', () => this.onSliderValueChanged());
  }

  private onSliderValueChanged() {
    if (!this.label || !this.slider) {
      return;
    }
    this.label.textContent = this.slider.value;
  }

  public reset() {
    if (!this.label || !this.slider) {
      return;
    }
    this.slider.value = this.slider.defaultValue;
    this.slider.dispatchEvent(new Event('input'));
  }
}
