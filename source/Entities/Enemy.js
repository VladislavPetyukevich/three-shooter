import EnemyActor from './Actors/EnemyActor';
import EnemyBehavior from './Behaviors/EnemyBehavior';
import EnemySounds from './Sounds/EnemySounds';
import { ENTITY } from '../constants';

export default class Enemy {
  constructor(props) {
    this.type = ENTITY.TYPE.CREATURE;
    this.playerBody = props.playerBody;
    this.actor = new EnemyActor(props.playerBody, props.position);
    this.behavior = new EnemyBehavior(this.actor, props.playerBody, props.container, this.handleShoot);
    this.audioListener = props.audioListener;
    this.sounds = new EnemySounds(this.audioListener, this.actor, props.soundsBuffer);
  }

  handleShoot = () => {
    this.sounds.shoot();
  }

  update(delta) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
}
