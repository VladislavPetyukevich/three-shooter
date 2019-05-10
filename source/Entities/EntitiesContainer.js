import EventChannel from '../EventChannel';
import Player from './Player';
import Enemy from './Enemy';
import Gun from './Gun';
import Bullet from './Bullet';
import { ENTITY } from '../constants';

export const EVENT_TYPES = {
  DELETE_ENTITIY: 'ENTITIES_CONTAINER_DELETE_ENTITIY',
  DELETE_ENEMY: 'ENTITIES_CONTAINER_DELETE_ENEMY'
};

export default class EntitiesContainer {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.entities = [];
  }

  addSolidBody(solidBody) {
    if (solidBody.mesh) this.scene.add(solidBody.mesh);
    if (solidBody.body) this.world.addBody(solidBody.body);
  }

  deleteSolidBody(solidBody) {
    if (solidBody.mesh) this.scene.remove(solidBody.mesh);
    if (solidBody.body) this.world.remove(solidBody.body);
  }

  addCollideHandler(entitiy) {
    if (entitiy.actor.solidBody && entitiy.actor.solidBody.body) {
      entitiy.actor.solidBody.body.addEventListener("collide", event => {
        if (event.body.isBullet) {
          event.target._hp--;
        }
      });
    }
  }

  add(entitiy) {
    if (entitiy.type === ENTITY.TYPE.CREATURE) {
      this.addCollideHandler(entitiy);
    }
    if (entitiy.actor) {
      this.addSolidBody(entitiy.actor.solidBody);
    }
    this.entities.push(entitiy);
  }

  deleteEntitiyByBodyId(id) {
    const entities = this.entities;
    for (var i = entities.length; i--;) {
      const entitiy = entities[i];
      if (entitiy.type !== ENTITY.TYPE.CREATURE) continue;
      if (entitiy.actor.solidBody.body.id !== id) continue;
      this.entities.splice(i, 1);
      EventChannel.onPublish(EVENT_TYPES.DELETE_ENTITIY, entitiy);
      if (entitiy instanceof Enemy) {
        EventChannel.onPublish(EVENT_TYPES.DELETE_ENEMY, entitiy);
      }
      return;
    }
  }

  createEntity(type, params) {
    let newEntity;
    switch (type) {
      case 'Player':
        newEntity = new Player({ ...params, container: this });
        break;
      case 'Enemy':
        newEntity = new Enemy({ ...params, container: this });
        break;
      case 'Gun':
        newEntity = new Gun({ ...params, container: this });
        break;
      case 'Bullet':
        newEntity = new Bullet({ ...params, container: this });
        break;
    }
    this.add(newEntity);
    return newEntity;
  }

  deleteEntity(entity) {
    this.deleteSolidBody(entity.actor.solidBody);
    this.deleteEntitiyByBodyId(entity.actor.solidBody.body.id);
  }

  update(delta) {
    this.entities.forEach(entitiy => entitiy.update(delta));
    const entitiesToDelete = this.entities.filter(entitiy => {
      if (entitiy.type === ENTITY.TYPE.CREATURE) {
        if (entitiy.actor.solidBody.body._hp <= 0) {
          return true;
        }
      }
    }
    );

    entitiesToDelete.forEach(entitiy => this.deleteEntity(entitiy));
  }
}
