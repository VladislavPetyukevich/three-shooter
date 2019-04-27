import BulletActor from './Actors/BulletActor';
import BulletBehavior from './Behaviors/BulletBehavior';

export default class Bullet {
  constructor(props) {
    this.type = 'inanimate';
    this.container = props.container;
    this.actor = new BulletActor(props.position);
    this.behavior = new BulletBehavior(props.container, this.handleLifeTimeExpired);
  }

  handleLifeTimeExpired = () => {
    this.container.deleteEntity(this);
  }

  update(delta) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
}
