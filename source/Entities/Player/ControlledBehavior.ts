import {
  Camera,
  Vector3,
  Audio,
  AudioListener,
  Raycaster,
  PointLight,
} from 'three';
import { PlayerActor } from './PlayerActor';
import { Behavior } from '@/core/Entities/Behavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { playerActions, PlayerAction, PlayerActionListener, PlayerActionName } from '@/PlayerActions';
import {
  PI_2,
  PLAYER,
  PI_180,
  ENTITY_TYPE,
  ENTITY_MESSAGES,
} from '@/constants';
import { Gun } from '@/Entities/Gun/Gun';
import { SinTable } from '@/SinTable';
import { hud } from '@/HUD/HUD';
import { audioStore } from '@/core/loaders';

interface ControlledBehaviorProps {
  actor: PlayerActor;
  camera: Camera;
  eyeY: number;
  walkSpeed: number;
  cameraSpeed: number;
  container: EntitiesContainer;
  velocity: Vector3;
  audioListener: AudioListener;
}

export class ControlledBehavior implements Behavior {
  actor: PlayerActor;
  camera: Camera;
  raycaster: Raycaster;
  isRunning: boolean;
  isKeyForward: boolean;
  isKeyBackward: boolean;
  isKeyLeft: boolean;
  isKeyRight: boolean;
  isCanMove: boolean;
  strafeCameraRotation: number;
  strafeCameraSpeed: number;
  eyeY: number;
  walkSpeed: number;
  cameraSpeed: number;
  container: EntitiesContainer;
  moveDirection: Vector3;
  targetVelocity: Vector3;
  velocity: Vector3;
  damageSound: Audio;
  currentGunIndex: number;
  guns: Gun[];
  gunShootLight: PointLight;
  sinTable: SinTable;
  bobTimeout: number;
  maxBobTimeout: number;
  cameraRecoil: number;
  isCameraRecoil: boolean;
  checkGunPointTimeout: number;
  checkGunPointTimeoutCurrent: number;
  actions: { [key in PlayerActionName]: PlayerActionListener['listener'] };
  walkSound: Audio;

  constructor(props: ControlledBehaviorProps) {
    this.sinTable = new SinTable({
      step: 1,
      amplitude: 0.06,
    });
    this.checkGunPointTimeout = 0.1;
    this.checkGunPointTimeoutCurrent = this.checkGunPointTimeout;
    this.bobTimeout = 0;
    this.maxBobTimeout = 0.001;
    this.cameraRecoil= 0.035;
    this.isCameraRecoil= false;
    this.actor = props.actor;
    this.eyeY = props.eyeY;
    this.camera = props.camera;
    this.camera.position.y = this.eyeY;
    this.raycaster = new Raycaster();
    this.raycaster.far = 70;
    this.walkSpeed = props.walkSpeed;
    this.cameraSpeed = props.cameraSpeed;
    this.isRunning = false;
    this.isKeyForward = false;
    this.isKeyBackward = false;
    this.isKeyLeft = false;
    this.isKeyRight = false;
    this.isCanMove = true;
    this.strafeCameraRotation = 1.3 * PI_180;
    this.strafeCameraSpeed = 10;
    this.container = props.container;
    this.velocity = props.velocity;
    this.targetVelocity = new Vector3();
    this.moveDirection = new Vector3();
    this.damageSound = new Audio(props.audioListener);
    const damageSoundBuffer = audioStore.getSound('damage');
    this.damageSound.setBuffer(damageSoundBuffer);
    this.damageSound.isPlaying = false;
    this.damageSound.setVolume(0.6);
    this.walkSound = new Audio(props.audioListener);
    const walkSoundBuffer = audioStore.getSound('walk');
    this.walkSound.setBuffer(walkSoundBuffer);
    this.walkSound.isPlaying = false;
    this.walkSound.setVolume(0.2);
    this.guns = [];
    this.currentGunIndex = -1;
    this.updateHudGunTextures();
    this.gunShootLight = new PointLight('white', 20, 100);
    this.gunShootLight.position.set(
      0,
      -50,
      0
    );
    this.container.scene.add(this.gunShootLight);
    this.actions = {
      'walkForward': this.handleWalkForward,
      'walkBackward': this.handleWalkBackward,
      'walkLeft': this.handleWalkLeft,
      'walkRight': this.handleWalkRight,
      'weapon1': this.handleSwitchGunByIndex(0),
      'weapon2': this.handleSwitchGunByIndex(1),
      'weapon3': this.handleSwitchGunByIndex(2),
      'nextWeapon': this.handleWeaponNext,
      'prevWeapon': this.handleWeaponPrev,
      'firePrimary': this.handleFirePrimary,
    };
    Object.keys(this.actions).forEach(actionName =>
      playerActions.addActionListener(
        actionName as PlayerActionName,
        this.actions[actionName as PlayerActionName]
      )
    );
  }

  handleWalkForward = (action: PlayerAction) => {
    this.isKeyForward = !action.isEnded;
  }

  handleWalkBackward = (action: PlayerAction) => {
    this.isKeyBackward = !action.isEnded;
  }

