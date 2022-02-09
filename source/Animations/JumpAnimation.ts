import {
  ActorAnimatorEaseBased,
  ActorAnimatorEaseBasedProps,
} from './ActorAnimatorEaseBased';
import { easeBounceSin } from '@/EaseProgress';

interface JumpAnimationProps extends ActorAnimatorEaseBasedProps {
  jumpHeight: number;
}

export class JumpAnimation extends ActorAnimatorEaseBased {
  startY: number;
  jumpHeight: number;

  constructor(props: JumpAnimationProps) {
    super({
      ...props,
      transitionFunction: easeBounceSin,
    });
    this.startY = props.actor.mesh.position.y;
    this.jumpHeight = props.jumpHeight;
  }

  update(delta: number) {
    const jumpY = this.jumpHeight * this.easeProgress.getCurrentProgress();
    this.actor.mesh.position.y = this.startY + jumpY;
    return super.update(delta);
  }
}
