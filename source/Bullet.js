import { Mesh, Vector3, SphereGeometry, MeshBasicMaterial } from 'three';

export default class Bullet extends Mesh {
  constructor() {
    super(
      new SphereGeometry(0.2, 8, 8),
      new MeshBasicMaterial({ color: 'red' })
    );
    this.velocity = new Vector3(1, 0, 0);
  }

  update(delta) {
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;
  }
}
