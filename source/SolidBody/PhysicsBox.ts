import {
  Material,
  Mesh
} from 'three';
import {
  Body,
  Vec3,
  Box
} from 'cannon';
import SolidBody from './SolidBody';

type BoxMaterial = Material | Array<Material | null>;

export default class PhysicsBox extends SolidBody {
  constructor(geometry: any, material: BoxMaterial, position = { x: 0, y: 0, z: 0 }, mass = 5) {
    const halfExtents = new Vec3(geometry.parameters.width / 2, geometry.parameters.height / 2, geometry.parameters.depth / 2);
    const boxShape = new Box(halfExtents);
    const body = new Body({ mass });
    body.addShape(boxShape);
    body.position.set(position.x, position.y, position.z);
    const mesh = new Mesh(geometry, <Material | Material[]>material);
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    super(mesh, body);
  }
}
