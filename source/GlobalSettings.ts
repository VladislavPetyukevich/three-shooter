class GlobalSettings {
  mouseSensitivity: number;
  onUpdateCallbacks: Function[];

  constructor() {
    this.onUpdateCallbacks = [];
    this.mouseSensitivity = 0.002;
  }

  setMouseSensivity(value: number) {
    this.mouseSensitivity = value;
    this.onUpdate();
  }

  getMouseSensivity() {
    return this.mouseSensitivity;
  }

  addUpdateListener(callback: Function) {
    this.onUpdateCallbacks.push(callback);
  }

  onUpdate() {
    this.onUpdateCallbacks.forEach(callback => callback());
  }
}

export const globalSettings = new GlobalSettings();

