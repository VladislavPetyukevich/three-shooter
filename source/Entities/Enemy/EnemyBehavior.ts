import { Vector2, Vector3, AudioListener, PositionalAudio, Raycaster, Audio } from 'three';
import { ENTITY_TYPE, ENEMY, PI_180 } from '@/constants';
import { Entity } from '@/core/Entities/Entity';
import { Behavior } from '@/core/Entities/Behavior';
import { Player } from '@/Entities/Player/Player';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { EnemyGunProps } from './Enemy';
import { EnemyActor } from './EnemyActor';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { Gun, GunFireType } from '@/Entities/Gun/Gun';
import { randomNumbers } from '@/RandomNumbers';
import { TimeoutsManager } from '@/TimeoutsManager';
import { EnemyGunBullet } from '../Gun/Inheritor/EnemyGunBullet';
import { AudioSlices } from '@/core/AudioSlices';
import { AudioSliceName } from '@/constantsAssets';

interface BehaviorProps {
  player: Player;
  velocity: Vector3;
  actor: EnemyActor;
  gunProps: EnemyGunProps;
  BulletClass: typeof Bullet;
  container: EntitiesContainer;
  audioListener: AudioListener;
  walkSpeed: number;
  bulletsPerShoot: number;
  onHitDamage?: { min: number; max: number; };
  hurtChance: number;
  delays: {
    shoot: number;
    gunpointStrafe: number,
    strafe: number,
    movement: number;
  };
  audioSlices: AudioSlices<AudioSliceName>;
}

type TimeoutNames =
  'shoot' |
  'hurt' |
  'movement' |
  'strafe' |
  'gunpointStrafe' |
  'bleed';

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
  bulletsPerShoot: number;
  currentBulletsToShoot: number;
  isHurt: boolean;
  hurtChance: number;
  timeoutsManager: TimeoutsManager<TimeoutNames>;
  isGunpointTriggered: boolean;
  isOnGunpointCurrent: boolean;
  audioSlices: AudioSlices<AudioSliceName>;
  spawnSound: PositionalAudio;
  hitSound: Audio;
  onHitDamage?: { min: number; max: number; };
  onDeathCallback?: () => void;
  onBleedCallback?: () => void;

  constructor(props: BehaviorProps) {
    this.player = props.player;
    this.velocity = props.velocity;
    this.backupVelocity = new Vector3();
    this.actor = props.actor;
    this.BulletClass = props.BulletClass;
    this.gunProps = props.gunProps;
    this.gun = new EnemyGunBullet({
      BulletClass: this.BulletClass,
      playerCamera: props.player.camera,
      audioListener: props.audioListener,
      container: props.container,
      holderMesh: this.actor.mesh,
      fireType: GunFireType.single,
      recoilTime: this.gunProps.recoilTime,
      audioSlices: props.audioSlices,
    });
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
    this.isHurt = false;
    this.hurtChance = props.hurtChance;
    this.isGunpointTriggered = false;
    this.isOnGunpointCurrent = false;
    const timeoutValues = {
      shoot: ENEMY.SHOOT_TIME_OUT,
      hurt: ENEMY.HURT_TIME_OUT,
      movement: props.delays.movement,
      strafe: props.delays.strafe,
      gunpointStrafe: props.delays.gunpointStrafe,
      bleed: ENEMY.BLEED_TIME_OUT,
    };
    this.timeoutsManager = new TimeoutsManager(timeoutValues);
    this.timeoutsManager.expireAllTimeOuts();
    this.audioSlices = props.audioSlices;
    this.spawnSound = new PositionalAudio(props.audioListener);
    this.audioSlices.loadSliceToAudio('spawn' ,this.spawnSound);
    this.actor.mesh.add(this.spawnSound);
    this.spawnSound.setRefDistance(2);
    this.hitSound = new Audio(props.audioListener);
    this.audioSlices.loadSliceToAudio('hit' ,this.hitSound);
    this.actor.mesh.add(this.hitSound);
    this.playSpawnSound();
    this.onHitDamage = props.onHitDamage;
  }

  playSpawnSound() {
    this.spawnSound.play();
  }

  playHitSound() {
    if (this.hitSound.isPlaying) {
      return;
    }
    this.hitSound.play();
  }

  shoot() {
    this.gun.shoot();
  }

  death() {
    if (this.onDeathCallback) {
      this.onDeathCallback();
    }
  }

  onHit() {
    this.playHitSound();
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

  checkIsFollowingEnemyInAttackDistance(min: number, max: number) {
    if (!this.followingEnemy) {
      return false;
    }
    const distanceToPlayer = this.getDistanceToEntity(this.followingEnemy);
    return (
      (distanceToPlayer > min) &&
      (distanceToPlayer < max)
    );
  }

  checkIsEnemyInParasiteAttackDistance(enemy: Entity) {
    const distanceToEnemy = this.getDistanceToEntity(enemy);
    return distanceToEnemy <= ENEMY.ATTACK_DISTANCE_PARASITE;
  }

  update(delta: number) {
    this.gun.update(delta);
    this.updateWalkSprite(delta);
    this.updateMovement(delta);
  }

  getDirectionToFollowingEntity() {
    if (!this.followingEnemy) {
      return;
    }
    if (this.followingEnemy.type === ENTITY_TYPE.PLAYER) {
      const directionToPlayer = new Vector3();
      this.actor.mesh.getWorldDirection(directionToPlayer);
      return directionToPlayer;
    } else {
      const directionToEntity =
        this.directionToPoint(
          new Vector2(
            this.followingEnemy.actor.mesh.position.x,
            this.followingEnemy.actor.mesh.position.z
          )
        );
      return directionToEntity;
    }
  }

  updateMovement(delta: number) {
    if (!this.followingEnemy) {
      return;
    }
    this.timeoutsManager.updateTimeOut('movement', delta);
    if (!this.timeoutsManager.checkIsTimeOutExpired('movement')) {
      return;
    }
    this.timeoutsManager.updateExpiredTimeOut('movement');
    if (this.followingPath.length !== 0) {
      this.updateFollowPath();
      return;
    }

    const directionToFollowingEntity = this.getDirectionToFollowingEntity();
    if (!directionToFollowingEntity) {
      return;
    }
    this.raycaster.set(
      this.actor.mesh.position,
      directionToFollowingEntity
    );
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
    this.timeoutsManager.updateExpiredTimeOut('movement');
    this.setFollowingEnemy(this.followingEnemy);
    return true;
  }

  strafe(delta: number) {
    this.timeoutsManager.updateTimeOut('strafe', delta);
    if (this.timeoutsManager.checkIsTimeOutExpired('strafe')) {
      this.randomStrafe(this.strafeAngleLow);
      this.timeoutsManager.updateExpiredTimeOut('strafe');
    }
    return true;
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
    this.timeoutsManager.updateExpiredTimeOut('gunpointStrafe');
    this.isGunpointTriggered = false;
    if (!this.isOnGunpointCurrent) {
      return true;
    }
    this.isOnGunpointCurrent = false;
    this.randomStrafe(this.strafeAngleHigh);
    return true;
  }
}

