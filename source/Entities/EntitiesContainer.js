import EventChannel from '../EventChannel';
import Player from './Player';
import Enemy from './Enemy';
import Gun from './Gun';
import Bullet from './Bullet';

export const EVENT_TYPES = {
  DELETE_ENTITIY: 'ENTITIES_CONTAINER_DELETE_ENTITIY'
};

export default class EntitiesContainer {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.entities = [];
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
        newEntity = new Bullet(params);
        break;
    }
    this.add(newEntity);
    return newEntity;
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
    if (entitiy.type === 'creature') {
      this.addCollideHandler(entitiy);
    }
    if (entitiy.actor) {
      this.addSolidBody(entitiy.actor.solidBody);
    }
    this.entities.push(entitiy);
  }

  deleteEntitiyByUuid(uuid) {
    const entities = this.entities;
    for (var i = entities.length; i--;) {
      const entitiy = entities[i];
      if (entitiy.type === 'creature') {
        if (entitiy.actor.solidBody.body.id === uuid) {
          this.entities.splice(i, 1);
          EventChannel.onPublish(EVENT_TYPES.DELETE_ENTITIY, entitiy);
          return;
        }
      }
    }
  }

  update(delta) {
    this.entities.forEach(entitiy => entitiy.update(delta));
    const entitiesToDelete = this.entities.filter(entitiy => {
      if (entitiy.type === 'creature') {
        if (entitiy.actor.solidBody.body._hp <= 0) {
          return true;
        }
      }
    }
    );

    entitiesToDelete.forEach(entitiy => {
      this.deleteSolidBody(entitiy.actor.solidBody)
      this.deleteEntitiyByUuid(entitiy.actor.solidBody.body.id);
    });
  }
}
