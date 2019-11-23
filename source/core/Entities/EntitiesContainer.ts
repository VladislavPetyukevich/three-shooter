import { Scene } from 'three';
import { Entity } from './Entity';

export class EntitiesContainer {
  scene: Scene;
  entities: Entity[];

  constructor(scene: Scene) {
    this.scene = scene;
    this.entities = [];
  }

  add(entitiy: Entity) {
    this.entities.push(entitiy);
    this.scene.add(entitiy.actor.mesh);
    return entitiy;
  }

  update(delta: number) {
    this.entities.forEach(entitiy => {
      entitiy.update(delta);
      if (entitiy.velocity) {
        entitiy.actor.mesh.position.set(
          entitiy.actor.mesh.position.x + entitiy.velocity.x * delta,
          entitiy.actor.mesh.position.y + entitiy.velocity.y * delta,
          entitiy.actor.mesh.position.z + entitiy.velocity.z * delta
        );
      }
    });
  }
}
