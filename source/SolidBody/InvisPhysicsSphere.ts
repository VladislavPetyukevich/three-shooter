import { Sphere, Body } from 'cannon';
import SolidBody from './SolidBody';

export default class InvisPhysicsSphere extends SolidBody {
  constructor(radius: number, position = { x: 0, y: 0, z: 0 }, mass = 5) {
    const shape = new Sphere(radius)
    const body = new Body({ mass });
    body.addShape(shape);
    body.position.set(position.x, position.y, position.z);
    super(undefined, body);
  }
}
