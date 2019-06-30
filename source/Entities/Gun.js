import GunActor from './Actors/GunActor';
import GunBehavior from './Behaviors/GunBehavior';
import { ENTITY } from '../constants';

export default class Gun {
  constructor(props) {
    this.type = ENTITY.TYPE.INANIMATE;
    this.actor =  props.camera ? new GunActor(props.camera) : undefined;
    this.behavior = new GunBehavior(props.holderBody, props.holderBehavior, props.container, this.actor, props.camera);
  }

  shoot(direction) {
    this.behavior.shoot(direction);
  }

  update(delta) {
    this.behavior.update(delta);
  }
}
