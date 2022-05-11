import { Vector2, Vector3, AudioListener, PositionalAudio, Raycaster } from 'three';
import { ENTITY_TYPE, ENTITY_MESSAGES, ENEMY, GAME_SOUND_NAME, PI_180 } from '@/constants';
import { Entity } from '@/core/Entities/Entity';
import { Behavior } from '@/core/Entities/Behavior';
import { Player } from '@/Entities/Player/Player';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { EnemyBehaviorModifier } from './Enemy';
import { EnemyActor } from './EnemyActor';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { Gun } from '@/Entities/Gun/Gun';
import { audioStore } from '@/core/loaders';
import { StateMachine } from '@/StateMachine';
import { randomNumbers } from '@/RandomNumbers';
import { TimeoutsManager } from '@/TimeoutsManager';

interface BehaviorProps {
  player: Player;
  velocity: Vector3;
  actor: EnemyActor;
  BulletClass: typeof Bullet;
  container: EntitiesContainer;
  audioListener: AudioListener;
  behaviorModifier?: EnemyBehaviorModifier;
  walkSpeed: number;
  bulletsPerShoot: { min: number; max: number; };
  onHitDamage: number;
  delays: {
    shoot: number;
    gunpointStrafe: number,
    strafe: number,
  };
}

type TimeoutNames =
  'shoot' |
  'hurt' |
  'movement' |
  'strafe' |
  'gunpointStrafe' |
  'shootDelay';

export class EnemyBehavior implements Behavior {
  player: Player;
  velocity: Vector3;
  backupVelocity: Vector3;
  gun: Gun;
  BulletClass: typeof Bullet;
  raycaster: Raycaster;
  followingPath: Vector2[];
  followingPoint?: Vector2;
  followingEnemy?: Entity;
  actor: EnemyActor;
  currentStrafeAngle: number;
  strafeAngleLow: number;
  strafeAngleHigh: number;
  container: EntitiesContainer;
  currentWalkSprite: number;
  currentTitleDisplayTime: number;
  walkSpeed: number;
  bulletsPerShoot: { min: number; max: number; };
  currentBulletsToShoot: number;
  shootSound: PositionalAudio;
  stateMachine: StateMachine;
  isHurt: boolean;
  timeoutsManager: TimeoutsManager<TimeoutNames>;
  isGunpointTriggered: boolean;
  isOnGunpointCurrent: boolean;
  isKamikaze: boolean;
  isParasite: boolean;
  onHitDamage: number;
  onDeathCallback?: Function;

