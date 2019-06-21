import { AudioLoader } from 'three';

const audioLoader = new AudioLoader();

export default class SoundsBuffer {
  constructor() {
    this.buffers = [];
  }

  async loadSound(url) {
    await new Promise(resolve => {
      audioLoader.load(url, buffer => {
        this.buffers.push(buffer);
        resolve();
      });
    });
  }

  async loadSounds(urls) {
    for (const soundProp of urls) {
      await loadSound(soundProp);
    }
  }
}
