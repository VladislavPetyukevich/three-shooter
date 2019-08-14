import { Body, Sphere } from 'cannon';
import { Geometry, Material, Mesh } from 'three';
import SolidBody from './SolidBody';

export default class PhysicsBall extends SolidBody {


  constructor(geometry: Geometry, material: Material, position = { x: 0, y: 0, z: 0 }, mass = 5) {
    const ballShape = new Sphere((<any>geometry).parameters.radius);
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(position.x, position.y, position.z);
    const body = new Body({ mass });
    body.addShape(ballShape);
    body.position.set(position.x, position.y, position.z);
    super(mesh, body);
  }
}
