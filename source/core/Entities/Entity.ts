import { Actor } from './Actor';
import { Behavior } from './Behavior';
import { Vector3 } from 'three';

export class Entity {
  type: string;
  actor: Actor;
  behavior: Behavior;
  velocity?: Vector3;

  constructor(type: string, actor: Actor, behavior: Behavior, velocity?: Vector3) {
    this.type = type;
    this.actor = actor;
    this.behavior = behavior;
    this.velocity = velocity;
  }

  onCollide(entity: Entity) {
    return true;
  }

  update(delta: number) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
};
