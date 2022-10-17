import { Vector2, Vector3, AudioListener, PositionalAudio, Raycaster } from 'three';
import { ENTITY_TYPE, ENEMY, GAME_SOUND_NAME, PI_180 } from '@/constants';
import { Entity } from '@/core/Entities/Entity';
import { Behavior } from '@/core/Entities/Behavior';
import { Player } from '@/Entities/Player/Player';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { EnemyBehaviorModifier, EnemyGunProps } from './Enemy';
import { EnemyActor } from './EnemyActor';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { Gun, GunFireType } from '@/Entities/Gun/Gun';
import { audioStore } from '@/core/loaders';
import { randomNumbers } from '@/RandomNumbers';
import { TimeoutsManager } from '@/TimeoutsManager';

interface BehaviorProps {
  player: Player;
  velocity: Vector3;
  actor: EnemyActor;
  gunProps: EnemyGunProps;
  BulletClass: typeof Bullet;
  container: EntitiesContainer;
  audioListener: AudioListener;
  behaviorModifier?: EnemyBehaviorModifier;
  walkSpeed: number;
  bulletsPerShoot: { min: number; max: number; };
  onHitDamage: number;
  hurtChance: number;
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
  'shootDelay' |
  'gunTriggerPulled';

export class EnemyBehavior implements Behavior {
  player: Player;
  velocity: Vector3;
  backupVelocity: Vector3;
  gun: Gun;
  gunProps: EnemyGunProps;
  BulletClass: typeof Bullet;
  raycaster: Raycaster;
  followingPath: Vector2[];
  followingPoint?: Vector2;
  followingEnemy?: Entity;
  collidedEntity?: Entity;
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
  isHurt: boolean;
  hurtChance: number;
  timeoutsManager: TimeoutsManager<TimeoutNames>;
  isGunpointTriggered: boolean;
  isOnGunpointCurrent: boolean;
  isKamikaze: boolean;
  isParasite: boolean;
  onHitDamage: number;
  onDeathCallback?: Function;

  constructor(props: BehaviorProps) {
    this.player = props.player;
    this.setFollowingEnemy(this.player);
    this.velocity = props.velocity;
    this.backupVelocity = new Vector3();
    this.actor = props.actor;
    this.gunProps = props.gunProps;
    this.gun = new Gun({
      playerCamera: props.player.camera,
      audioListener: props.audioListener,
      container: props.container,
      shootOffsetAngle: 5,
      shootOffsetInMoveAngle: 5,
      bulletsPerShoot: 1,
      recoilTime: props.gunProps.recoilTime,
      fireType: props.gunProps.fireType,
      holderMesh: this.actor.mesh,
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
    this.isHurt = false;
    this.hurtChance = props.hurtChance;
    this.isGunpointTriggered = false;
    this.isOnGunpointCurrent = false;
    const timeoutValues = {
      shoot: ENEMY.SHOOT_TIME_OUT,
      hurt: ENEMY.HURT_TIME_OUT,
      movement: (this.isKamikaze || this.isParasite) ? ENEMY.KAMIKAZE_MOVEMENT_TIME_OUT : ENEMY.MOVEMENT_TIME_OUT,
      strafe: props.delays.strafe,
      gunpointStrafe: props.delays.gunpointStrafe,
      shootDelay: props.delays.shoot,
      gunTriggerPulled: ENEMY.SHOOT_TRIGGER_PULLED,
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
    if (this.gunProps.isRaycast) {
      this.gun.shootRaycast();
    } else {
      this.gun.shootBullet(this.BulletClass);
    }
  }

  shoot() {
    this.currentBulletsToShoot = randomNumbers.getRandomInRange(
      this.bulletsPerShoot.min,
      this.bulletsPerShoot.max
    );
  }

  death() {
    if (this.onDeathCallback) {
      this.onDeathCallback();
    }
  }

  onHit() {
    if (randomNumbers.getRandom() > this.hurtChance) {
      return;
    }
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

  updateColidedEntity(entity?: Entity) {
    this.collidedEntity = entity;
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
      entity.mesh.id
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
          entity.mesh.position.x,
          entity.mesh.position.z
        )
      );
    }
  }

  setFollowingEnemy(entity: Entity) {
    this.followingEnemy = entity;
    this.followingPath = [];
    this.followingPoint = undefined;
  }

  findEnemy() {
    const entitiesInCantainer = this.container.entities;
    const enemies = entitiesInCantainer.filter(entity =>
      (entity.type === ENTITY_TYPE.ENEMY) &&
      (!(<EnemyBehavior>entity.behavior).isParasite)
    );
    if (enemies.length === 0) {
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
    this.currentTitleDisplayTime += delta;
    if (this.currentTitleDisplayTime < 0.6) {
      return;
    }
    this.currentWalkSprite = this.currentWalkSprite ? 0 : 1;
    this.actor.spriteSheet.displaySprite(this.currentWalkSprite);
    this.currentTitleDisplayTime = 0;
  }

  getDistanceToEntity(entity: Entity) {
    const diffX = this.actor.mesh.position.x - entity.mesh.position.x;
    const diffZ = this.actor.mesh.position.z - entity.mesh.position.z;
    return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffZ, 2));
  }

