import EnemyActor from './Actors/EnemyActor';
import EnemyBehavior from './Behaviors/EnemyBehavior';
import { ENTITY, EVENT_TYPES } from '../constants';
import EventChannel from '../EventChannel';

export default class Enemy {
  constructor(props) {
    this.type = ENTITY.TYPE.CREATURE;
    this.playerBody = props.playerBody;
    this.actor = new EnemyActor(props.playerBody, props.position);
    this.behavior = new EnemyBehavior(this.actor, props.playerBody, props.container, this.handleShoot);
  }

  handleShoot = () => {
    EventChannel.onPublish(EVENT_TYPES.ENEMY_SHOOT, { EnemyEntity: this, playerBody: this.playerBody });
  }

  update(delta) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
}
