import { PositionalAudio } from 'three';
import EnemyActor from './Actors/EnemyActor';
import EnemyBehavior from './Behaviors/EnemyBehavior';
import { ENTITY, SCENE_1 } from '../constants';

export default class Enemy {
  constructor(props) {
    this.type = ENTITY.TYPE.CREATURE;
    this.playerBody = props.playerBody;
    this.actor = new EnemyActor(props.playerBody, props.position);
    this.behavior = new EnemyBehavior(this.actor, props.playerBody, props.container, this.handleShoot);
    this.audioListener = props.audioListener;
    this.soundsBuffer = props.soundsBuffer;
  }

  handleShoot = () => {
    const audio = new PositionalAudio(this.audioListener);
    audio.setBuffer(this.soundsBuffer.buffers[SCENE_1.SHOOT_SOUND_INDEX]);
    this.actor.solidBody.mesh.add(audio);
    audio.play();
  }

  update(delta) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
}
