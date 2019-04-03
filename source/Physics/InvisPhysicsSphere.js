import { Sphere, Body } from 'cannon';

export default class InvisPhysicsSphere {
  constructor(radius, position = { x: 0, y: 0, z: 0 }, mass = 5) {
    const shape = new Sphere(radius)
    this.body = new Body({ mass });
    this.body.addShape(shape);
    this.body.position.set(position.x, position.y, position.z);
  }

  update() { }
}
