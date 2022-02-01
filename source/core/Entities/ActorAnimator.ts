import { Actor } from './Actor';

export interface ActorAnimator {
  actor: Actor;
  update(delta: number): boolean;
}
