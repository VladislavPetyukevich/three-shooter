export default class SoundsBuffer {
  constructor(context) {
    this.context = context;
    this.buffer = [];
  }

  async loadSound(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const decodedBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.buffer.push(decodedBuffer);
  }

  async loadSounds(urls) {
    for (const url of urls) {
      await loadSound(url);
    }
  }
}
