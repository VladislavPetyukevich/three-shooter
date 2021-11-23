import { Vector2, Vector3, AudioListener, PositionalAudio, Raycaster } from 'three';
import { ENEMY, GAME_SOUND_NAME, PI_180 } from '@/constants';
import { Behavior } from '@/core/Entities/Behavior';
import { Player } from '@/Entities/Player/Player';
import { Bullet } from '@/Entities/Bullet/Bullet';
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
  bulletsPerShoot: { min: number; max: number; };
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
  actor: EnemyActor;
  currentStrafeAngle: number;
  strafeAngleLow: number;
  strafeAngleHigh: number;
  container: EntitiesContainer;
  currentWalkSprite: number;
  currentTitleDisplayTime: number;
  bulletsPerShoot: { min: number; max: number; };
  currentBulletsToShoot: number;
  shootSound: PositionalAudio;
  stateMachine: StateMachine;
  timeoutsManager: TimeoutsManager<TimeoutNames>;
  isGunpointTriggered: boolean;
  isOnGunpointCurrent: boolean;
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
    this.bulletsPerShoot = props.bulletsPerShoot;
    this.currentBulletsToShoot = 0;
    this.shootSound = new PositionalAudio(props.audioListener);
    const shootSoundBuffer = audioStore.getSound(GAME_SOUND_NAME.gunShoot);
    this.shootSound.setBuffer(shootSoundBuffer);
    this.actor.mesh.add(this.shootSound);
    this.stateMachine = new StateMachine({
      initialState: 'followingPlayer',
      transitions: [
        { name: 'attack', from: ['followingPlayer', 'hurted'], to: 'attacking' },
        { name: 'hurt', from: ['followingPlayer', 'attacking'], to: 'hurting' },
        { name: 'hurts', from: 'hurting', to: 'hurted' },
        { name: 'death', from: ['attacking', 'hurting', 'hurted'], to: 'dies' },
        { name: 'dead', from: 'dies', to: 'died' },
        { name: 'followPlayer', from: 'attacking', to: 'followingPlayer' }
      ]
    });
    this.isGunpointTriggered = false;
    this.isOnGunpointCurrent = false;
    const timeoutValues = {
      shoot: ENEMY.SHOOT_TIME_OUT,
      hurt: ENEMY.HURT_TIME_OUT,
      movement: ENEMY.MOVEMENT_TIME_OUT,
      strafe: props.delays.strafe,
      gunpointStrafe: props.delays.gunpointStrafe,
      shootDelay: props.delays.shoot,
    };
    this.timeoutsManager = new TimeoutsManager(timeoutValues);
    this.spawnSound(props.audioListener);
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

  onCollide() {
    this.followingPath = [];
    this.followingPoint = undefined;
    this.velocity.negate();
  }

  onPlayerGunpoint() {
    if (this.isGunpointTriggered) {
      this.isOnGunpointCurrent = true;
    } else {
      this.isGunpointTriggered = true;
      this.isOnGunpointCurrent = false;
    }
  }

  findPathToPlayer() {
    if (this.followingPath.length) {
      return;
    }
    this.velocity.set(0, 0, 0);
    const pathToPlayer = this.container.pathfinder.getPathBetweenEntities(
      this.actor.mesh.id,
      this.player.actor.mesh.id
    );
    if (pathToPlayer) {
      this.followingPath = pathToPlayer;
    } else {
      this.followingPath = [];
      this.followingPoint = undefined;
      this.randomMovement();
    }
  }

  velocityToPlayer() {
    this.velocity.set(
      Math.sin(this.actor.mesh.rotation.y) * ENEMY.WALK_SPEED,
      0,
      Math.cos(this.actor.mesh.rotation.y) * ENEMY.WALK_SPEED
    );
  }

  moveToPlayer() {
    const directionToPlayer = new Vector3();
    this.actor.mesh.getWorldDirection(directionToPlayer);
    this.raycaster.set(
      this.actor.mesh.position,
      directionToPlayer
    );
    const intersectObjects = this.raycaster.intersectObjects(this.container.entitiesMeshes);
    const playerIndex = intersectObjects.findIndex(
      intersect => intersect.object.uuid === this.player.actor.mesh.uuid
    );
    if (playerIndex === 0) {
      this.velocityToPlayer();
    } else {
      this.findPathToPlayer();
    }
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
    this.gun.setRotationY(this.actor.mesh.rotation.y);
    this.gun.setPosition(this.actor.mesh.position);
    this.gun.update(delta);
    if (this.followingPath.length !== 0) {
      this.updateFollowPath();
    }
    const currentState = this.stateMachine.state();
    if (
      (currentState !== 'dies') &&
      (currentState !== 'died')
    ) {
      this.updateMovement(delta, currentState);
      this.updateShoot(delta);
    }
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
        this.timeoutsManager.updateTimeOut('shoot', delta);
        if (this.timeoutsManager.checkIsTimeOutExpired('shoot')) {
          this.shoot();
        }
        break;
      case 'hurting':
        this.backupVelocity.copy(this.velocity);
        this.velocity.set(0, 0, 0);
        this.actor.spriteSheet.displaySprite(2);
        this.stateMachine.doTransition('hurts');
        break;
      case 'hurted':
        this.timeoutsManager.updateTimeOut('hurt', delta);
        if (this.timeoutsManager.checkIsTimeOutExpired('hurt')) {
          this.velocity.copy(this.backupVelocity);
          this.actor.spriteSheet.displaySprite(0);
          this.stateMachine.doTransition('attack');
        }
        break;
      default:
        break;
    }
    this.timeoutsManager.updateExpiredTimeOuts();
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
    const direction = new Vector3(
      this.followingPoint.x - this.actor.mesh.position.x,
      0,
      this.followingPoint.y - this.actor.mesh.position.z,
    ).normalize().multiplyScalar(ENEMY.WALK_SPEED);
    this.velocity.copy(direction);
  }

  updateMovement(delta: number, state: string) {
    this.updateWalkSprite(delta);
    this.timeoutsManager.updateTimeOut('movement', delta);
    if (this.timeoutsManager.checkIsTimeOutExpired('movement')) {
      if (
        (state === 'followingPlayer') ||
        (state === 'attacking')
      ) {
        this.moveToPlayer();
      }
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
      return;
    }
    this.timeoutsManager.updateTimeOut('gunpointStrafe', delta);
    if (!this.timeoutsManager.checkIsTimeOutExpired('gunpointStrafe')) {
      return;
    }
    this.isGunpointTriggered = false;
    if (!this.isOnGunpointCurrent) {
      return;
    }
    this.isOnGunpointCurrent = false;
    this.randomStrafe(this.strafeAngleHigh);
  }
}

