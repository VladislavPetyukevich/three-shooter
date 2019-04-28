import BulletActor from './Actors/BulletActor';
import BulletBehavior from './Behaviors/BulletBehavior';
import { ENTITY } from '../constants';

export default class Bullet {
  constructor(props) {
    this.type = ENTITY.TYPE.INANIMATE;
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
