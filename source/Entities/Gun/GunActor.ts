import { Mesh } from 'three';
import { Actor } from '@/core/Entities/Actor';

export class GunActor implements Actor {
  mesh: Mesh;

  constructor() {
    this.mesh = new Mesh();
  }

  update() { }
}
