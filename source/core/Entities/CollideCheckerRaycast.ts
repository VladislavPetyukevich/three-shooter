import { Mesh, Raycaster, Vector3 } from 'three';
import { Entity } from './Entity';

export class CollideCheckerRaycast {
  entitiesMeshes: Mesh[];
  raycaster: Raycaster;
  direction: Vector3;
  far: Vector3;

  constructor(entitiesMeshes: Mesh[]) {
    this.entitiesMeshes = entitiesMeshes;
    this.raycaster = new Raycaster();
    this.direction = new Vector3();
    this.far = new Vector3();
  }

  detectCollisions(entity: Entity, newPosition: Vector3) {
    const originPosition = entity.actor.mesh.position;
    this.raycaster.set(
      originPosition,
      this.direction.subVectors(newPosition, originPosition).normalize()
    );
    this.raycaster.far = this.far.subVectors(newPosition, originPosition).length();
    return this.raycaster.intersectObjects(this.entitiesMeshes, false);
  }
}
