import { Mesh, CylinderGeometry, MeshPhongMaterial } from 'three';
import Actor from './Actor';

export default class GunActor extends Actor {
  constructor() {
    const mesh = new Mesh(new CylinderGeometry(0.1, 0.1, 1, 20), new MeshPhongMaterial({ color: 0x000000 }));
    super({
      hp: 1,
      solidBody: { mesh }
    });
  }
}
