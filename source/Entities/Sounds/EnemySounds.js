import { PositionalAudio } from 'three';
import Sounds from './Sounds';
import { ENEMY } from '../../constants';

export default class EnemySounds extends Sounds {
  shoot() {
    const audio = new PositionalAudio(this.audioListener);
    audio.setBuffer(this.soundsBuffer.buffers[ENEMY.SHOOT_SOUND_INDEX]);
    this.actor.solidBody.mesh.add(audio);
    audio.play();
  }
}
