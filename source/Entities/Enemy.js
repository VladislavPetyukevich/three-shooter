import EnemyActor from './Actors/EnemyActor';
import EnemyBehavior from './Behaviors/EnemyBehavior';

export default class Enemy {
  constructor(playerBody, position = { x: 0, y: 0, z: 0 }) {
    this.actor = new EnemyActor(playerBody, position);
    this.behavior = new EnemyBehavior(this.actor, playerBody);
  }

  update(delta) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
}
