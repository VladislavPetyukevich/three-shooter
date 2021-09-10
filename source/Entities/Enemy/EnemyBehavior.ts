import { Vector2, Vector3, AudioListener, PositionalAudio, Raycaster } from 'three';
import { ENEMY, GAME_SOUND_NAME, PI_180 } from '@/constants';
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

type TimeOuts =
  Record<
    'shoot' |
    'hurt' |
    'movement' |
    'strafe' |
    'gunpointStrafe'
  , number>;

export class EnemyBehavior implements Behavior {
  player: Player;
  velocity: Vector3;
  backupVelocity: Vector3;
  raycaster: Raycaster;
  followingPath: Vector2[];
  followingPoint?: Vector2;
  actor: EnemyActor;
  currentStrafeAngle: number;
  strafeAngleLow: number;
  strafeAngleHigh: number;
  bulletPositionOffset: number;
  container: EntitiesContainer;
  currentWalkSprite: number;
  currentTitleDisplayTime: number;
  shootSound: PositionalAudio;
  stateMachine: StateMachine;
  initialTimeOuts: TimeOuts;
  currentTimeOuts: TimeOuts;
  isGunpointTriggered: boolean;
  isOnGunpointCurrent: boolean;
  onDeathCallback?: Function;

  constructor(props: BehaviorProps) {
    this.player = props.player;
    this.velocity = props.velocity;
    this.backupVelocity = new Vector3();
    this.raycaster = new Raycaster();
    this.raycaster.far = 70;
    this.followingPath = [];
    this.actor = props.actor;
    this.currentWalkSprite = 0;
    this.currentTitleDisplayTime = 0;
    this.bulletPositionOffset = 1.5;
    this.container = props.container;
    this.currentStrafeAngle = 0;
    this.strafeAngleLow = 22.5; // (90 / 2) - (90 / 4)
    this.strafeAngleHigh = 88.8;
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
    this.initialTimeOuts = {
      shoot: ENEMY.SHOOT_TIME_OUT,
      hurt: ENEMY.HURT_TIME_OUT,
      movement: ENEMY.MOVEMENT_TIME_OUT,
      strafe: 1,
      gunpointStrafe: 0.5,
    };
    this.currentTimeOuts = {
      shoot: this.initialTimeOuts.shoot,
      hurt: this.initialTimeOuts.hurt,
      movement: this.initialTimeOuts.movement,
      strafe: this.initialTimeOuts.strafe,
      gunpointStrafe: this.initialTimeOuts.gunpointStrafe,
    };
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
    if (this.followingPath.length !== 0) {
      this.updateFollowPath();
    }
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
        this.updateTimeOut('shoot', delta);
        if (this.checkIsTimeOutExpired('shoot')) {
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
        this.updateTimeOut('hurt', delta);
        if (this.checkIsTimeOutExpired('hurt')) {
          this.velocity.copy(this.backupVelocity);
          this.actor.spriteSheet.displaySprite(0);
          this.stateMachine.doTransition('attack');
        }
        break;
      default:
        break;
    }
    this.updateExpiredTimeOuts();
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
    if (
      (state === 'dies') ||
      (state === 'died')
    ) {
      return;
    }
    this.updateWalkSprite(delta);
    this.updateTimeOut('movement', delta);
    if (this.checkIsTimeOutExpired('movement')) {
      if (
        (state === 'followingPlayer') ||
        (state === 'attacking')
      ) {
        this.moveToPlayer();
      }
    }
    this.updateTimeOut('strafe', delta);
    if (this.checkIsTimeOutExpired('strafe')) {
      if (
        (state === 'followingPlayer') ||
        (state === 'attacking')
      ) {
        this.randomStrafe(this.strafeAngleLow);
      }
    }
    this.updateGunpointReaction(delta);
  }

  updateGunpointReaction(delta: number) {
    if (!this.isGunpointTriggered) {
      return;
    }
    this.updateTimeOut('gunpointStrafe', delta);
    if (!this.checkIsTimeOutExpired('gunpointStrafe')) {
      return;
    }
    this.isGunpointTriggered = false;
    if (!this.isOnGunpointCurrent) {
      return;
    }
    this.isOnGunpointCurrent = false;
    this.randomStrafe(this.strafeAngleHigh);
  }

  updateTimeOut(name: keyof TimeOuts, delta: number) {
    this.currentTimeOuts[name] -= delta;
  }

  updateExpiredTimeOut(name: keyof TimeOuts) {
    if (this.currentTimeOuts[name] <= 0) {
      this.currentTimeOuts[name] = this.initialTimeOuts[name];
    }
  }

  updateExpiredTimeOuts() {
    for (let name in this.currentTimeOuts) {
      this.updateExpiredTimeOut(name as keyof TimeOuts);
    }
  }

  checkIsTimeOutExpired(name: keyof TimeOuts) {
    return this.currentTimeOuts[name] <= 0;
  }
}

