import {
  Mesh
} from 'three';
import {
  Body,
  Vec3,
  Box
} from 'cannon';

export default class PhysicsBox {
  constructor(geometry, material, position = { x: 0, y: 0, z: 0 }, mass = 5) {
    const halfExtents = new Vec3(geometry.parameters.width / 2, geometry.parameters.height / 2, geometry.parameters.depth / 2);
    const boxShape = new Box(halfExtents);
    this.body = new Body({ mass });
    this.body.addShape(boxShape);
    this.mesh = new Mesh(geometry, material);
    this.body.position.set(position.x, position.y, position.z);
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  update() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}
