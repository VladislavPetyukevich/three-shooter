const COMP = {
  THRESHOLD: -50,
  KNEE: 30,
  RATIO: 12,
  ATTACK: 0.003,
  RELEASE: 0.25
};

const GAIN = 0.6;

class SoundSystem {
  constructor(context, soundsBuffers) {
    this.context = context;
    this.soundsBuffers = soundsBuffers;

    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(COMP.THRESHOLD, this.context.currentTime);
    this.compressor.knee.setValueAtTime(COMP.KNEE, this.context.currentTime);
    this.compressor.ratio.setValueAtTime(COMP.RATIO, this.context.currentTime);
    this.compressor.attack.setValueAtTime(COMP.ATTACK, this.context.currentTime);
    this.compressor.release.setValueAtTime(COMP.RELEASE, this.context.currentTime);

    this.gain = this.context.createGain();
    this.gain.gain.setValueAtTime(GAIN, this.context.currentTime);
  }

  initSource(bufferId) {
    const source = this.context.createBufferSource();
    source.connect(this.compressor);
    source.buffer = this.soundsBuffers.buffer[bufferId];
    this.compressor.connect(this.gain);
    this.gain.connect(this.context.destination);
    return source;
  }

  play(bufferId) {
    const source = this.initSource(bufferId);
    source.start(this.context.currentTime);
  }
}

export default SoundSystem;
