import { ENTITY_TYPE } from '@/constants';
import Actor from './Actors/Actor';
import Behavior from './Behaviors/Behavior';

export default class Entity {
  type: ENTITY_TYPE;
  actor: Actor;
  behavior: Behavior;
  hp?: number;

  constructor(type: ENTITY_TYPE, actor: Actor, behavior: Behavior, hp?: number) {
    this.type = type;
    this.actor = actor;
    this.behavior = behavior;
    this.hp = hp;
  }

  update(delta: number) {
    this.actor.update();
    this.behavior.update(delta);
  }
};
