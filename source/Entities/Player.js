import PlayerActor from './Actors/PlayerActor';
import СontrolledBehavior from './Behaviors/СontrolledBehavior';

export default class Player {
  constructor(camera, position = { x: 0, y: 0, z: 0 }) {
    this.actor = new PlayerActor(position);
    this.behavior = new СontrolledBehavior(this.actor, camera);
  }

  update(delta) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
}
