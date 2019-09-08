import { PositionalAudio } from 'three';
import Sounds from './Sounds';
import { ENEMY } from '@/constants';

export default class EnemySounds extends Sounds {
  shoot() {
    if (!this.actor.solidBody.mesh) {
      throw new Error('EnemySounds: Actor mesh is not specified');
    }

    const audio = new PositionalAudio(this.audioListener);
    audio.setBuffer(this.soundsBuffer.buffers[ENEMY.SHOOT_SOUND_INDEX]);
    this.actor.solidBody.mesh.add(audio);
    audio.play();
  }
}
