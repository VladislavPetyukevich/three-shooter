import { Body, Sphere } from 'cannon';
import { Mesh } from 'three';

export default class PhysicsBall {
  constructor(geometry, material, position = { x: 0, y: 0, z: 0 }, mass = 5) {
    const ballShape = new Sphere(geometry.parameters.radius);
    this.body = new Body({ mass });
    this.body.addShape(ballShape);
    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.body.position.set(position.x, position.y, position.z);
    this.mesh.position.set(position.x, position.y, position.z);
  }

  update() {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}
