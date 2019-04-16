import BulletActor from './Actors/BulletActor';

export default class Bullet {
  constructor(props) {
    this.type = 'inanimate';
    this.actor = new BulletActor(props.position);
  }

  update(delta) {
    this.actor.update(delta);
  }
}
