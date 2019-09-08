import { AudioLoader, AudioBuffer } from 'three';

const audioLoader = new AudioLoader();

export default class SoundsBuffer {
  buffers: AudioBuffer[];

  constructor() {
    this.buffers = [];
  }

  async loadSound(url: string) {
    await new Promise(resolve => {
      audioLoader.load(
        url,
        (buffer: AudioBuffer) => {
          this.buffers.push(buffer);
          resolve();
        },
        () => { },
        () => {
          throw new Error(`Sound load error. Url: ${url}`)
        }
      );
    });
  }

  async loadSounds(urls: string[]) {
    for (const soundProp of urls) {
      await this.loadSound(soundProp);
    }
  }
}
