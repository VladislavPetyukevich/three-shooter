import EnemyActor from './Actors/EnemyActor';
import EnemyBehavior from './Behaviors/EnemyBehavior';

export default class Enemy {
  constructor(props) {
    this.actor = new EnemyActor(props.playerBody, props.position);
    this.behavior = new EnemyBehavior(this.actor, props.playerBody);
  }

  update(delta) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
}
