type SettingName =
  'mouseSensitivity' |
  'audioVolume';

class GlobalSettings {
  mouseSensitivity: number;
  audioVolume: number;
  onUpdateCallbacks: Function[];

  constructor() {
    this.onUpdateCallbacks = [];
    this.mouseSensitivity = 0.002;
    this.audioVolume = 1;
  }

  setSetting(name: SettingName, value: number) {
    if (name === 'mouseSensitivity') {
      this.mouseSensitivity = value;
    } else if (name === 'audioVolume') {
      this.audioVolume = value;
    }
    this.onUpdate();
  }

  getSetting(name: SettingName) {
    if (name === 'mouseSensitivity') {
      return this.mouseSensitivity;
    } else if (name === 'audioVolume') {
      return this.audioVolume;
    }
    return 0;
  }

  addUpdateListener(callback: Function) {
    this.onUpdateCallbacks.push(callback);
  }

  onUpdate() {
    this.onUpdateCallbacks.forEach(callback => callback());
  }
}

export const globalSettings = new GlobalSettings();