  constructor(props: BehaviorProps) {
    this.player = props.player;
    this.velocity = props.velocity;
    this.backupVelocity = new Vector3();
    this.actor = props.actor;
    this.gun = new Gun({
      playerCamera: props.player.camera,
      audioListener: props.audioListener,
      container: props.container,
      shootOffsetAngle: 5,
      shootOffsetInMoveAngle: 5,
      bulletsPerShoot: 1,
      recoilTime: 0,
      fireType: 'single',
      holderGeometry: this.actor.mesh.geometry,
    });
    this.BulletClass = props.BulletClass;
    this.raycaster = new Raycaster();
    this.raycaster.far = 70;
    this.followingPath = [];
    this.currentWalkSprite = 0;
    this.currentTitleDisplayTime = 0;
    this.container = props.container;
    this.currentStrafeAngle = 0;
    this.strafeAngleLow = 22.5; // (90 / 2) - (90 / 4)
    this.strafeAngleHigh = 88.8;
    this.walkSpeed = props.walkSpeed;
    this.bulletsPerShoot = props.bulletsPerShoot;
    this.currentBulletsToShoot = 0;
    this.shootSound = new PositionalAudio(props.audioListener);
    const shootSoundBuffer = audioStore.getSound(GAME_SOUND_NAME.gunShoot);
    this.shootSound.setBuffer(shootSoundBuffer);
    this.actor.mesh.add(this.shootSound);
    this.isKamikaze = props.behaviorModifier === EnemyBehaviorModifier.kamikaze;
    this.isParasite = props.behaviorModifier === EnemyBehaviorModifier.parasite;
    this.stateMachine = new StateMachine({
      initialState: this.isParasite ?
        'searchingEnemy' :
        'followingPlayer',
      transitions: [
        { name: 'attack', from: ['followingPlayer', 'hurted'], to: 'attacking' },
        { name: 'hurt', from: ['followingPlayer', 'attacking'], to: 'hurting' },
        { name: 'hurts', from: 'hurting', to: 'hurted' },
        { name: 'death', from: ['followingPlayer', 'attacking', 'hurting', 'hurted', 'followingEnemy', 'searchingEnemy'], to: 'dies' },
        { name: 'dead', from: 'dies', to: 'died' },
        { name: 'followPlayer', from: ['attacking', 'followingEnemy', 'searchingEnemy'], to: 'followingPlayer' },
        { name: 'searchEnemy', from: 'followingEnemy', to: 'searchingEnemy' },
        { name: 'followEnemy', from: 'searchingEnemy', to: 'followingEnemy' }
      ]
    });
    this.isHurt = false;
    this.isGunpointTriggered = false;
    this.isOnGunpointCurrent = false;
    const timeoutValues = {
      shoot: ENEMY.SHOOT_TIME_OUT,
      hurt: ENEMY.HURT_TIME_OUT,
      movement: (this.isKamikaze || this.isParasite) ? ENEMY.KAMIKAZE_MOVEMENT_TIME_OUT : ENEMY.MOVEMENT_TIME_OUT,
      strafe: props.delays.strafe,
      gunpointStrafe: props.delays.gunpointStrafe,
      shootDelay: props.delays.shoot,
    };
    this.timeoutsManager = new TimeoutsManager(timeoutValues);
    this.spawnSound(props.audioListener);
    this.onHitDamage = props.onHitDamage;
  }

  spawnSound(audioListener: AudioListener) {
    const spawnSound = new PositionalAudio(audioListener);
    const spawnSoundBuffer = audioStore.getSound(GAME_SOUND_NAME.spawn);
    spawnSound.setBuffer(spawnSoundBuffer);
    this.actor.mesh.add(spawnSound);
    spawnSound.setRefDistance(2);
    spawnSound.play();
  }

  createBullet() {
    this.gun.shootBullet(this.BulletClass);
  }

  shoot() {
    this.currentBulletsToShoot = randomNumbers.getRandomInRange(
      this.bulletsPerShoot.min,
      this.bulletsPerShoot.max
    );
  }

  hurt() {
    this.stateMachine.doTransition('hurt');
  }

  death() {
    this.stateMachine.doTransition('death');
  }

  onHit() {
    this.isHurt = true;
    this.backupVelocity.copy(this.velocity);
    this.velocity.set(0, 0, 0);
  }

  onHurtEnd() {
    this.isHurt = false;
    this.velocity.copy(this.backupVelocity);
  }

  randomMovement() {
    const velocityX = this.randomVelocityValue();
    const velocityZ = this.randomVelocityValue();
    const direction = new Vector3(velocityX, 0, velocityZ);
    this.velocity.copy(
      direction.normalize().multiplyScalar(this.walkSpeed)
    );
  }

  randomVelocityValue() {
    const randomVal = randomNumbers.getRandom();
    return (randomNumbers.getRandom() > 0.5) ? randomVal : -randomVal;
  }

