import GunBehavior from './Behaviors/GunBehavior';

export default class Gun {
  constructor(props) {
    this.type = 'inanimate';
    this.behavior = new GunBehavior(this.actor, props.holderBody, props.container);
  }

  update(delta) {
    this.behavior.update(delta);
  }
}
