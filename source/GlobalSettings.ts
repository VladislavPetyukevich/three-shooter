type SettingName =
  'mouseSensitivity' |
  'audioVolume' |
  'fov';

type Settings = Record<SettingName, number>;

class GlobalSettings {
  settings: Settings;
  onUpdateCallbacks: Function[];

  constructor() {
    this.settings = {
      mouseSensitivity: 0.002,
      audioVolume: 1,
      fov: 95,
    };
    this.onUpdateCallbacks = [];
  }

  setSetting(name: SettingName, value: number) {
    this.settings[name] = value;
    this.onUpdate();
  }

  getSetting(name: SettingName) {
    return this.settings[name] || 0;
  }

  addUpdateListener(callback: Function) {
    this.onUpdateCallbacks.push(callback);
  }

  onUpdate() {
    this.onUpdateCallbacks.forEach(callback => callback());
  }
}

export const globalSettings = new GlobalSettings();

