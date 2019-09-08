import { AudioListener } from 'three';
import Actor from '@/Entities/Actors/Actor';
import SoundsBuffer from './SoundsBuffer';

export default class Sounds {
  audioListener: AudioListener;
  actor: Actor;
  soundsBuffer: SoundsBuffer;

  constructor(audioListener: AudioListener, actor: Actor, soundsBuffer: SoundsBuffer) {
    this.audioListener = audioListener;
    this.actor = actor;
    this.soundsBuffer = soundsBuffer;
  }
}
