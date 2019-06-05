import { Audio, AudioLoader } from 'three';

const audioLoader = new AudioLoader();

export default class SoundsBuffer {
  constructor(listener) {
    this.listener = listener;
    this.buffer = [];
  }

  async loadSound(url) {
    const sound = new Audio(this.listener);
    await new Promise(resolve => {
      audioLoader.load(url, buffer => {
        sound.setBuffer(buffer);
        resolve();
      });
    });
    this.buffer.push(sound);
  }

  async loadSounds(urls) {
    for (const url of urls) {
      await loadSound(url);
    }
  }

  playSound(soundId) {
    if (this.buffer[soundId]) {
      this.buffer[soundId].play();
    }
  }
}
