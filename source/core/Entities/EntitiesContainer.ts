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
    this.entitiesMeshes.push(entity.mesh);
    this.meshIdToEntity.set(entity.mesh.id, entity);
    this.scene.add(entity.mesh);
    return entity;
  }

  remove(mesh: Mesh) {
    const meshId = mesh.id;
    this.collideChecker.removeEntity(meshId);
    for (let i = this.entities.length; i--;) {
      if (this.entities[i].mesh.id === meshId) {
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

      entity.mesh.position.set(
        entity.mesh.position.x,
        entity.mesh.position.y + entity.velocity.y * delta,
        entity.mesh.position.z
      );
      const newPositionX = entity.mesh.position.x + entity.velocity.x * delta;
      const newPositionZ = entity.mesh.position.z + entity.velocity.z * delta;
      this.updateEntityPosition(
        entity,
        new Vector3(
          newPositionX,
          entity.mesh.position.y,
          entity.mesh.position.z
        )
      );
      this.updateEntityPosition(
        entity,
        new Vector3(
          entity.mesh.position.x,
          entity.mesh.position.y,
          newPositionZ
        )
      );
      entity.update(delta);
    });
  }

  updateEntityPosition(entity: Entity, newPosition: Vector3) {
    const collisionsResult: Entity[] = [];
    collisionsResult.push(
      ...this.collideChecker.detectCollisions(entity, newPosition)
    );
    const collisionsResultRaycast = this.collideCheckerRaycast.detectCollisions(entity, newPosition);
    collisionsResultRaycast.forEach(collisionRaycast => {
      const meshId = collisionRaycast.object.id;
      const isDetectedPreviously = collisionsResult.some(
        collision => collision.mesh.id === meshId
      );
      if (isDetectedPreviously) {
        return;
      }
      const entity = this.meshIdToEntity.get(meshId);
      if (!entity) {
        console.warn('Collided entity not found by mesh id');
        return;
      }
      collisionsResult.push(entity);
    });
    if (collisionsResult.length === 0) {
      this.collideChecker.updateEntityPosition(entity, newPosition);
      return;
    }


    let isEntityCanMove = true;
    collisionsResult.forEach(collideEntity => {
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