  randomStrafe(angleDegrees: number) {
    const strafeAngle = this.randomStrafeRotation(angleDegrees) * PI_180;
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

  randomStrafeRotation(angleDegrees: number) {
    const randValue = randomNumbers.getRandom();
    if (randValue < 0.5) {
      return -angleDegrees;
    }
    return angleDegrees;
  }

  onCollide(entity: Entity) {
    entity.onHit(this.onHitDamage);
    // if (
    //   isCollideWithPlayer &&
    //   (this.isKamikaze || this.isParasite)
    // ) {
    //   this.onCollideKamikaze(entity);
    //   return;
    // }
    // const isCollideWithEnemy = entity.type === ENTITY_TYPE.ENEMY;
    // if (
    //   isCollideWithEnemy &&
    //   (this.isKamikaze || this.isParasite)
    // ) {
    //   this.onCollideEnemyParasite(entity);
    //   return;
    // }
    this.followingPath = [];
    this.followingPoint = undefined;
    this.velocity.negate();
  }

  onCollideKamikaze(entity: Entity) {
    const currentState = this.stateMachine.state();
    if (
      (currentState === 'dies') ||
      (currentState === 'died')
    ) {
      return;
    }
    entity.onHit(1);
    this.death();
  }

  onCollideEnemyParasite(entity: Entity) {
    this.death();
    entity.onMessage(ENTITY_MESSAGES.infestedByParasite);
  }

  onPlayerGunpoint() {
    if (this.isGunpointTriggered) {
      this.isOnGunpointCurrent = true;
    } else {
      this.isGunpointTriggered = true;
      this.isOnGunpointCurrent = false;
    }
  }

  findPathToEntity(entity: Entity) {
    if (this.followingPath.length) {
      return;
    }
    this.velocity.set(0, 0, 0);
    const pathToEntity = this.container.pathfinder.getPathBetweenEntities(
      this.actor.mesh.id,
      entity.actor.mesh.id
    );
    if (pathToEntity) {
      this.followingPath = pathToEntity;
    } else {
      this.followingPath = [];
      this.followingPoint = undefined;
      this.randomMovement();
    }
  }

  velocityToEntity(entity: Entity) {
    if (entity.type === ENTITY_TYPE.PLAYER) {
      this.velocity.set(
        Math.sin(this.actor.mesh.rotation.y) * this.walkSpeed,
        0,
        Math.cos(this.actor.mesh.rotation.y) * this.walkSpeed
      );
    } else {
      this.velocityToPoint(
        new Vector2(
          entity.actor.mesh.position.x,
          entity.actor.mesh.position.z
        )
      );
    }
  }

  moveToEntity(entity: Entity) {
    if (entity.type === ENTITY_TYPE.PLAYER) {
      const directionToPlayer = new Vector3();
      this.actor.mesh.getWorldDirection(directionToPlayer);
      this.raycaster.set(
        this.actor.mesh.position,
        directionToPlayer
      );
    } else {
      const directionToEntity =
        this.directionToPoint(
          new Vector2(
            entity.actor.mesh.position.x,
            entity.actor.mesh.position.z
          )
        );
      this.raycaster.set(
        this.actor.mesh.position,
        directionToEntity
      );
    }
    const intersectObjects = this.raycaster.intersectObjects(this.container.entitiesMeshes);
    const entityIndex = intersectObjects.findIndex(
      intersect => intersect.object.uuid === entity.actor.mesh.uuid
    );
    if (entityIndex === 0) {
      this.velocityToEntity(entity);
    } else {
      this.findPathToEntity(entity);
    }
  }

  findEnemy() {
    const entitiesInCantainer = this.container.entities;
    const enemies = entitiesInCantainer.filter(entity =>
      (entity.type === ENTITY_TYPE.ENEMY) &&
      (!(<EnemyBehavior>entity.behavior).isParasite)
    );
    if (enemies.length === 0) {
      this.stateMachine.doTransition('followPlayer');
      return;
    }
    const enemyIndex = randomNumbers.getRandomInRange(0, enemies.length - 1);
    const enemyTarget = enemies[enemyIndex];
    if (!enemyTarget) {
      return;
    }
    return enemyTarget;
  }

  updateWalkSprite(delta: number) {
    if (this.isHurt) {
      return;
    }
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

  getDistanceToEntity(entity: Entity) {
    const diffX = this.actor.mesh.position.x - entity.actor.mesh.position.x;
    const diffZ = this.actor.mesh.position.z - entity.actor.mesh.position.z;
    return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffZ, 2));
  }

