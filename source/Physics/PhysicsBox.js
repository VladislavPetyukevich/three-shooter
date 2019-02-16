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
    this.boxBody = new Body({ mass });
    this.boxBody.addShape(boxShape);
    this.boxMesh = new Mesh(geometry, material);
    this.boxBody.position.set(position.x, position.y, position.z);
    this.boxMesh.position.set(position.x, position.y, position.z);
    this.boxMesh.castShadow = true;
    this.boxMesh.receiveShadow = true;
  }

  get body() {
    return this.boxBody;
  }

  get mesh() {
    return this.boxMesh;
  }

  update() {
    this.boxMesh.position.copy(this.boxBody.position);
    this.boxMesh.quaternion.copy(this.boxBody.quaternion);
  }
}
