import { Scene, Mesh } from 'three';
import { Entity } from './Entity';
import { CollideChecker } from './CollideChecker';

export class EntitiesContainer {
  scene: Scene;
  entities: Entity[];
  collideChecker: CollideChecker;

  constructor(scene: Scene) {
    this.scene = scene;
    this.entities = [];
    this.collideChecker = new CollideChecker({ cellSize: 3 });
  }

  add(entitiy: Entity) {
    this.collideChecker.addEntity(entitiy);
    this.entities.push(entitiy);
    this.scene.add(entitiy.actor.mesh);
    return entitiy;
  }

  remove(mesh: Mesh) {
    const meshId = mesh.id;
    this.collideChecker.removeEntity(meshId);
    this.entities = this.entities.filter(entityEl => entityEl.actor.mesh.id !== meshId);
    this.scene.remove(mesh);
  }

  update(delta: number) {
    this.entities.forEach(entitiy => {
      if (entitiy.velocity) {
        entitiy.actor.mesh.position.set(
          entitiy.actor.mesh.position.x + entitiy.velocity.x * delta,
          entitiy.actor.mesh.position.y + entitiy.velocity.y * delta,
          entitiy.actor.mesh.position.z + entitiy.velocity.z * delta
        );
        this.collideChecker.updateEntityPosition(entitiy);
      }
      entitiy.update(delta);
    });
  }
}
