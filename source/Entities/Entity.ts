import { ENTITY_TYPE } from '../constants';
import Actor from './Actors/Actor';
import Behavior from './Behaviors/Behavior';

export default class Entity {
  type: ENTITY_TYPE;
  actor: Actor;
  behavior: Behavior;

  constructor(type: ENTITY_TYPE, actor: Actor, behavior: Behavior) {
    this.type = type;
    this.actor = actor;
    this.behavior = behavior;
  }

  update(delta: number) {
    this.actor.update();
    this.behavior.update(delta);
  }
};
