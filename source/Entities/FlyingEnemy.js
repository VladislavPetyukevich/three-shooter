import FlyingEnemyActor from './Actors/FlyingEnemyActor';
import FlyingEnemyBehavior from './Behaviors/FlyingEnemyBehavior';
import { ENTITY, FLYING_ENEMY } from '../constants';

export default class FlyingEnemy {
  constructor(props) {
    this.type = ENTITY.TYPE.CREATURE;
    this.playerBody = props.playerBody;
    this.actor = new FlyingEnemyActor(props.playerBody, props.position);
    this.actor.solidBody.body._hp = FLYING_ENEMY.HP;
    this.behavior = new FlyingEnemyBehavior(this.actor, FLYING_ENEMY.FLYING_SPEED, props.playerBody);
  }

  update(delta) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
}
