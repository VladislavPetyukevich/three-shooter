import { Vector3 } from 'three';
import { ENEMY } from '@/constants';
import { Behavior } from '@/core/Entities/Behavior';
import { Player } from '@/Entities/Player/Player';
import { EnemyActor } from './EnemyActor';

interface BehaviorProps {
  player: Player;
  velocity: Vector3;
  actor: EnemyActor;
}

export class EnemyBehavior implements Behavior {
  player: Player;
  velocity: Vector3;
  actor: EnemyActor;
  randomMovementTimeOut: number;

  constructor(props: BehaviorProps) {
    this.player = props.player;
    this.velocity = props.velocity;
    this.actor = props.actor;
    this.randomMovementTimeOut = 3;
  }

  randomMovement() {
    const velocityX = this.randomVelocityValue();
    const velocityZ = this.randomVelocityValue();
    this.velocity.set(
      velocityX,
      0,
      velocityZ
    )
  }

  randomVelocityValue() {
    return (Math.random() > 0.5) ? (ENEMY.WALK_SPEED / 2) : -(ENEMY.WALK_SPEED / 2);
  }

  update(delta: number) {
    this.randomMovementTimeOut += delta;
    if (this.randomMovementTimeOut > 3) {
      this.randomMovement();
      this.randomMovementTimeOut = 0;
    }
  }
}
