import { Actor } from './Actor';
import { Behavior } from './Behavior';
import { Vector3 } from 'three';

export class Entity {
  type: string;
  actor: Actor;
  behavior: Behavior;
  hp?: number;
  velocity?: Vector3;

  constructor(type: string, actor: Actor, behavior: Behavior) {
    this.type = type;
    this.actor = actor;
    this.behavior = behavior;
  }

  onHit(damage: number) {
    if (this.hp) {
      this.hp -= damage;
    }
  }

  onCollide(entity: Entity) {
    return true;
  }

  update(delta: number) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
};
