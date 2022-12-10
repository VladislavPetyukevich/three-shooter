import { AudioLoader as THREEAudioLoader, AudioBuffer } from 'three';

const threeAudioLoader = new THREEAudioLoader();

interface SoundInfo {
  [name: string]: string;
}

interface SoundsMap {
  [name: string]: AudioBuffer;
}

class AudioLoader {
  soundsMap: SoundsMap;

  constructor() {
    this.soundsMap = {};
  }

  loadSounds(sounds: SoundInfo, onLoad?: () => void, onProgress?: (progress: number) => void) {
    const soundsEntries = Object.entries(sounds);
    const onSoundLoad = (soundName: string) => (sound: AudioBuffer) => {
      this.soundsMap[soundName] = sound;
      const loadTexturesCount = Object.keys(this.soundsMap).length;
      if (onProgress) {
        onProgress(loadTexturesCount / soundsEntries.length * 100);
      }
      if (onLoad && (loadTexturesCount === soundsEntries.length)) {
        onLoad();
      }
    };

    soundsEntries.forEach(
      ([name, path]) => threeAudioLoader.load(path, onSoundLoad(name), () => { }, () => { })
    );
  }

  getSound(name: string) {
    const sound = this.soundsMap[name];
    if (!sound) {
      console.warn(`Cannot get sound ${name}`);
    }
    return sound;
  }
}

export const audioStore = new AudioLoader();
