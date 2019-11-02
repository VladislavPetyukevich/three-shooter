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
  }

  createEntity(constructor: new (params: any) => Entity, params: any): Entity {
    const newEntity = new constructor({ ...params, container: this })
    this.add(newEntity);
    return newEntity;
  }
  update(delta: number) {
    this.entities.forEach(entitiy => entitiy.update(delta));
  }
}
