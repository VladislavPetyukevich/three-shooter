import { Vector3 } from 'three';
import { ENEMY } from '@/constants';
import { Behavior } from '@/core/Entities/Behavior';
import { Player } from '@/Entities/Player/Player';
import { EnemyActor } from './EnemyActor';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { Bullet } from '@/Entities/Bullet/Bullet';

interface BehaviorProps {
  player: Player;
  velocity: Vector3;
  actor: EnemyActor;
  container: EntitiesContainer;
}

export class EnemyBehavior implements Behavior {
  player: Player;
  velocity: Vector3;
  actor: EnemyActor;
  randomMovementTimeOut: number;
  container: EntitiesContainer;

  constructor(props: BehaviorProps) {
    this.player = props.player;
    this.velocity = props.velocity;
    this.actor = props.actor;
    this.container = props.container;
    this.randomMovementTimeOut = 3;
  }

  shoot() {
    const bulletVelocity = new Vector3(
      Math.sin(this.actor.mesh.rotation.y) * 4,
      0,
      Math.cos(this.actor.mesh.rotation.y) * 4
    );
    const bulletPosition = new Vector3(
      this.actor.mesh.position.x - Math.sin(this.actor.mesh.rotation.y),
      this.actor.mesh.position.y,
      this.actor.mesh.position.z - Math.cos(this.actor.mesh.rotation.y)
    );

    const bullet = new Bullet({
      position: bulletPosition,
      velocity: bulletVelocity,
      container: this.container
    });
    this.container.add(bullet);
  }

  randomMovement() {
    const velocityX = this.randomVelocityValue();
    const velocityZ = this.randomVelocityValue();
    this.velocity.set(
      velocityX,
      0,
      velocityZ
    );
    this.shoot();
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
