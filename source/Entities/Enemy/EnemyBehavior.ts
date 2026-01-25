import { Vector2, Vector3, AudioListener, PositionalAudio, Raycaster, Audio } from 'three';
import { ENEMY } from '@/constants';
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
  delays: {
    shoot: number;
    gunpointStrafe: number,
    strafe: number,
    movement: number;
  };
  audioSlices: AudioSlices<AudioSliceName>;
}

type TimeoutNames =
  'findPathToPlayer' |
  'shoot' |
  'hurt' |
  'movement' |
  'strafe' |
  'gunpointStrafe' |
  'thinkPause';

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
  actor: EnemyActor;
  container: EntitiesContainer;
  currentWalkSprite: number;
  currentTitleDisplayTime: number;
  walkSpeed: number;
  bulletsPerShoot: number;
  currentBulletsToShoot: number;
  isBusy: boolean;
  timeoutsManager: TimeoutsManager<TimeoutNames>;
  isGunpointTriggered: boolean;
  isOnGunpointCurrent: boolean;
  audioSlices: AudioSlices<AudioSliceName>;
  spawnSound: PositionalAudio;
  hitSound: Audio;
  inPlayerGunpoint: boolean;
  collidedPlayer: boolean;
  onHitDamage?: { min: number; max: number; };
  onDeathCallback?: () => void;

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
    this.walkSpeed = props.walkSpeed;
    this.bulletsPerShoot = props.bulletsPerShoot;
    this.currentBulletsToShoot = 0;
    this.isBusy = false;
    this.isGunpointTriggered = false;
    this.isOnGunpointCurrent = false;
    this.inPlayerGunpoint = false;
    this.collidedPlayer = false;
    const timeoutValues = {
      findPathToPlayer: ENEMY.FIND_PATH_TO_PLAYER_TIME_OUT,
      shoot: ENEMY.SHOOT_TIME_OUT,
      hurt: ENEMY.HURT_TIME_OUT,
      movement: props.delays.movement,
      strafe: props.delays.strafe,
      gunpointStrafe: props.delays.gunpointStrafe,
      thinkPause: ENEMY.THINK_PAUSE_TIME_OUT,
    };
    this.timeoutsManager = new TimeoutsManager(timeoutValues);
    this.timeoutsManager.expireAllTimeOuts();
    this.audioSlices = props.audioSlices;
    this.spawnSound = new PositionalAudio(props.audioListener);
    this.audioSlices.loadSliceToAudio('spawn', this.spawnSound);
    this.actor.mesh.add(this.spawnSound);
    this.spawnSound.setRefDistance(2);
    this.hitSound = new Audio(props.audioListener);
    this.audioSlices.loadSliceToAudio('hit', this.hitSound);
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

  onBusyStart() {
    this.isBusy = true;
    this.backupVelocity.copy(this.velocity);
    this.velocity.set(0, 0, 0);
  }

  onBusyEnd() {
    this.isBusy = false;
    this.velocity.copy(this.backupVelocity);
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

  findPathToPlayer() {
    const pathToPlayer = this.container.pathfinder.getPathBetweenEntities(
      this.actor.mesh.id,
      this.player.mesh.id
    );
    if (pathToPlayer) {
      this.followingPath = pathToPlayer;
      this.setNextFollowPathPoint();
      this.moveFollowPath();
    } else {
      this.followingPath = [];
      this.followingPoint = undefined;
      this.randomMovement();
    }
  }

  velocityToPlayer() {
    this.velocity.set(
      Math.sin(this.actor.meshInner.rotation.y) * this.walkSpeed,
      0,
      Math.cos(this.actor.meshInner.rotation.y) * this.walkSpeed
    );
  }

  getDistanceToPlayer() {
    return this.getDistanceToEntity(this.player);
  }

  getDistanceToEntity(entity: Entity) {
    const diffX = this.actor.mesh.position.x - entity.mesh.position.x;
    const diffZ = this.actor.mesh.position.z - entity.mesh.position.z;
    return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffZ, 2));
  }

  update(delta: number) {
    this.gun.update(delta);
    this.updateWalkSprite(delta);
  }

  updateWalkSprite(delta: number) {
    if (this.isBusy) {
      return;
    }
    this.currentTitleDisplayTime += delta;
    if (this.currentTitleDisplayTime < 0.6) {
      return;
    }
    this.currentWalkSprite = (this.currentWalkSprite + 1) % 2;
    this.actor.spriteSheet.displaySprite(this.currentWalkSprite);
    this.currentTitleDisplayTime = 0;
  }

  setNextFollowPathPoint() {
    this.followingPoint = this.followingPath.shift();
  }

  moveFollowPath() {
    if (!this.followingPoint) {
      return;
    }
    const diffX = Math.abs(this.actor.mesh.position.x - this.followingPoint.x);
    const diffY = Math.abs(this.actor.mesh.position.z - this.followingPoint.y);
    if (
      (diffX < 1) &&
      (diffY < 1)
    ) {
      this.setNextFollowPathPoint();
      this.moveFollowPath();
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

  updateGun() {
    this.gun.setRotationY(this.actor.meshInner.rotation.y);
    this.gun.setPosition(this.actor.mesh.position);
  }
}
