import { Vector3, AudioListener, PositionalAudio, BoxGeometry } from 'three';
import { ENEMY, GAME_SOUND_NAME, PI_180 } from '@/constants';
import { Entity } from '@/core/Entities/Entity';
import { Behavior } from '@/core/Entities/Behavior';
import { Player } from '@/Entities/Player/Player';
import { EnemyActor } from './EnemyActor';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { audioStore } from '@/core/loaders';
import { StateMachine } from '@/StateMachine';
import { randomNumbers } from '@/RandomNumbers';

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
  backupVelocity: Vector3;
  actor: EnemyActor;
  randomMovementTimeOut: number;
  currentStrafeAngle: number;
  strafeAngle: number;
  hurtTimeOut: number;
  bulletPositionOffset: number;
  container: EntitiesContainer;
  currentWalkSprite: number;
  currentTitleDisplayTime: number;
  shootSound: PositionalAudio;
  shootTimeOut: number;
  stateMachine: StateMachine;
  onDeathCallback?: Function;

  constructor(props: BehaviorProps) {
    this.player = props.player;
    this.velocity = props.velocity;
    this.backupVelocity = new Vector3();
    this.actor = props.actor;
    this.currentWalkSprite = 0;
    this.currentTitleDisplayTime = 0;
    this.bulletPositionOffset = 1.5;
    this.container = props.container;
    this.randomMovementTimeOut = ENEMY.MOVEMENT_TIME_OUT;
    this.currentStrafeAngle = 0;
    this.strafeAngle = 22.5;
    this.hurtTimeOut = 0;
    this.shootTimeOut = ENEMY.SHOOT_TIME_OUT;
    this.shootSound = new PositionalAudio(props.audioListener);
    const shootSoundBuffer = audioStore.getSound(GAME_SOUND_NAME.gunShoot);
    this.shootSound.setBuffer(shootSoundBuffer);
    this.actor.mesh.add(this.shootSound);
    this.stateMachine = new StateMachine({
      initialState: 'walkingAround',
      transitions: [
        { name: 'walkAround', from: 'attacking', to: 'walkingAround' },
        { name: 'attack', from: ['walkingAround', 'followingPlayer', 'hurted'], to: 'attacking' },
        { name: 'hurt', from: ['walkingAround', 'followingPlayer', 'attacking'], to: 'hurting' },
        { name: 'hurts', from: 'hurting', to: 'hurted' },
        { name: 'death', from: ['walkingAround', 'attacking', 'hurting', 'hurted'], to: 'dies' },
        { name: 'dead', from: 'dies', to: 'died' },
        { name: 'followPlayer', from: 'attacking', to: 'followingPlayer' }
      ]
    });
  }

  shoot() {
    const bulletVelocity = new Vector3(
      Math.sin(this.actor.mesh.rotation.y) * ENEMY.BULLET_SPEED,
      0,
      Math.cos(this.actor.mesh.rotation.y) * ENEMY.BULLET_SPEED
    );
    const offsetX = this.bulletPositionOffset * Math.sin(this.actor.mesh.rotation.y);
    const offsetZ = this.bulletPositionOffset * Math.cos(this.actor.mesh.rotation.y);
    const bulletPosition = new Vector3(
      this.actor.mesh.position.x + offsetX,
      this.actor.mesh.position.y,
      this.actor.mesh.position.z + offsetZ
    );

    const bullet = new Bullet({
      position: bulletPosition,
      velocity: bulletVelocity,
      container: this.container
    });
    this.container.add(bullet);
    this.shootSound.play();
  }

  hurt() {
    this.stateMachine.doTransition('hurt');
  }

  death() {
    this.stateMachine.doTransition('death');
  }

  onCollide(entity: Entity) {
    const currentState = this.stateMachine.state();
    const isGettingAround = randomNumbers.getRandom() > 0.3;
    if (
      !isGettingAround &&
      (currentState !== 'followingPlayer') &&
      (currentState !== 'attacking')
    ) {
      this.velocity.negate();
      return;
    }
    if (entity.actor.mesh.geometry.type === 'BoxGeometry') {
      const collideGeometryParams = (<BoxGeometry>entity.actor.mesh.geometry).parameters;
      const actorPos = this.actor.mesh.position;
      const collidePos = entity.actor.mesh.position;
      const halfWidth = collideGeometryParams.width / 2;
      const isHorizontal =
        (actorPos.x >= collidePos.x + halfWidth) ||
        (actorPos.x <= collidePos.x - halfWidth);
      const velocityValue = randomNumbers.getRandom() * ENEMY.WALK_SPEED;
      if (isHorizontal) {
        this.velocity.set(0, 0, velocityValue);
      } else {
        this.velocity.set(velocityValue, 0, 0);
      }
    }
  }

  randomMovement() {
    const velocityX = this.randomVelocityValue();
    const velocityZ = this.randomVelocityValue();
    const direction = new Vector3(velocityX, 0, velocityZ);
    this.velocity.copy(
      direction.normalize().multiplyScalar(ENEMY.WALK_SPEED)
    );
  }

  randomVelocityValue() {
    const randomVal = randomNumbers.getRandom();
    return (randomNumbers.getRandom() > 0.5) ? randomVal : -randomVal;
  }

  randomStrafe() {
    const strafeAngle = this.randomStrafeRotation() * PI_180;
    if (strafeAngle === this.currentStrafeAngle) {
      return;
    }
    const angle = strafeAngle - this.currentStrafeAngle;
    this.velocity.set(
      this.velocity.x * Math.cos(angle) - this.velocity.z * Math.sin(angle),
      0,
      this.velocity.x * Math.sin(angle) + this.velocity.z * Math.cos(angle),
    );
  }

  randomStrafeRotation() {
    const randValue = randomNumbers.getRandom();
    if (randValue < 0.33) {
      return -this.strafeAngle;
    }
    if (randValue < 0.66) {
      return this.strafeAngle;
    }
    return 0;
  }

  moveToPlayer() {
    this.velocity.set(
      Math.sin(this.actor.mesh.rotation.y) * ENEMY.WALK_SPEED,
      0,
      Math.cos(this.actor.mesh.rotation.y) * ENEMY.WALK_SPEED
    );
  }

  updateWalkSprite(delta: number) {
    if (this.stateMachine.is('dies')) {
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

  getDistanceToPlayer() {
    const diffX = this.actor.mesh.position.x - this.player.actor.mesh.position.x;
    const diffZ = this.actor.mesh.position.z - this.player.actor.mesh.position.z;
    return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffZ, 2));
  }

  checkIsPlayerInAttackDistance() {
    const distanceToPlayer = this.getDistanceToPlayer();
    return distanceToPlayer <= ENEMY.ATTACK_DISTANCE;
  }

  update(delta: number) {
    const currentState = this.stateMachine.state();
    this.updateMovement(delta, currentState);
    switch (currentState) {
      case 'died':
        break;
      case 'dies':
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
        this.stateMachine.doTransition('dead');
        break;
      case 'walkingAround':
        if (this.checkIsPlayerInAttackDistance()) {
          this.stateMachine.doTransition('attack');
          break;
        }
        break;
      case 'followingPlayer':
        if (this.checkIsPlayerInAttackDistance()) {
          this.stateMachine.doTransition('attack');
          break;
        }
        break;
      case 'attacking':
        if (!this.checkIsPlayerInAttackDistance()) {
          this.actor.spriteSheet.displaySprite(1);
          this.stateMachine.doTransition('followPlayer');
          break;
        }
        this.shootTimeOut += delta;
        if (this.shootTimeOut > ENEMY.SHOOT_TIME_OUT) {
          this.shoot();
          this.shootTimeOut = 0;
        }
        break;
      case 'hurting':
        this.backupVelocity.copy(this.velocity);
        this.velocity.set(0, 0, 0);
        this.actor.spriteSheet.displaySprite(2);
        this.stateMachine.doTransition('hurts');
        break;
      case 'hurted':
        this.hurtTimeOut += delta;
        if (this.hurtTimeOut > ENEMY.HURT_TIME_OUT) {
          this.velocity.copy(this.backupVelocity);
          this.hurtTimeOut = 0;
          this.actor.spriteSheet.displaySprite(0);
          this.stateMachine.doTransition('attack');
        }
        break;
      default:
        break;
    }
  }

  updateMovement(delta: number, state: string) {
    if (
      (state === 'dies') ||
      (state === 'died')
    ) {
      return;
    }
    this.randomMovementTimeOut += delta;
    if (this.randomMovementTimeOut > ENEMY.MOVEMENT_TIME_OUT) {
      this.randomMovementTimeOut = 0;
      if (
        (state === 'followingPlayer') ||
        (state === 'attacking')
      ){
        this.moveToPlayer();
        this.randomStrafe();
      } else {
        this.randomMovement();
      }
    } else {
      this.updateWalkSprite(delta);
    }
  }
}

