import { AudioListener } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { SoundsBuffer } from './SoundsBuffer';

export class Sounds {
  audioListener: AudioListener;
  actor: Actor;
  soundsBuffer: SoundsBuffer;

  constructor(audioListener: AudioListener, actor: Actor, soundsBuffer: SoundsBuffer) {
    this.audioListener = audioListener;
    this.actor = actor;
    this.soundsBuffer = soundsBuffer;
  }
}
