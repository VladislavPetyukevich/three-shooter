import { Actor } from './Actor';
import { Behavior } from './Behavior';
import { ActorAnimator } from './ActorAnimator';
import { Vector3 } from 'three';

export class Entity<A extends Actor = Actor, B extends Behavior = Behavior> {
  type: string;
  actor: A;
  behavior: B;
  hp?: number;
  velocity?: Vector3;
  isCollideTransparent: boolean;
  animations: ActorAnimator[];

  constructor(type: string, actor: A, behavior: B) {
    this.type = type;
    this.actor = actor;
    this.behavior = behavior;
    this.isCollideTransparent = false;
    this.animations = [];
  }

  onHit(damage: number) {
    if (this.hp) {
      this.hp -= damage;
    }
  }

  onCollide(entity: Entity) {
    return true;
  }

  onMessage(message: string | number) { }

  onDestroy() { }

  setIsNotMovingOptimizations(isEnabled: boolean) {
    this.actor.mesh.matrixAutoUpdate = !isEnabled;
  }

  addAnimation(animation: ActorAnimator) {
    this.animations.push(animation);
  }

  update(delta: number) {
    this.actor.update(delta);
    this.behavior.update(delta);
    if (this.animations.length !== 0) {
      this.updateAnimations(delta);
    }
  }

  updateAnimations(delta: number) {
    const currentAnimation = this.animations[0];
    if (!currentAnimation) {
      return;
    }
    const isAnimationEnded = !currentAnimation.update(delta);
    if (isAnimationEnded) {
      this.animations.shift();
    }
  }
};
