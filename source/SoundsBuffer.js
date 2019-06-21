import { Audio, PositionalAudio, AudioLoader } from 'three';

const audioLoader = new AudioLoader();

export default class SoundsBuffer {
  constructor(listener) {
    this.listener = listener;
    this.buffer = [];
  }

  createSoundObject(soundProps, buffer) {
    switch (soundProps.type) {
      case 'Audio':
        const audio = new Audio(this.listener);
        audio.setBuffer(buffer);
        return audio;
      case 'PositionalAudio':
        const positionalAudio = new PositionalAudio(this.listener);
        positionalAudio.setBuffer(buffer);
        positionalAudio.setRefDistance(soundProps.refDistance);
        return positionalAudio;
    }
  }

  async loadSound(soundProps) {
    let sound;
    await new Promise(resolve => {
      audioLoader.load(soundProps.url, buffer => {
        sound = this.createSoundObject(soundProps, buffer);
        resolve();
      });
    });
    this.buffer.push(sound);
  }

  async loadSounds(soundProps) {
    for (const soundProp of soundProps) {
      await loadSound(soundProp);
    }
  }

  playSound(soundId) {
    if (this.buffer[soundId]) {
      this.buffer[soundId].play();
    }
  }
}
