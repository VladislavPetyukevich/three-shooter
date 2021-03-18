import { Scene, Mesh, Vector3 } from 'three';
import { Entity } from './Entity';
import { CollideChecker2d } from './CollideChecker2d';
import { CollideCheckerRaycast } from './CollideCheckerRaycast';

export class EntitiesContainer {
  scene: Scene;
  entities: Entity[];
  entitiesMeshes: Mesh[];
  collideChecker: CollideChecker2d;
  collideCheckerRaycast: CollideCheckerRaycast;

  constructor(scene: Scene) {
    this.scene = scene;
    this.entities = [];
    this.entitiesMeshes = [];
    this.collideChecker = new CollideChecker2d({ cellSize: 3 });
    this.collideCheckerRaycast = new CollideCheckerRaycast(this.scene);
  }

  add(entitiy: Entity) {
    this.collideChecker.addEntity(entitiy);
    this.entities.push(entitiy);
    this.entitiesMeshes.push(entitiy.actor.mesh);
    this.scene.add(entitiy.actor.mesh);
    return entitiy;
  }

  remove(mesh: Mesh) {
    const meshId = mesh.id;
    this.collideChecker.removeEntity(meshId);
    for (let i = this.entities.length; i--;) {
      if (this.entities[i].actor.mesh.id === meshId) {
        this.entities.splice(i, 1);
        this.entitiesMeshes.splice(i, 1);
        break;
      }
    }
    this.scene.remove(mesh);
  }

  update(delta: number) {
    this.entities.forEach(entity => {
      if (!entity.velocity) {
        entity.update(delta);
        return;
      }

      entity.actor.mesh.position.set(
        entity.actor.mesh.position.x,
        entity.actor.mesh.position.y + entity.velocity.y * delta,
        entity.actor.mesh.position.z
      );
      const newPositionX = entity.actor.mesh.position.x + entity.velocity.x * delta;
      const newPositionZ = entity.actor.mesh.position.z + entity.velocity.z * delta;
      if (delta < 0.066) { // > 15 fps
        this.updateEntityPosition(
          entity,
          new Vector3(
            newPositionX,
            entity.actor.mesh.position.y,
            entity.actor.mesh.position.z
          )
        );
        this.updateEntityPosition(
          entity,
          new Vector3(
            entity.actor.mesh.position.x,
            entity.actor.mesh.position.y,
            newPositionZ
          )
        );
      } else {
        this.updateEntityPositionRaycast(
          entity,
          new Vector3(
            newPositionX,
            entity.actor.mesh.position.y,
            entity.actor.mesh.position.z
          )
        );
        this.updateEntityPositionRaycast(
          entity,
          new Vector3(
            entity.actor.mesh.position.x,
            entity.actor.mesh.position.y,
            newPositionZ
          )
        );
      }
      entity.update(delta);
    });
  }

  updateEntityPositionRaycast(entity: Entity, newPosition: Vector3) {
    const collisionsResult = this.collideCheckerRaycast.detectCollisions(entity, newPosition);
    if (collisionsResult.length === 0) {
      this.collideChecker.updateEntityPosition(entity, newPosition);
    }
  }

  updateEntityPosition(entity: Entity, newPosition: Vector3) {
    const collisionsResult = this.collideChecker.detectCollisions(entity, newPosition);
    if (collisionsResult.entities.length === 0) {
      this.collideChecker.updateEntityPosition(entity, newPosition);
      return;
    }

    let isEntityCanMove = true;
    collisionsResult.entities.forEach(collideEntity => {
      collideEntity.onCollide(entity);
      const collideResult = entity.onCollide(collideEntity);
      if (!collideResult) {
        isEntityCanMove = false;
      }
    });
    if (isEntityCanMove) {
      this.collideChecker.updateEntityPosition(entity, newPosition);
    }
  }
}
