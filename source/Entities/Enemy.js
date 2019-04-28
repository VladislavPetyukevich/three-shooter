import EnemyActor from './Actors/EnemyActor';
import EnemyBehavior from './Behaviors/EnemyBehavior';
import { ENTITY } from '../constants';

export default class Enemy {
  constructor(props) {
    this.type = ENTITY.TYPE.CREATURE;
    this.actor = new EnemyActor(props.playerBody, props.position);
    this.behavior = new EnemyBehavior(this.actor, props.playerBody, props.container);
  }

  update(delta) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
}
