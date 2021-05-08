import { Behavior } from '@/core/Entities/Behavior';
import { TorchActor } from './TorchActor';

interface TorchBehaviorProps {
  actor: TorchActor;
}

export class TorchBehavior implements Behavior {
  actor: TorchActor;
  currentSprite: number;
  spriteDisplayTime: number;
  currentSpriteDisplayTime: number;

  constructor(props: TorchBehaviorProps) {
    this.actor = props.actor;
    this.currentSprite = 0;
    this.spriteDisplayTime = 0.3;
    this.currentSpriteDisplayTime = 0;
  }

  update(delta: number) {
    this.currentSpriteDisplayTime += delta;
    if (this.currentSpriteDisplayTime < this.spriteDisplayTime) {
      return;
    }
    this.currentSpriteDisplayTime = 0;
    if (this.currentSprite === 2) {
      this.currentSprite = 0;
    } else {
      this.currentSprite++;
    }
    this.actor.spriteSheet.displaySprite(this.currentSprite);
  }
}

