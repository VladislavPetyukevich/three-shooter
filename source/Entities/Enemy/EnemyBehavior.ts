import { Vector3, AudioListener, PositionalAudio } from 'three';
import { ENEMY, GAME_SOUND_NAME } from '@/constants';
import { Behavior } from '@/core/Entities/Behavior';
import { Player } from '@/Entities/Player/Player';
import { EnemyActor } from './EnemyActor';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { audioStore } from '@/core/loaders';

interface BehaviorProps {
  player: Player;
  velocity: Vector3;
  actor: EnemyActor;
  container: EntitiesContainer;
  audioListener: AudioListener;
}

export class EnemyBehavior implements Behavior {
  player: Player;
  velocity: Vector3;
  actor: EnemyActor;
  randomMovementTimeOut: number;
  container: EntitiesContainer;
  isDead: boolean;
  currentWalkSprite: number;
  currentTitleDisplayTime: number;
  shootSound: PositionalAudio;
  shootTimeOut: number;
  onDeathCallback?: Function;

  constructor(props: BehaviorProps) {
    this.player = props.player;
    this.velocity = props.velocity;
    this.actor = props.actor;
    this.currentWalkSprite = 0;
    this.currentTitleDisplayTime = 0;
    this.container = props.container;
    this.randomMovementTimeOut = ENEMY.MOVEMENT_TIME_OUT;
    this.shootTimeOut = ENEMY.SHOOT_TIME_OUT;
    this.isDead = false;
    this.shootSound = new PositionalAudio(props.audioListener);
    const shootSoundBuffer = audioStore.getSound(GAME_SOUND_NAME.gunShoot);
    this.shootSound.setBuffer(shootSoundBuffer);
    this.actor.mesh.add(this.shootSound);
  }

  shoot() {
    const bulletVelocity = new Vector3(
      Math.sin(this.actor.mesh.rotation.y) * ENEMY.BULLET_SPEED,
      0,
      Math.cos(this.actor.mesh.rotation.y) * ENEMY.BULLET_SPEED
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
    this.shootSound.play();
  }

  death() {
    this.isDead = true;
    this.velocity.set(0, 0, 0);
    this.actor.spriteSheet.displaySprite(2);
    setTimeout(
      () => {
        this.container.remove(this.actor.mesh);
        if (this.onDeathCallback) {
          this.onDeathCallback();
        }
      },
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
  }

  randomVelocityValue() {
    return (Math.random() > 0.5) ? (ENEMY.WALK_SPEED / 2) : -(ENEMY.WALK_SPEED / 2);
  }

  updateWalkSprite(delta: number) {
    if (this.isDead) {
      return;
    }
    this.currentTitleDisplayTime += delta;
    if (this.currentTitleDisplayTime < 0.6) {
      return;
    }
    this.currentWalkSprite = this.currentWalkSprite ? 0 : 1;
    this.actor.spriteSheet.displaySprite(this.currentWalkSprite);
    this.currentTitleDisplayTime = 0;
  }


  update(delta: number) {
    if (this.isDead) {
      return;
    }
    const distanceToPlayer = this.getDistanceToPlayer();
    if (distanceToPlayer > ENEMY.VIEW_DISTANCE) {
      return;
    }

    this.randomMovementTimeOut += delta;
    if (this.randomMovementTimeOut > ENEMY.MOVEMENT_TIME_OUT) {
      this.randomMovement();
      this.randomMovementTimeOut = 0;
    } else {
      this.updateWalkSprite(delta);
    }

    this.shootTimeOut += delta;
    if (this.shootTimeOut > ENEMY.SHOOT_TIME_OUT) {
      this.shoot();
      this.shootTimeOut = 0;
    }
  }

  getDistanceToPlayer() {
    const diffX = this.actor.mesh.position.x - this.player.actor.mesh.position.x;
    const diffZ = this.actor.mesh.position.z - this.player.actor.mesh.position.z;
    return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffZ, 2));
  }
}
