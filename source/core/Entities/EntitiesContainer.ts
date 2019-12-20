import { Scene, Mesh, Vector3 } from 'three';
import { Entity } from './Entity';
import { CollideChecker2d } from './CollideChecker2d';

export class EntitiesContainer {
  scene: Scene;
  entities: Entity[];
  collideChecker: CollideChecker2d;

  constructor(scene: Scene) {
    this.scene = scene;
    this.entities = [];
    this.collideChecker = new CollideChecker2d({ cellSize: 3 });
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
    this.entities.forEach(entity => {
      if (!entity.velocity) {
        entity.update(delta);
        return;
      }

      const newPosition = new Vector3(
        entity.actor.mesh.position.x + entity.velocity.x * delta,
        entity.actor.mesh.position.y + entity.velocity.y * delta,
        entity.actor.mesh.position.z + entity.velocity.z * delta
      );
      const collisionsResult = this.collideChecker.detectCollisions(entity, newPosition);
      if (collisionsResult.entities.length === 0) {
        this.collideChecker.updateEntityPosition(entity, newPosition);
        entity.update(delta);
        return;
      }

      collisionsResult.entities.forEach(collideEntity => {
        collideEntity.onCollide(entity);
        const isEntityCanMove = entity.onCollide(collideEntity);
        if (isEntityCanMove) {
          this.collideChecker.updateEntityPosition(entity, newPosition);
        }
      });
      entity.update(delta);
    });
  }
}
