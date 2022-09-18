import { Actor } from './Actor';
import { Behavior } from './Behavior';
import { ActorAnimator } from './ActorAnimator';
import { Vector3 } from 'three';

export class Entity<A extends Actor = Actor, B extends Behavior = Behavior> {
  type: string;
  actor: A;
  behavior: B;
  tag?: string;
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

  get mesh() {
    return this.actor.mesh;
  }

  onHit(damage: number, entity?: Entity) {
    if (typeof this.hp === 'number') {
      this.hp -= damage;
    }
  }

  onCollide(entity: Entity) {
    return true;
  }

  onMessage(message: string | number) { }

  onDestroy() { }

  setScaticPositionOptimizations(isEnabled: boolean) {
    this.mesh.matrixAutoUpdate = !isEnabled;
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
