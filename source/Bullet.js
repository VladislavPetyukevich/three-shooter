import { Mesh, Vector3, SphereGeometry, MeshBasicMaterial } from 'three';

export default class Bullet extends Mesh {
  constructor() {
    super(
      new SphereGeometry(0.2, 8, 8),
      new MeshBasicMaterial({ color: 'red' })
    );
    this.velocity = new Vector3(0.03, 0, 0);
  }
}
