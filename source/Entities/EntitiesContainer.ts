import { Scene } from 'three';
import { World, IBodyEvent } from 'cannon';
import Entity from './Entity';
import SolidBody from '../SolidBody/SolidBody';
import EventChannel from '../EventChannel';
import Player, { PlayerProps } from './Player';
import Enemy from './Enemy';
import FlyingEnemy from './FlyingEnemy';
import Gun from './Gun';
import Bullet from './Bullet';
import { ENTITY_NAME, EVENT_TYPES } from '../constants';

const isEnemy = (entity: Entity) =>
  entity instanceof Enemy || entity instanceof FlyingEnemy;

type PropsTypes = PlayerProps | any;

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
    if (isEnemy(entitiy)) {
      EventChannel.onPublish(EVENT_TYPES.DELETE_ENEMY, entitiy);
    }
  }

  createEntity(name: ENTITY_NAME, params: PropsTypes) {
    let newEntity;
    switch (name) {
      case ENTITY_NAME.PLAYER:
        newEntity = new Player({ ...params, container: this });
        break;
      case ENTITY_NAME.ENEMY:
        newEntity = new Enemy({ ...params, container: this });
        break;
      case ENTITY_NAME.FLYING_ENEMY:
        newEntity = new FlyingEnemy({ ...params, container: this });
        break;
      case ENTITY_NAME.GUN:
        newEntity = new Gun({ ...params, container: this });
        break;
      case ENTITY_NAME.BULLET:
        newEntity = new Bullet({ ...params, container: this });
        break;
    }
    this.add(newEntity as Entity);
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
