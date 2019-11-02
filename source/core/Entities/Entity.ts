import { Actor } from './Actor';
import { Behavior } from './Behavior';

export class Entity {
  actor: Actor;
  behavior: Behavior;

  constructor(actor: Actor, behavior: Behavior) {
    this.actor = actor;
    this.behavior = behavior;
  }

  update(delta: number) {
    this.actor.update(delta);
    this.behavior.update(delta);
  }
};
