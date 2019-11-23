import { Actor } from './Actor';
import { Behavior } from './Behavior';
import { Vector3 } from 'three';

export class Entity {
  actor: Actor;
  behavior: Behavior;
  velocity?: Vector3;

  constructor(actor: Actor, behavior: Behavior, velocity?: Vector3) {
    this.actor = actor;
    this.behavior = behavior;
    this.velocity = velocity;
  }

  update(delta: number) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
};
