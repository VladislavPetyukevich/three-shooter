import { Scene, Mesh, Vector3 } from 'three';
import { Entity } from './Entity';
import { CollideChecker2d } from './CollideChecker2d';

export class EntitiesContainer {
  scene: Scene;
  entities: Entity[];
  entitiesMeshes: Mesh[];
  collideChecker: CollideChecker2d;

  constructor(scene: Scene) {
    this.scene = scene;
    this.entities = [];
    this.entitiesMeshes = [];
    this.collideChecker = new CollideChecker2d({ cellSize: 3 });
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
    this.entities = this.entities.filter(
      entityEl => entityEl.actor.mesh.id !== meshId
    );
    this.entitiesMeshes = this.entitiesMeshes.filter(
      entityMesh => entityMesh.id !== meshId
    );
    this.scene.remove(mesh);
  }

  update(delta: number) {
    this.entities.forEach(entity => {
      if ((typeof entity.hp === 'number') && (entity.hp === 0)) {
        this.remove(entity.actor.mesh);
        return;
      }
      if (!entity.velocity) {
        entity.update(delta);
        return;
      }

      entity.actor.mesh.position.set(
        entity.actor.mesh.position.x,
        entity.actor.mesh.position.y + entity.velocity.y * delta,
        entity.actor.mesh.position.z
      );
      this.updateEntityPosition(
        entity,
        new Vector3(
          entity.actor.mesh.position.x + entity.velocity.x * delta,
          entity.actor.mesh.position.y,
          entity.actor.mesh.position.z
        )
      );
      this.updateEntityPosition(
        entity,
        new Vector3(
          entity.actor.mesh.position.x,
          entity.actor.mesh.position.y,
          entity.actor.mesh.position.z + entity.velocity.z * delta
        )
      );
      entity.update(delta);
    });
  }

  updateEntityPosition(entity: Entity, newPosition: Vector3) {
    const collisionsResult = this.collideChecker.detectCollisions(entity, newPosition);
    if (collisionsResult.entities.length === 0) {
      this.collideChecker.updateEntityPosition(entity, newPosition);
      return;
    }

    collisionsResult.entities.forEach(collideEntity => {
      collideEntity.onCollide(entity);
      const isEntityCanMove = entity.onCollide(collideEntity);
      if (isEntityCanMove) {
        this.collideChecker.updateEntityPosition(entity, newPosition);
      }
    });
  }
}
