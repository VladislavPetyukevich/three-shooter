import { Actor } from './Actor';
import { Behavior } from './Behavior';
import { Vector3 } from 'three';

export class Entity {
  type: string;
  actor: Actor;
  behavior: Behavior;
  hp?: number;
  velocity?: Vector3;
  isCollideTransparent: boolean;

  constructor(type: string, actor: Actor, behavior: Behavior) {
    this.type = type;
    this.actor = actor;
    this.behavior = behavior;
    this.isCollideTransparent = false;
  }

  onHit(damage: number) {
    if (this.hp) {
      this.hp -= damage;
    }
  }

  onCollide(entity: Entity) {
    return true;
  }

  onMessage(message: string | number) {
  }

  setIsNotMovingOptimizations(isEnabled: boolean) {
    this.actor.mesh.matrixAutoUpdate = !isEnabled;
  }

  update(delta: number) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
};