  handleWalkLeft = (action: PlayerAction) => {
    this.isKeyLeft = !action.isEnded;
  }

  handleWalkRight = (action: PlayerAction) => {
    this.isKeyRight = !action.isEnded;
  }

  handleSwitchGunByIndex = (gunIndex: number) => (action: PlayerAction) => {
    if (action.isEnded) {
      return;
    }
    this.switchGun(gunIndex);
  }

  handleWeaponNext = (action: PlayerAction) => {
    if (action.isEnded) {
      return;
    }
    this.switchGun(
      this.circleClampGunIndex(this.currentGunIndex + 1)
    );
  }

  handleWeaponPrev = (action: PlayerAction) => {
    if (action.isEnded) {
      return;
    }
    this.switchGun(
      this.circleClampGunIndex(this.currentGunIndex - 1)
    );
  }

  handleFirePrimary = (action: PlayerAction) => {
    if (action.isEnded) {
      this.handleReleaseTrigger();
    } else {
      this.handlePullTrigger();
    }
  }

  onHit() {
    if (this.damageSound.isPlaying) {
      this.damageSound.stop();
    }
    this.damageSound.play();
  }

  onDeath() {
    this.damageSound.stop();
    this.walkSound.stop();
  }

  handlePullTrigger() {
    const direction = new Vector3();
    this.camera.getWorldDirection(direction);
    const currentGun = this.getCurrentGun();
    if (currentGun) {
      currentGun.shoot();
    }
    this.cameraRecoilJump();
    hud.gunFire();
  };

  handleReleaseTrigger() {
    const currentGun = this.getCurrentGun();
    if (currentGun) {
      currentGun.releaseTrigger();
    }
  };

  circleClampGunIndex(gunIndex: number) {
    if (gunIndex < 0) {
      return this.guns.length - 1;
    }
    if (gunIndex > this.guns.length - 1) {
      return 0;
    }
    return gunIndex;
  }

  switchGun(gunIndex: number) {
    if (this.currentGunIndex === gunIndex) {
      return;
    }
    if (!this.guns[gunIndex]) {
      return;
    }
    this.handleReleaseTrigger();
    this.currentGunIndex = gunIndex;
    this.updateHudGunTextures();
  }

  updateHudGunTextures() {
    const currentGun = this.getCurrentGun();
    if (!currentGun) {
      return;
    }
    const gunHudTextures = currentGun.getHudTextures();
    if (gunHudTextures) {
      hud.setGunTextures(gunHudTextures);
    }
  }

  addGun(gun: Gun) {
    const gunIndex = this.getGunIndex(gun);
    if (gunIndex === this.guns.length) {
      this.guns.push(gun);
    } else {
      this.guns.splice(gunIndex, 0, gun);
    }
    this.currentGunIndex = -1;
    this.switchGun(gunIndex);
  }

  getGunIndex(gun: Gun) {
    if (this.guns.length === 0) {
      return 0;
    }
    const newGunOrderIndex = gun.getOrderIndex();
    if (
      newGunOrderIndex > this.guns[this.guns.length -1].getOrderIndex()
    ) {
      return this.guns.length;
    }
    for (let i = 0; i < this.guns.length; i++) {
      const currGunOrderIndex = this.guns[i].getOrderIndex();
      if (newGunOrderIndex < currGunOrderIndex) {
        return i;
      }
    }
    return 0;
  }

  getCurrentGun() {
    return this.guns[this.currentGunIndex];
  }

  cameraRecoilJump() {
    if (this.isCameraRecoil) {
      return;
    }
    this.isCameraRecoil = true;
    this.camera.position.y += this.cameraRecoil;
  }

  updateBob(delta: number) {
    this.bobTimeout += delta;
    if (this.bobTimeout >= this.maxBobTimeout) {
      this.bobTimeout = 0;
      const sinValue = this.sinTable.getNextSinValue();
      this.camera.position.y = this.actor.mesh.position.y + sinValue;
    }
  }

  lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  lerpCameraRotationZ(targetRotation: number, speed: number) {
    if (speed >= 1) {
      return targetRotation;
    }
    this.camera.rotation.z = this.lerp(
      this.camera.rotation.z,
      targetRotation,
      speed
    );
  }

  update(delta: number) {
    const playerRotationY = this.camera.rotation.y + Math.PI;
    const currentGun = this.getCurrentGun();
    if (currentGun) {
      currentGun.setRotationY(playerRotationY);
      currentGun.setPosition(this.camera.position);
      currentGun.update(delta);
      this.updateGunHeatLevel(delta);
    }
    this.updateCamera();
    this.updateIsRunning();
    this.updateWalkSound(this.isRunning);
    if (this.isCanMove) {
      this.updateVelocity(delta);
      this.updateShootLight();
      this.updatePlayerBob(delta);
      this.updateCheckGunPoint(delta);
    } else {
      this.velocity.set(0, 0, 0);
    }
  }

  updateCamera() {
    const cameraMovement = playerActions.getCameraMovement();
    if (cameraMovement) {
      hud.addGunShiftX(cameraMovement);
      this.camera.rotation.y -= cameraMovement;
      playerActions.resetCameraMovement();
    }
    this.camera.position.x = this.actor.mesh.position.x;
    this.camera.position.z = this.actor.mesh.position.z;
  }

