import { PositionalAudio } from 'three';
import { Sounds } from '@/core/Entities/Sounds';
import { ENEMY } from '@/constants';

export class EnemySounds extends Sounds {
  shoot() {
    const audio = new PositionalAudio(this.audioListener);
    audio.setBuffer(this.soundsBuffer.buffers[ENEMY.SHOOT_SOUND_INDEX]);
    this.actor.mesh.add(audio);
    audio.play();
  }
}
