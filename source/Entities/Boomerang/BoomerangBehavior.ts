import { Vector3 } from 'three';
import { PlayerActor } from '@/Entities/Player/PlayerActor';
import { Bullet } from '../Bullet/Bullet';
import { BulletActor } from '../Bullet/BulletActor';
import { BulletBehavior } from '../Bullet/BulletBehavior';
import { BOOMERANG } from '@/constants';

export interface BoomerangBehaviorProps {
  playerActor: PlayerActor;
  actor: BulletActor;
  velocity: Vector3;
  setDirection: Bullet['setDirection'];
}

type BoomerangPhase = 'flyForward' | 'flyBlackward';

export class BoomerangBehavior extends BulletBehavior {
  playerActor: PlayerActor;
  actor: BulletActor;
  velocity: Vector3;
  currentPhase: BoomerangPhase;
  flyForwardTime: number;
  setDirection: Bullet['setDirection'];

  constructor(props: BoomerangBehaviorProps) {
    super();
    this.playerActor = props.playerActor;
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
    const playerPosition = this.playerActor.mesh.position;
    const direction = new Vector3(
      playerPosition.x - this.actor.mesh.position.x,
      0,
      playerPosition.z - this.actor.mesh.position.z,
    ).normalize();
    this.setDirection(direction);
  }
}

