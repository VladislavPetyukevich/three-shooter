import { ActorAnimatorDurationBased } from '@/core/Entities/ActorAnimatorDurationBased';
import { EnemyActor } from '@/Entities/Enemy/EnemyActor';

export interface DeathAnimationProps {
  actor: EnemyActor;
  durationSeconds: number;
  spriteIndices: number[];
}

export class DeathAnimation extends ActorAnimatorDurationBased {
  actor: EnemyActor;
  initialSpriteIndex: number;
  spriteIndices: number[];
  spriteInterval: number;
  currentSpriteIndex: number;
  currentSpriteDisplayTime: number;

  constructor(props: DeathAnimationProps) {
    super(props.actor, props.durationSeconds);
    this.actor = props.actor;
    this.initialSpriteIndex = this.actor.spriteSheet.currentIndex;
    this.spriteIndices = props.spriteIndices;
    this.spriteInterval = props.durationSeconds / this.spriteIndices.length;
    this.currentSpriteIndex = 0;
    this.currentSpriteDisplayTime = 0;
    this.actor.spriteSheet.displaySprite(this.spriteIndices[this.currentSpriteIndex]);
  }

  updateDeathSprite(delta: number) {
    this.currentSpriteDisplayTime += delta;
    if (this.currentSpriteDisplayTime < this.spriteInterval) {
      return;
    }
    this.currentSpriteIndex = (this.currentSpriteIndex + 1) % this.spriteIndices.length;
    this.actor.spriteSheet.displaySprite(this.spriteIndices[this.currentSpriteIndex]);
    this.currentSpriteDisplayTime = 0;
  }

  update(delta: number) {
    const isPlaying = super.update(delta);
    if (isPlaying) {
      this.updateDeathSprite(delta);
    }
    return isPlaying;
  }
}

