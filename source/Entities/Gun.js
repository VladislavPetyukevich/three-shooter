import GunBehavior from './Behaviors/GunBehavior';

export default class Gun {
  constructor(props) {
    this.type = 'inanimate';
    this.behavior = new GunBehavior(props.holderBody, props.container);
  }

  shoot(direction) {
    this.behavior.shoot(direction);
  }

  update(delta) {
    this.behavior.update(delta);
  }
}
