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
  isDead: boolean;
  currentTitleX: number;
  currentTitleDisplayTime: number;

  constructor(props: BehaviorProps) {
    this.player = props.player;
    this.velocity = props.velocity;
    this.actor = props.actor;
    this.currentTitleX = 0;
    this.currentTitleDisplayTime = 0;
    this.container = props.container;
    this.randomMovementTimeOut = 3;
    this.isDead = false;
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

  death() {
    this.isDead = true;
    this.velocity.set(0, 0, 0);
    setTimeout(
      () => this.container.remove(this.actor.mesh),
      1000
    );
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

  updateWalkSprite(delta: number) {
    this.currentTitleDisplayTime += delta;
    if (this.currentTitleDisplayTime < 0.6) {
      return;
    }
    this.currentTitleX = this.currentTitleX ? 0 : 1;
    this.actor.spriteSheet.displaySprite(this.currentTitleX, 0);
    this.currentTitleDisplayTime = 0;
  }


  update(delta: number) {
    if (this.isDead) {
      return;
    }
    this.randomMovementTimeOut += delta;
    if (this.randomMovementTimeOut > 3) {
      this.randomMovement();
      this.randomMovementTimeOut = 0;
    } else {
      this.updateWalkSprite(delta);
    }
  }
}
