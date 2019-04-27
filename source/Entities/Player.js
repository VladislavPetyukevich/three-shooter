import PlayerActor from './Actors/PlayerActor';
import СontrolledBehavior from './Behaviors/СontrolledBehavior';

export default class Player {
  constructor(props) {
    this.type = 'creature';
    this.actor = new PlayerActor(props.position);
    this.behavior = new СontrolledBehavior(this.actor, props.camera, props.container);
  }

  update(delta) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
}
