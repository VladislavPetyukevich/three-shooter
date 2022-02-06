import { Actor } from '@/core/Entities/Actor';
import { ActorAnimator } from '@/core/Entities/ActorAnimator';
import { EaseProgress } from '@/EaseProgress';

export interface ActorAnimatorEaseBasedProps {
  actor: Actor;
  durationSeconds: number;
  transitionFunction?: (x: number) => number;
}

export class ActorAnimatorEaseBased implements ActorAnimator {
  actor: Actor;
  easeProgress: EaseProgress;

  constructor(props: ActorAnimatorEaseBasedProps) {
    this.actor = props.actor;
    this.easeProgress = new EaseProgress({
      minValue: 0,
      maxValue: 1,
      progressSpeed: 1 / props.durationSeconds,
      transitionFunction: props.transitionFunction,
    });
  }

  update(delta: number) {
    this.easeProgress.updateProgress(delta);
    return !this.easeProgress.checkIsProgressCompelete();
  }
}
