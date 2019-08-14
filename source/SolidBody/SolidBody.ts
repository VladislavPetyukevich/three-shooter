import { Mesh, Vector3, Quaternion } from 'three';
import { Body } from 'cannon';

export default class SolidBody {
  mesh?: Mesh;
  body?: Body;

  constructor(mesh?: Mesh, body?: Body) {
    this.mesh = mesh;
    this.body = body;
  }

  update() {
    if (!this.body || !this.mesh) return;
    this.mesh!.position.copy(
      new Vector3(
        this.body!.position.x,
        this.body!.position.y,
        this.body!.position.z
      )
    );
    this.mesh!.quaternion.copy(
      new Quaternion(
        this.body!.quaternion.x,
        this.body!.quaternion.y,
        this.body!.quaternion.z,
        this.body!.quaternion.w
      )
    );
  }
}
