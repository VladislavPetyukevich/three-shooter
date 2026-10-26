type SettingName =
  'mouseSensitivity' |
  'audioVolume' |
  'musicVolume' |
  'fov';

type Settings = Record<SettingName, number>;

class GlobalSettings {
  settings: Settings;
  onUpdateCallbacks: (() => void)[];

  constructor() {
    this.settings = {
      mouseSensitivity: 0.002,
      audioVolume: 1,
      musicVolume: 0.5,
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

  addUpdateListener(callback: () => void) {
    this.onUpdateCallbacks.push(callback);
  }

  removeUpdateListener(callback: () => void) {
    const index = this.onUpdateCallbacks.indexOf(callback);
    if (index > -1) {
      this.onUpdateCallbacks.splice(index, 1);
    }
  }

  onUpdate() {
    this.onUpdateCallbacks.forEach(callback => callback());
  }
}

export const globalSettings = new GlobalSettings();