  checkIsPlayerInAttackDistance() {
    const distanceToPlayer = this.getDistanceToEntity(this.player);
    return distanceToPlayer <= ENEMY.ATTACK_DISTANCE;
  }

  checkIsEnemyInParasiteAttackDistance(enemy: Entity) {
    const distanceToEnemy = this.getDistanceToEntity(enemy);
    return distanceToEnemy <= ENEMY.ATTACK_DISTANCE_PARASITE;
  }

  attackPlayer(delta: number) {
    this.timeoutsManager.updateTimeOut('shoot', delta);
    if (this.timeoutsManager.checkIsTimeOutExpired('shoot')) {
      this.shoot();
    }
    return true;
  }

  update(delta: number) {
    this.gun.setRotationY(this.actor.mesh.rotation.y);
    this.gun.setPosition(this.actor.mesh.position);
    this.gun.update(delta);
    this.updateWalkSprite(delta);
    this.updateShoot(delta);
    this.timeoutsManager.updateExpiredTimeOuts();
    // if (this.followingPath.length !== 0) {
    //   this.updateFollowPath();
    // }
    // const currentState = this.stateMachine.state();
    // if (
    //   (currentState !== 'dies') &&
    //   (currentState !== 'died')
    // ) {
    //   this.updateMovement(delta, currentState);
    //   this.updateShoot(delta);
    // }
    // switch (currentState) {
    //   case 'died':
    //     break;
    //   case 'dies':
    //     this.velocity.set(0, 0, 0);
    //     this.actor.spriteSheet.displaySprite(2);
    //     if (this.onDeathCallback) {
    //       this.onDeathCallback();
    //     }
    //     this.stateMachine.doTransition('dead');
    //     break;
    //   case 'followingEnemy':
    //     if (
    //       !this.followingEnemy ||
    //       !this.followingEnemy.hp
    //     ) {
    //       this.stateMachine.doTransition('searchEnemy');
    //       break;
    //     }
    //     if (this.checkIsEnemyInParasiteAttackDistance(this.followingEnemy)) {
    //       this.onCollide(this.followingEnemy);
    //     }
    //     break;
    //   case 'searchingEnemy':
    //     const enemyTarget = this.findEnemy();
    //     if (!enemyTarget) {
    //       break;
    //     }
    //     this.followingEnemy = enemyTarget;
    //     this.stateMachine.doTransition('followEnemy');
    //     break;
    //   case 'followingPlayer':
    //     if (this.isParasite || this.isKamikaze) {
    //       break;
    //     }
    //     if (this.checkIsPlayerInAttackDistance()) {
    //       this.stateMachine.doTransition('attack');
    //       break;
    //     }
    //     break;
    //   case 'attacking':
    //     if (this.isKamikaze) {
    //       this.stateMachine.doTransition('followPlayer');
    //       break;
    //     }
    //     if (!this.checkIsPlayerInAttackDistance()) {
    //       this.actor.spriteSheet.displaySprite(1);
    //       this.stateMachine.doTransition('followPlayer');
    //       break;
    //     }
    //     this.timeoutsManager.updateTimeOut('shoot', delta);
    //     if (this.timeoutsManager.checkIsTimeOutExpired('shoot')) {
    //       this.shoot();
    //     }
    //     break;
    //   case 'hurting':
    //     this.backupVelocity.copy(this.velocity);
    //     this.velocity.set(0, 0, 0);
    //     this.actor.spriteSheet.displaySprite(2);
    //     this.stateMachine.doTransition('hurts');
    //     break;
    //   case 'hurted':
    //     this.timeoutsManager.updateTimeOut('hurt', delta);
    //     if (this.timeoutsManager.checkIsTimeOutExpired('hurt')) {
    //       this.velocity.copy(this.backupVelocity);
    //       this.actor.spriteSheet.displaySprite(0);
    //       this.stateMachine.doTransition('attack');
    //     }
    //     break;
    //   default:
    //     break;
    // }
    // this.timeoutsManager.updateExpiredTimeOuts();
  }

