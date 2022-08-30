import { Actor } from '@/core/Entities/Actor';
import { ActorAnimator } from '@/core/Entities/ActorAnimator';

interface SlideAnimationProps {
  actor: Actor;
  axis: 'x' | 'y' | 'z';
  speed: number;
  startPosition: number;
  endPosition: number;
}

export class SlideAnimation implements ActorAnimator {
  actor: Actor;
  axis: SlideAnimationProps['axis'];
  speed: number;
  startPosition: number;
  endPosition: number;

  constructor(props: SlideAnimationProps) {
    this.actor = props.actor;
    this.axis = props.axis;
    this.speed = props.speed;
    this.startPosition = props.startPosition;
    this.endPosition = props.endPosition;
  }

  update(delta: number) {
    this.actor.mesh.position[this.axis] += delta * this.speed;
    const meshPosition = this.actor.mesh.position[this.axis];
    if (meshPosition > this.endPosition) {
      return false;
    } else if (meshPosition < this.startPosition) {
      return false;
    }
    return true;
  }
}

