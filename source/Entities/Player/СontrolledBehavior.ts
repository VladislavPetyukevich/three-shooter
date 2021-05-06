import { Camera, Vector2, Vector3, AudioListener } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { Behavior } from '@/core/Entities/Behavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { keyboard } from '@/Keyboard';
import { PI_2, KEYBOARD_KEY, PLAYER, PI_180 } from '@/constants';
import { Gun } from '@/Entities/Gun/Gun';
import { GunBehavior } from '@/Entities/Gun/GunBehavior';
import { hud } from '@/HUD/HUD';
import { globalSettings } from '@/GlobalSettings';

interface СontrolledBehaviorProps {
  actor: Actor;
  camera: Camera;
  eyeY: number;
  walkSpeed: number;
  cameraSpeed: number;
  container: EntitiesContainer;
  velocity: Vector3;
  audioListener: AudioListener;
}

export class СontrolledBehavior implements Behavior {
  actor: Actor;
  camera: Camera;
  isRunning: boolean;
  strafeCameraRotation: number;
  strafeCameraSpeed: number;
  cameraRotationInput: Vector2;
  eyeY: number;
  walkSpeed: number;
  cameraSpeed: number;
  container: EntitiesContainer;
  targetVelocity: Vector3;
  velocity: Vector3;
  gun: Gun;
  mouseSensitivity: number;
  sinTable: number[];
  currentSinTableIndex: number;
  bobTimeout: number;
  maxBobTimeout: number;

  constructor(props: СontrolledBehaviorProps) {
    this.mouseSensitivity = globalSettings.getSetting('mouseSensitivity');
    this.sinTable = this.generateSinTable(1, 0.06);
    this.currentSinTableIndex = 0;
    this.bobTimeout = 0;
    this.maxBobTimeout = 0.001;
    globalSettings.addUpdateListener(this.onUpdateGlobalSettings);
    this.actor = props.actor;
    this.eyeY = props.eyeY;
    this.camera = props.camera;
    this.camera.position.y = this.eyeY;
    this.walkSpeed = props.walkSpeed;
    this.cameraSpeed = props.cameraSpeed;
    this.isRunning = false;
    this.strafeCameraRotation = 1.3 * PI_180;
    this.strafeCameraSpeed = 10;
    this.cameraRotationInput = new Vector2();
    this.container = props.container;
    this.velocity = props.velocity;
    this.targetVelocity = new Vector3();
    this.gun = new Gun({
      container: props.container,
      playerCamera: props.camera,
      audioListener: props.audioListener,
      shootOffsetAngle: 3,
      bulletsPerShoot: 2,
    });

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

  handleShoot = () => {
    (<GunBehavior>this.gun.behavior).handleShoot();
  };

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
    this.isRunning = false;
    if (this.cameraRotationInput.x) {
      this.camera.rotation.y -= this.cameraRotationInput.x;
      hud.onPlayerRotation(this.camera.rotation);
    }
    this.cameraRotationInput.set(0, 0);
    this.camera.position.x = this.actor.mesh.position.x;
    this.camera.position.z = this.actor.mesh.position.z;
    const isKeyW = keyboard.key[KEYBOARD_KEY.W];
    const isKeyS = keyboard.key[KEYBOARD_KEY.S];
    const isKeyA = keyboard.key[KEYBOARD_KEY.A];
    const isKeyD = keyboard.key[KEYBOARD_KEY.D];
    const moveDirection = new Vector3();

    if (!this.isRunning && !isKeyW && !isKeyS && !isKeyA && !isKeyD) {
      this.targetVelocity.set(0, 0, 0);
    } else {
      if (isKeyW) {
        this.isRunning = true;
        moveDirection.x -= Math.sin(this.camera.rotation.y);
        moveDirection.z -= Math.cos(this.camera.rotation.y);
      }
      if (isKeyS) {
        this.isRunning = true;
        moveDirection.x += Math.sin(this.camera.rotation.y);
        moveDirection.z += Math.cos(this.camera.rotation.y);
      }
      if (isKeyA) {
        this.isRunning = true;
        moveDirection.x += Math.sin(this.camera.rotation.y - PI_2);
        moveDirection.z += Math.cos(this.camera.rotation.y - PI_2);
      }
      if (isKeyD) {
        this.isRunning = true;
        moveDirection.x += Math.sin(this.camera.rotation.y + PI_2);
        moveDirection.z += Math.cos(this.camera.rotation.y + PI_2);
      }
    }
    this.targetVelocity.copy(
      moveDirection.normalize().multiplyScalar(this.walkSpeed * delta)
    );
    this.velocity.lerp(this.targetVelocity, delta * PLAYER.WALK_INERTIA);

    if (this.isRunning) {
      hud.onPlayerMove(this.actor.mesh.position);
      hud.gunBob(delta);
      if (isKeyA != isKeyD) {
        this.lerpCameraRotationZ(
          isKeyA ? this.strafeCameraRotation : -this.strafeCameraRotation,
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
      this.updateBob(delta);
    }
  }
}