  updateIsRunning() {
    this.isRunning =
      this.isKeyForward ||
      this.isKeyBackward ||
      this.isKeyLeft ||
      this.isKeyRight;
  }

  updateVelocity(delta: number) {
    this.moveDirection.set(0, 0, 0);
    const currentGun = this.getCurrentGun();
    if (currentGun) {
      this.getCurrentGun().setIsInMove(this.isRunning);
    }
    if (!this.isRunning) {
      this.targetVelocity.set(0, 0, 0);
    } else {
      if (this.isKeyForward) {
        this.isRunning = true;
        this.moveDirection.x -= Math.sin(this.camera.rotation.y);
        this.moveDirection.z -= Math.cos(this.camera.rotation.y);
      }
      if (this.isKeyBackward) {
        this.isRunning = true;
        this.moveDirection.x += Math.sin(this.camera.rotation.y);
        this.moveDirection.z += Math.cos(this.camera.rotation.y);
      }
      if (this.isKeyLeft) {
        this.isRunning = true;
        this.moveDirection.x -= Math.sin(this.camera.rotation.y + PI_2);
        this.moveDirection.z -= Math.cos(this.camera.rotation.y + PI_2);
      }
      if (this.isKeyRight) {
        this.isRunning = true;
        this.moveDirection.x += Math.sin(this.camera.rotation.y + PI_2);
        this.moveDirection.z += Math.cos(this.camera.rotation.y + PI_2);
      }
    }
    this.targetVelocity.copy(
      this.moveDirection.normalize().multiplyScalar(this.walkSpeed)
    );
    this.velocity.lerp(this.targetVelocity, delta * PLAYER.WALK_INERTIA);
  }

  updatePlayerBob(delta: number) {
    const currentGun = this.getCurrentGun();
    const isGunRecoil = currentGun && currentGun.checkIsRecoil();
    if (this.isCameraRecoil && !isGunRecoil) {
      this.camera.position.y -= this.cameraRecoil;
      this.isCameraRecoil = false;
    }
    hud.setIsRunning(this.isRunning);
    if (this.isRunning) {
      if (this.isKeyLeft != this.isKeyRight) {
        this.lerpCameraRotationZ(
          this.isKeyLeft ? this.strafeCameraRotation : -this.strafeCameraRotation,
          delta * this.strafeCameraSpeed
        );
      } else {
        this.lerpCameraRotationZ(
          0,
          delta * this.strafeCameraSpeed
        );
      }
    } else {
      if (this.camera.rotation.z !== 0) {
        this.lerpCameraRotationZ(
          0,
          delta * this.strafeCameraSpeed
        );
      }
      if (!isGunRecoil) {
        this.updateBob(delta);
      }
    }
  }

  updateShootLight() {
    const currentGun = this.getCurrentGun();
    const isGunRecoil = currentGun && currentGun.checkIsRecoil();
    if (this.isCameraRecoil && !isGunRecoil) {
      this.gunShootLight.position.set(0, -50, 0);
      hud.gunIdle();
    } else if (this.isCameraRecoil) {
      this.gunShootLight.position.set(
        this.camera.position.x,
        this.camera.position.y,
        this.camera.position.z
      );
    }
  }

  updateCheckGunPoint(delta: number) {
    this.checkGunPointTimeoutCurrent -= delta;
    if (this.checkGunPointTimeoutCurrent > 0) {
      return;
    }
    this.checkGunPointTimeoutCurrent = this.checkGunPointTimeout;
    const direction = new Vector3();
    this.camera.getWorldDirection(direction);
    this.raycaster.set(this.camera.position, direction);
    const intersectObjects = this.raycaster.intersectObjects(this.container.entitiesMeshes);
    const firstIntersection = intersectObjects[0];
    if (!firstIntersection) {
      return;
    }
    const intersectedEntity =
      this.container.getEntityByMeshId(firstIntersection.object.id);
    if (!intersectedEntity) {
      return;
    }
    if (intersectedEntity.type === ENTITY_TYPE.ENEMY) {
      intersectedEntity.onMessage(ENTITY_MESSAGES.inPlayerGunpoint);
    }
  }

  updateWalkSound(isPlaying: boolean) {
    if (isPlaying && !this.walkSound.isPlaying) {
      this.walkSound.play();
    }
    if (!isPlaying && this.walkSound.isPlaying) {
      this.walkSound.stop();
    }
  }

  updateGunHeatLevel(delta: number) {
    const currentGun = this.getCurrentGun();
    if (!currentGun) {
      return;
    }
    currentGun.behavior.updateHeatLevel(delta);
    const heatLevel = currentGun.behavior.heatLevel;
    hud.updateGunHeatLevel(heatLevel);
  }

  onDestroy() {
    Object.keys(this.actions).forEach(actionName =>
      playerActions.removeActionListener(
        actionName as PlayerActionName,
        this.actions[actionName as PlayerActionName]
      )
    );
  }
}
