import { Camera, Vector2 } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { Behavior } from '@/core/Entities/Behavior';
import { keyboard } from '@/PayerControls/Keyboard';
import { PI_2, KEYBOARD_KEY } from '@/constants';

interface СontrolledBehaviorProps {
  actor: Actor;
  camera: Camera;
  eyeY: number;
  walkSpeed: number;
  cameraSpeed: number;
}

export class СontrolledBehavior implements Behavior {
  actor: Actor;
  camera: Camera;
  isRunning: boolean;
  cameraRotationInput: Vector2;
  eyeY: number;
  walkSpeed: number;
  cameraSpeed: number;

  constructor(props: СontrolledBehaviorProps) {
    this.actor = props.actor;
    this.eyeY = props.eyeY;
    this.camera = props.camera;
    this.camera.position.y = this.eyeY;
    this.walkSpeed = props.walkSpeed;
    this.cameraSpeed = props.cameraSpeed;
    this.isRunning = false;
    this.cameraRotationInput = new Vector2();

    document.addEventListener('mousemove', this.handleMouseMove, false);
    document.addEventListener('click', this.handleShoot, false);
  }

  handleMouseMove = (event: MouseEvent) => {
    // if (this.enabled === false) return;

    var movementX = event.movementX * 0.002;
    var movementY = event.movementY * 0.002;

    this.cameraRotationInput.set(
      this.cameraRotationInput.x += movementX,
      this.cameraRotationInput.y += movementY,
    );
  }

  handleShoot = () => {
    console.log('handleShoot');
  };

  update(delta: number) {
    let isRunning = false;
    this.camera.rotation.y -= this.cameraRotationInput.x;
    this.cameraRotationInput.set(0, 0);

    if (keyboard.key[KEYBOARD_KEY.W]) {
      isRunning = true;
      this.camera.position.x -= Math.sin(this.camera.rotation.y) * this.walkSpeed * delta;
      this.camera.position.z -= Math.cos(this.camera.rotation.y) * this.walkSpeed * delta;
    }
    if (keyboard.key[KEYBOARD_KEY.S]) {
      isRunning = true;
      this.camera.position.x += Math.sin(this.camera.rotation.y) * this.walkSpeed * delta;
      this.camera.position.z += Math.cos(this.camera.rotation.y) * this.walkSpeed * delta;
    }
    if (keyboard.key[KEYBOARD_KEY.A]) {
      isRunning = true;
      this.camera.position.x += Math.sin(this.camera.rotation.y - PI_2) * this.walkSpeed * delta;
      this.camera.position.z += Math.cos(this.camera.rotation.y - PI_2) * this.walkSpeed * delta;
    }
    if (keyboard.key[KEYBOARD_KEY.D]) {
      isRunning = true;
      this.camera.position.x += Math.sin(this.camera.rotation.y + PI_2) * this.walkSpeed * delta;
      this.camera.position.z += Math.cos(this.camera.rotation.y + PI_2) * this.walkSpeed * delta;
    }

    this.isRunning = isRunning;
    this.actor.mesh.position.copy(this.camera.position);
  }
}
