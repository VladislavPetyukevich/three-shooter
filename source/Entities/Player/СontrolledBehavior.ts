import {
  Camera,
  Vector2,
  Vector3,
  Audio,
  AudioListener,
  Raycaster,
  PointLight
} from 'three';
import { PlayerActor } from './PlayerActor';
import { Behavior } from '@/core/Entities/Behavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { keyboard } from '@/Keyboard';
import {
  PI_2,
  KEYBOARD_KEY,
  PLAYER,
  PI_180,
  ENTITY_TYPE,
  ENTITY_MESSAGES,
  GAME_SOUND_NAME
} from '@/constants';
import { Gun } from '@/Entities/Gun/Gun';
import { Boomerang } from '@/Entities/Boomerang/Boomerang';
import { hud } from '@/HUD/HUD';
import { audioStore } from '@/core/loaders';
import { globalSettings } from '@/GlobalSettings';

interface СontrolledBehaviorProps {
  actor: PlayerActor;
  camera: Camera;
  eyeY: number;
  walkSpeed: number;
  cameraSpeed: number;
  container: EntitiesContainer;
  velocity: Vector3;
  audioListener: AudioListener;
}

export class СontrolledBehavior implements Behavior {
  actor: PlayerActor;
  camera: Camera;
  raycaster: Raycaster;
  isRunning: boolean;
  isKeyOnward: boolean;
  isKeyForward: boolean;
  isKeyLeft: boolean;
  isKeyRight: boolean;
  isCanMove: boolean;
  strafeCameraRotation: number;
  strafeCameraSpeed: number;
  cameraRotationInput: Vector2;
  eyeY: number;
  walkSpeed: number;
  cameraSpeed: number;
  container: EntitiesContainer;
  moveDirection: Vector3;
  targetVelocity: Vector3;
  velocity: Vector3;
  damageSound: Audio;
  gun: Gun;
  gunBoomerang: Gun;
  gunShootLight: PointLight;
  mouseSensitivity: number;
  sinTable: number[];
  currentSinTableIndex: number;
  bobTimeout: number;
  maxBobTimeout: number;
  cameraRecoil: number;
  isCameraRecoil: boolean;
  checkGunPointTimeout: number;
  checkGunPointTimeoutCurrent: number;

  constructor(props: СontrolledBehaviorProps) {
    this.mouseSensitivity = globalSettings.getSetting('mouseSensitivity');
    this.sinTable = this.generateSinTable(1, 0.06);
    this.currentSinTableIndex = 0;
    this.checkGunPointTimeout = 0.1;
    this.checkGunPointTimeoutCurrent = this.checkGunPointTimeout;
    this.bobTimeout = 0;
    this.maxBobTimeout = 0.001;
    this.cameraRecoil= 0.035;
    this.isCameraRecoil= false;
    globalSettings.addUpdateListener(this.onUpdateGlobalSettings);
    this.actor = props.actor;
    this.eyeY = props.eyeY;
    this.camera = props.camera;
    this.camera.position.y = this.eyeY;
    this.raycaster = new Raycaster();
    this.raycaster.far = 70;
    this.walkSpeed = props.walkSpeed;
    this.cameraSpeed = props.cameraSpeed;
    this.isRunning = false;
    this.isKeyOnward = false;
    this.isKeyForward = false;
    this.isKeyLeft = false;
    this.isKeyRight = false;
    this.isCanMove = true;
    this.strafeCameraRotation = 1.3 * PI_180;
    this.strafeCameraSpeed = 10;
    this.cameraRotationInput = new Vector2();
    this.container = props.container;
    this.velocity = props.velocity;
    this.targetVelocity = new Vector3();
    this.moveDirection = new Vector3();
    this.damageSound = new Audio(props.audioListener);
    const damageSoundBuffer = audioStore.getSound(GAME_SOUND_NAME.damage);
    this.damageSound.setBuffer(damageSoundBuffer);
    this.damageSound.isPlaying = false;
    this.damageSound.setVolume(0.6);
    this.gun = new Gun({
      container: props.container,
      playerCamera: props.camera,
      audioListener: props.audioListener,
      shootOffsetAngle: 2.5,
      shootOffsetInMoveAngle: 4.5,
      bulletsPerShoot: 2,
      recoilTime: 0.2,
    });
    this.gunBoomerang = new Gun({
      container: props.container,
      playerCamera: props.camera,
      audioListener: props.audioListener,
      shootOffsetAngle: 2.5,
      shootOffsetInMoveAngle: 4.5,
      bulletsPerShoot: 1,
    });
    this.gunShootLight = new PointLight('white', 20, 100);
    this.gunShootLight.position.set(
      0,
      -50,
      0
    );
    this.container.scene.add(this.gunShootLight);

    document.addEventListener('mousemove', this.handleMouseMove, false);
    document.addEventListener('click', this.handleShoot, false);
  }

