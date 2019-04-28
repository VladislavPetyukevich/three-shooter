import GunBehavior from './Behaviors/GunBehavior';
import { ENTITY } from '../constants';

export default class Gun {
  constructor(props) {
    this.type = ENTITY.TYPE.INANIMATE;
    this.behavior = new GunBehavior(props.holderBody, props.container);
  }

  shoot(direction) {
    this.behavior.shoot(direction);
  }

  update(delta) {
    this.behavior.update(delta);
  }
}
