import { Vector3 } from 'three';
import { Bullet, BulletProps } from '../Bullet/Bullet';
import { BulletActor } from '../Bullet/BulletActor';
import { BulletBehavior } from '../Bullet/BulletBehavior';
import { BOOMERANG } from '@/constants';

export interface BoomerangBehaviorProps {
  actor: BulletActor;
  velocity: Vector3;
  setDirection: Bullet['setDirection'];
  author?: BulletProps['author'];
}

type BoomerangPhase = 'flyForward' | 'flyBlackward';

export class BoomerangBehavior extends BulletBehavior {
  author: BulletProps['author'];
  actor: BulletActor;
  velocity: Vector3;
  currentPhase: BoomerangPhase;
  flyForwardTime: number;
  setDirection: Bullet['setDirection'];

  constructor(props: BoomerangBehaviorProps) {
    super();
    this.author = props.author;
    this.actor = props.actor;
    this.velocity = props.velocity;
    this.currentPhase = 'flyForward';
    this.flyForwardTime = 0;
    this.setDirection = props.setDirection;
  }

  update(delta: number) {
    super.update(delta);
    switch (this.currentPhase) {
      case 'flyForward':
        if (this.flyForwardTime >= BOOMERANG.FIRST_PHASE_TIME) {
          this.currentPhase = 'flyBlackward';
          return;
        }
        this.flyForwardTime += delta;
        break;
      case 'flyBlackward':
        this.updateFlyBackward();
        break;
      default:
        break;
    }
  }

  updateFlyBackward() {
    if (!this.author) {
      return;
    }
    const playerPosition = this.author.mesh.position;
    const direction = new Vector3(
      playerPosition.x - this.actor.mesh.position.x,
      0,
      playerPosition.z - this.actor.mesh.position.z,
    ).normalize();
    this.setDirection(direction);
  }
}