  onUpdateGlobalSettings = () => {
    this.mouseSensitivity = globalSettings.getSetting('mouseSensitivity');
  }

  generateSinTable(step: number, amplitude: number) {
    const toRadians = (degrees:number) => {
      return degrees * (Math.PI / 180);
    }
    const sinTable = [];
    for (let i = 0; i < 360; i+=step) {
      const sinValue = Math.sin(toRadians(i));
      sinTable.push(amplitude * sinValue);
    }
    return sinTable;
  }

  getNextSinValue() {
    if (this.currentSinTableIndex === this.sinTable.length - 1) {
      this.currentSinTableIndex = 0;
    } else {
      this.currentSinTableIndex++;
    }
    return this.sinTable[this.currentSinTableIndex];
  }

  handleMouseMove = (event: MouseEvent) => {
    // if (this.enabled === false) return;

    var movementX = event.movementX * this.mouseSensitivity;
    var movementY = event.movementY * this.mouseSensitivity;

    this.cameraRotationInput.set(
      this.cameraRotationInput.x += movementX,
      this.cameraRotationInput.y += movementY,
    );
  }

  onHit() {
    if (this.damageSound.isPlaying) {
      this.damageSound.stop();
    }
    this.damageSound.play();
  }

  onDeath() {
    this.damageSound.stop();
  }

  handleShoot = (event: MouseEvent) => {
    switch (event.button) {
      case 0:
        this.handleShootPrimary();
        break;
      case 2:
        this.handleShootSecondary();
        break;
      default:
        break;
    }
  };

  handleShootPrimary = () => {
    const direction = new Vector3();
    this.camera.getWorldDirection(direction);
    this.gun.shootRaycast(
      this.camera.position,
      direction
    );
    this.cameraRecoilJump();
    hud.gunFire();
  };

  handleShootSecondary = () => {
    const direction = new Vector3();
    this.camera.getWorldDirection(direction);
    const boomerang = new Boomerang({
      position: this.camera.position,
      direction: direction,
      container: this.container,
      playerActor: this.actor,
    });
    this.gunBoomerang.shootBullet(boomerang);
    this.gunBoomerang.setIsCanShoot(false);
  };

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
      const sinValue = this.getNextSinValue();
      this.camera.position.y = this.actor.mesh.position.y + sinValue;
    }
  }

  lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  lerpCameraRotationZ(targetRotation: number, speed: number) {
    this.camera.rotation.z = this.lerp(
      this.camera.rotation.z,
      targetRotation,
      speed
    );
  }

  update(delta: number) {
    this.gun.update(delta);
    this.gunBoomerang.update(delta);
    this.updateCamera();
    this.updateKeysState();
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
    if (this.cameraRotationInput.x) {
      this.camera.rotation.y -= this.cameraRotationInput.x;
    }
    this.cameraRotationInput.set(0, 0);
    this.camera.position.x = this.actor.mesh.position.x;
    this.camera.position.z = this.actor.mesh.position.z;
  }

  updateKeysState() {
    this.isKeyOnward = keyboard.key[KEYBOARD_KEY.W];
    this.isKeyForward = keyboard.key[KEYBOARD_KEY.S];
    this.isKeyLeft = keyboard.key[KEYBOARD_KEY.A];
    this.isKeyRight = keyboard.key[KEYBOARD_KEY.D];
    this.isRunning =
      this.isKeyOnward ||
      this.isKeyForward ||
      this.isKeyLeft ||
      this.isKeyRight;
  }

  updateVelocity(delta: number) {
    this.moveDirection.set(0, 0, 0);
    this.gun.setIsInMove(this.isRunning);
    if (!this.isRunning) {
      this.targetVelocity.set(0, 0, 0);
    } else {
      if (this.isKeyOnward) {
        this.isRunning = true;
        this.moveDirection.x -= Math.sin(this.camera.rotation.y);
        this.moveDirection.z -= Math.cos(this.camera.rotation.y);
      }
      if (this.isKeyForward) {
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
      this.moveDirection.normalize().multiplyScalar(this.walkSpeed * delta)
    );
    this.velocity.lerp(this.targetVelocity, delta * PLAYER.WALK_INERTIA);
  }

  updatePlayerBob(delta: number) {
    const isGunRecoil = this.gun.checkIsRecoil();
    if (this.isCameraRecoil && !isGunRecoil) {
      this.camera.position.y -= this.cameraRecoil;
      this.isCameraRecoil = false;
    }
    if (this.isRunning) {
      hud.gunBob(delta);
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
    const isGunRecoil = this.gun.checkIsRecoil();
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
}