  updateFollowPoint() {
    this.followingPoint = this.followingPath.shift();
  }

  updateFollowPath() {
    if (!this.followingPoint) {
      this.updateFollowPoint();
      return;
    }
    const diffX = Math.abs(this.actor.mesh.position.x - this.followingPoint.x);
    const diffY = Math.abs(this.actor.mesh.position.z - this.followingPoint.y);
    if (
      (diffX < 1) &&
      (diffY < 1)
    ) {
      this.updateFollowPoint();
      return;
    }
    this.velocityToPoint(this.followingPoint);
  }

  velocityToPoint(point: Vector2) {
    const direction = this.directionToPoint(point);
    this.velocity.copy(direction.multiplyScalar(this.walkSpeed));
  }

  directionToPoint(point: Vector2) {
    const direction = new Vector3(
      point.x - this.actor.mesh.position.x,
      0,
      point.y - this.actor.mesh.position.z,
    ).normalize();
    return direction;
  }

  followPlayer(delta: number) {
    this.timeoutsManager.updateTimeOut('movement', delta);
    if (!this.timeoutsManager.checkIsTimeOutExpired('movement')) {
      return true;
    }
    this.moveToEntity(this.player);
    return true;
  }

  strafe(delta: number) {
    this.timeoutsManager.updateTimeOut('strafe', delta);
    if (this.timeoutsManager.checkIsTimeOutExpired('strafe')) {
      this.randomStrafe(this.strafeAngleLow);
    }
    return true;
  }

  updateMovement(delta: number, state: string) {
    this.updateWalkSprite(delta);
    this.timeoutsManager.updateTimeOut('movement', delta);
    if (this.timeoutsManager.checkIsTimeOutExpired('movement')) {
      if (
        (state === 'followingPlayer') ||
        (state === 'attacking')
      ) {
        this.moveToEntity(this.player);
      }
      if (
        (state === 'followingEnemy') &&
        (this.followingEnemy)
      ) {
        this.moveToEntity(this.followingEnemy);
      }
    }
    if (this.isKamikaze || this.isParasite) {
      return;
    }
    this.timeoutsManager.updateTimeOut('strafe', delta);
    if (this.timeoutsManager.checkIsTimeOutExpired('strafe')) {
      if (
        (state === 'followingPlayer') ||
        (state === 'attacking')
      ) {
        this.randomStrafe(this.strafeAngleLow);
      }
    }
    this.updateGunpointReaction(delta);
  }

  updateShoot(delta: number) {
    if (this.isHurt) {
      return;
    }
    if (this.currentBulletsToShoot === 0) {
      return;
    }
    this.timeoutsManager.updateTimeOut('shootDelay', delta);
    if (this.timeoutsManager.checkIsTimeOutExpired('shootDelay')) {
      this.currentBulletsToShoot--;
      this.createBullet();
    }
  }

  updateGunpointReaction(delta: number) {
    if (!this.isGunpointTriggered) {
      return true;
    }
    this.timeoutsManager.updateTimeOut('gunpointStrafe', delta);
    if (!this.timeoutsManager.checkIsTimeOutExpired('gunpointStrafe')) {
      return true;
    }
    this.isGunpointTriggered = false;
    if (!this.isOnGunpointCurrent) {
      return true;
    }
    this.isOnGunpointCurrent = false;
    this.randomStrafe(this.strafeAngleHigh);
    return true;
  }

  updateHurt() {
    if (!this.isHurt) {
      return true;
    }
    return false;
  }
}

