import { Scene, Mesh, Vector3 } from 'three';
import { Entity } from './Entity';
import { CollideChecker2d } from './CollideChecker2d';
import { CollideCheckerRaycast } from './CollideCheckerRaycast';
import { Pathfinder2d } from './Pathfinder2d';

export class EntitiesContainer {
  scene: Scene;
  entities: Entity[];
  entitiesMeshes: Mesh[];
  meshIdToEntity: Map<number, Entity>;
  collideChecker: CollideChecker2d;
  collideCheckerRaycast: CollideCheckerRaycast;
  pathfinder: Pathfinder2d;

  constructor(scene: Scene) {
    this.scene = scene;
    this.entities = [];
    this.entitiesMeshes = [];
    this.meshIdToEntity = new Map();
    this.collideChecker = new CollideChecker2d({ cellSize: 5 });
    this.collideCheckerRaycast = new CollideCheckerRaycast(this.scene);
    this.pathfinder = new Pathfinder2d({ entitiesContainer: this });
  }

  add(entity: Entity) {
    this.collideChecker.addEntity(entity);
    this.entities.push(entity);
    this.entitiesMeshes.push(entity.actor.mesh);
    this.meshIdToEntity.set(entity.actor.mesh.id, entity);
    this.scene.add(entity.actor.mesh);
    return entity;
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

  getEntityByMeshId(id: number) {
    return this.meshIdToEntity.get(id);
  }

  onDestroy() {
    this.entities.forEach(entity => {
      entity.onDestroy();
    });
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
