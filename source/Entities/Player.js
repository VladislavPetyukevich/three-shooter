import PlayerActor from './Actors/PlayerActor';
import СontrolledBehavior from './Behaviors/СontrolledBehavior';
import { ENTITY, PLAYER } from '../constants';

export default class Player {
  constructor(props) {
    this.type = ENTITY.TYPE.CREATURE;
    this.actor = new PlayerActor(props.position);
    this.actor.solidBody.body._hp = 100;
    this.behavior = new СontrolledBehavior(this.actor, PLAYER.WALK_SPEED, props.camera, props.container);
  }

  update(delta) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
}
