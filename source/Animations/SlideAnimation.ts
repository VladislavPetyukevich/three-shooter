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

  clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  update(delta: number) {
    const absolutePositions = this.startPosition < this.endPosition ?
      [this.startPosition, this.endPosition] :
      [this.endPosition, this.startPosition];

    if (this.startPosition < this.endPosition) {
      this.actor.mesh.position[this.axis] += delta * this.speed;
    } else {
      this.actor.mesh.position[this.axis] -= delta * this.speed;
    }

    this.actor.mesh.position[this.axis] =
      this.clamp(
        this.actor.mesh.position[this.axis],
        absolutePositions[0],
        absolutePositions[1],
      );
    const meshPosition = this.actor.mesh.position[this.axis];
    if (meshPosition >= absolutePositions[1]) {
      return false;
    } else if (meshPosition <= absolutePositions[0]) {
      return false;
    }
    return true;
  }
}