  checkIsFollowingEnemyInAttackDistance() {
    if (!this.followingEnemy) {
      return false;
    }
    const distanceToPlayer = this.getDistanceToEntity(this.followingEnemy);
    return distanceToPlayer <= ENEMY.ATTACK_DISTANCE;
  }

  checkIsEnemyInParasiteAttackDistance(enemy: Entity) {
    const distanceToEnemy = this.getDistanceToEntity(enemy);
    return distanceToEnemy <= ENEMY.ATTACK_DISTANCE_PARASITE;
  }

  attackFollowingEnemy(delta: number) {
    this.timeoutsManager.updateTimeOut('shoot', delta);
    if (this.timeoutsManager.checkIsTimeOutExpired('shoot')) {
      this.shoot();
    }
    return true;
  }

  update(delta: number) {
    this.gun.update(delta);
    this.updateWalkSprite(delta);
    this.updateMovement(delta);
    this.updateShoot(delta);
    this.timeoutsManager.updateExpiredTimeOuts();
  }

  updateMovement(delta: number) {
    if (!this.followingEnemy) {
      return;
    }
    this.timeoutsManager.updateTimeOut('movement', delta);
    if (!this.timeoutsManager.checkIsTimeOutExpired('movement')) {
      return;
    }
    if (this.followingPath.length !== 0) {
      this.updateFollowPath();
      return;
    }

    if (this.followingEnemy.type === ENTITY_TYPE.PLAYER) {
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
            this.followingEnemy.actor.mesh.position.x,
            this.followingEnemy.actor.mesh.position.z
          )
        );
      this.raycaster.set(
        this.actor.mesh.position,
        directionToEntity
      );
    }
    const intersectObjects = this.raycaster.intersectObjects(this.container.entitiesMeshes);
    const entityIndex = intersectObjects.findIndex(intersect => 
      this.followingEnemy &&
      intersect.object.uuid === this.followingEnemy.mesh.uuid
    );
    if (entityIndex === 0) {
      this.velocityToEntity(this.followingEnemy);
    } else {
      this.findPathToEntity(this.followingEnemy);
    }
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

  followFollowingEnemy(delta: number) {
    if (!this.followingEnemy) {
      return true;
    }
    this.timeoutsManager.updateTimeOut('movement', delta);
    if (!this.timeoutsManager.checkIsTimeOutExpired('movement')) {
      return true;
    }
    this.setFollowingEnemy(this.followingEnemy);
    return true;
  }

  strafe(delta: number) {
    this.timeoutsManager.updateTimeOut('strafe', delta);
    if (this.timeoutsManager.checkIsTimeOutExpired('strafe')) {
      this.randomStrafe(this.strafeAngleLow);
    }
    return true;
  }

  updateShoot(delta: number) {
    if (this.gun.behavior.fireType === GunFireType.automatic) {
      this.updateAutomaticShoot(delta);
    }
    if (this.isHurt) {
      return;
    }
    if (this.currentBulletsToShoot === 0) {
      return;
    }
    this.timeoutsManager.updateTimeOut('shootDelay', delta);
    if (this.timeoutsManager.checkIsTimeOutExpired('shootDelay')) {
      this.currentBulletsToShoot--;
      this.updateGun();
      this.createBullet();
    }
  }

  updateAutomaticShoot(delta: number) {
    if (!this.gun.behavior.isTriggerPulled) {
      return;
    }
    this.timeoutsManager.updateTimeOut('gunTriggerPulled', delta);
    if (this.timeoutsManager.checkIsTimeOutExpired('gunTriggerPulled')) {
      this.gun.releaseTrigger();
    }
  }

  updateGun() {
    if (!this.followingEnemy) {
      return;
    }
    const followingEnemyMesh = this.followingEnemy.actor.mesh;
    if (this.followingEnemy.type === ENTITY_TYPE.PLAYER) {
      this.gun.setRotationY(this.actor.mesh.rotation.y);
    } else {
      this.gun.setRotationY(
        Math.atan2(
          (followingEnemyMesh.position.x - this.actor.mesh.position.x),
          (followingEnemyMesh.position.z - this.actor.mesh.position.z)
        )
      );
    }
    this.gun.setPosition(this.actor.mesh.position);
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

