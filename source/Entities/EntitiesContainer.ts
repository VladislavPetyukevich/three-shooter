import { Scene } from 'three';
import { World } from 'cannon';
import Entity from './Entity';
import SolidBody from '@/SolidBody/SolidBody';
import EventChannel from '@/EventChannel';
import { EVENT_TYPES } from '@/constants';

export default class EntitiesContainer {
  scene: Scene;
  world: World;
  entities: Entity[];

  constructor(scene: Scene, world: World) {
    this.scene = scene;
    this.world = world;
    this.entities = [];
  }

  addSolidBody(solidBody: SolidBody) {
    if (solidBody.mesh) this.scene.add(solidBody.mesh);
    if (solidBody.body) this.world.addBody(solidBody.body);
  }

  deleteSolidBody(solidBody: SolidBody) {
    if (solidBody.mesh) this.scene.remove(solidBody.mesh);
    if (solidBody.body) this.world.remove(solidBody.body);
  }

  add(entitiy: Entity) {
    if (entitiy.actor) {
      this.addSolidBody(entitiy.actor.solidBody);
    }
    this.entities.push(entitiy);
  }

  getEntitiyByBodyId(id: number) {
    const entities = this.entities;
    for (var i = entities.length; i--;) {
      const entitiy = entities[i];
      if (!entitiy.actor.solidBody.body) { continue; }
      if (entitiy.actor.solidBody.body.id !== id) { continue; }
      return entitiy;
    }
    return;
  }

  deleteEntitiyByBodyId(id: number) {
    const entitiy = this.getEntitiyByBodyId(id);
    if (!entitiy) {
      return;
    }
    const entitiyIndex = this.entities.indexOf(entitiy);
    this.entities.splice(entitiyIndex, 1);
    EventChannel.onPublish(EVENT_TYPES.DELETE_ENTITIY, entitiy);
  }

  createEntity(constructor: new (params: any) => Entity, params: any): Entity {
    const newEntity = new constructor({ ...params, container: this })
    this.add(newEntity);
    return newEntity;
  }

  deleteEntity(entity: Entity) {
    this.deleteSolidBody(entity.actor.solidBody);
    this.deleteEntitiyByBodyId(entity.actor.solidBody.body!.id);
  }

  update(delta: number) {
    this.entities.forEach(entitiy => entitiy.update(delta));
    const entitiesToDelete = this.entities.filter(entitiy => (
      (entitiy.hasOwnProperty('hp')) && (entitiy.hp! <= 0)
    )
    );

    entitiesToDelete.forEach(entitiy => this.deleteEntity(entitiy));
  }
}
