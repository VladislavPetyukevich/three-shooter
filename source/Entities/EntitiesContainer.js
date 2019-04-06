import EventChannel from '../EventChannel';

export const EVENT_TYPES = {
  DELETE_ENTITIY: 'ENTITIES_CONTAINER_DELETE_ENTITIY'
};

export default class EntitiesContainer {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.entities = [];
  }

  add(entitiy) {
    entitiy.actor.solidBody.body.addEventListener("collide", event => {
      if (event.body.isBullet) {
        event.target._hp--;
      }
    });
    this.entities.push(entitiy);
    this.world.addBody(entitiy.actor.solidBody.body);
    if (entitiy.actor.solidBody.mesh) {
      this.scene.add(entitiy.actor.solidBody.mesh);
    }
  }

  deleteEntitiyByUuid(uuid) {
    const entities = this.entities;
    for (var i = entities.length; i--;) {
      const entitiy = entities[i];
      if (entitiy.actor.solidBody.mesh.uuid === uuid) {
        this.entities.splice(i, 1);
        EventChannel.onPublish(EVENT_TYPES.DELETE_ENTITIY, entitiy);
        return;
      }
    }
  }

  update(delta) {
    this.entities.forEach(entitiy => entitiy.update(delta));
    const entitiesToDelete = this.entities.filter(entitiy => entitiy.actor.solidBody.body._hp <= 0);
    entitiesToDelete.forEach(entitiy => {
      this.scene.remove(entitiy.actor.solidBody.mesh);
      this.world.remove(entitiy.actor.solidBody.body);
      this.deleteEntitiyByUuid(entitiy.actor.solidBody.mesh.uuid);
    });
  }
}
