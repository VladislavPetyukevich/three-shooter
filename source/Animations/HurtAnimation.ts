import { ActorAnimatorDurationBased } from '@/core/Entities/ActorAnimatorDurationBased';
import { EnemyActor } from '@/Entities/Enemy/EnemyActor';

export interface HurtAnimationProps {
  actor: EnemyActor;
  hurtSpriteIndex: number;
  durationSeconds: number;
  onEnd: () => void;
}

export class HurtAnimation extends ActorAnimatorDurationBased {
  actor: EnemyActor;
  onEnd: HurtAnimationProps['onEnd'];
  initialSpriteIndex: number;

  constructor(props: HurtAnimationProps) {
    super(props.actor, props.durationSeconds);
    this.actor = props.actor;
    this.onEnd = props.onEnd;
    this.initialSpriteIndex = this.actor.spriteSheet.currentIndex;
    this.actor.spriteSheet.displaySprite(props.hurtSpriteIndex);
  }

  update(delta: number) {
    const isPlaying = super.update(delta);
    if (!isPlaying) {
      this.actor.spriteSheet.displaySprite(this.initialSpriteIndex);
      this.onEnd();
    }
    return isPlaying;
  }
}

