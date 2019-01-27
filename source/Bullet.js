import { Mesh, Vector3, SphereGeometry, MeshBasicMaterial } from 'three';

const MAX_LIFE_TIME = 5;

export default class Bullet extends Mesh {
  constructor(velocity = new Vector3()) {
    super(
      new SphereGeometry(0.2, 8, 8),
      new MeshBasicMaterial({ color: 'red' })
    );
    this.velocity = velocity;
    this.lifeTimeRemaining = MAX_LIFE_TIME;
  }

  update(delta) {
    this.lifeTimeRemaining -= delta;
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;
  }
}
