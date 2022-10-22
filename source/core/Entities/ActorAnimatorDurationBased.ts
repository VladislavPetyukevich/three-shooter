import { Actor } from './Actor';
import { ActorAnimator } from './ActorAnimator';

export class ActorAnimatorDurationBased implements ActorAnimator {
  currentDuration: number;

  constructor(public actor: Actor, protected durationSeconds: number = 0) {
    this.currentDuration = 0;
  }

  update(delta: number) {
    this.currentDuration += delta;
    return this.currentDuration < this.durationSeconds;
  }
}
