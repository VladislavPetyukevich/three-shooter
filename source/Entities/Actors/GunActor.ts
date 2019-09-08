import {
  Mesh,
  CylinderGeometry,
  MeshPhongMaterial
} from 'three';
import Actor from '@/core/Entities/Actor';

export default class GunActor extends Actor {
  constructor() {
    const flashLight = new Mesh(new CylinderGeometry(0.03, 0.03, 0.5, 20), new MeshPhongMaterial({ color: 0x000000 }));
    flashLight.rotateX(Math.PI / 2);
    const solidBody = {
      body: undefined,
      mesh: flashLight,
      update: () => { }
    };

    super({ solidBody });
  }
}
