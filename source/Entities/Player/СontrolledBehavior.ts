import { Camera, Vector2, Vector3, AudioListener } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { Behavior } from '@/core/Entities/Behavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { keyboard } from '@/Keyboard';
import { PI_2, KEYBOARD_KEY, HUD } from '@/constants';
import { Gun } from '@/Entities/Gun/Gun';
import { GunBehavior } from '@/Entities/Gun/GunBehavior';
import { hud } from '@/HUD/HUD';

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
  cameraRotationInput: Vector2;
  eyeY: number;
  walkSpeed: number;
  cameraSpeed: number;
  container: EntitiesContainer;
  velocity: Vector3;
  gun: Gun;

  constructor(props: СontrolledBehaviorProps) {
    this.actor = props.actor;
    this.eyeY = props.eyeY;
    this.camera = props.camera;
    this.camera.position.y = this.eyeY;
    this.walkSpeed = props.walkSpeed;
    this.cameraSpeed = props.cameraSpeed;
    this.isRunning = false;
    this.cameraRotationInput = new Vector2();
    this.container = props.container;
    this.velocity = props.velocity;
    this.gun = new Gun({
      container: props.container,
      playerCamera: props.camera,
      audioListener: props.audioListener
    });

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
    (<GunBehavior>this.gun.behavior).handleShoot();
  };

  update(delta: number) {
    this.gun.update(delta);
    let isRunning = false;
    if (this.cameraRotationInput.x) {
      this.camera.rotation.y -= this.cameraRotationInput.x;
      hud.onPlayerRotation(this.camera.rotation);
    }
    this.cameraRotationInput.set(0, 0);
    this.camera.position.copy(this.actor.mesh.position);
    this.velocity.set(0, 0, 0);

    if (keyboard.key[KEYBOARD_KEY.W]) {
      isRunning = true;
      this.velocity.x -= Math.sin(this.camera.rotation.y) * this.walkSpeed * delta;
      this.velocity.z -= Math.cos(this.camera.rotation.y) * this.walkSpeed * delta;
    }
    if (keyboard.key[KEYBOARD_KEY.S]) {
      isRunning = true;
      this.velocity.x += Math.sin(this.camera.rotation.y) * this.walkSpeed * delta;
      this.velocity.z += Math.cos(this.camera.rotation.y) * this.walkSpeed * delta;
    }
    if (keyboard.key[KEYBOARD_KEY.A]) {
      isRunning = true;
      this.velocity.x += Math.sin(this.camera.rotation.y - PI_2) * this.walkSpeed * delta;
      this.velocity.z += Math.cos(this.camera.rotation.y - PI_2) * this.walkSpeed * delta;
    }
    if (keyboard.key[KEYBOARD_KEY.D]) {
      isRunning = true;
      this.velocity.x += Math.sin(this.camera.rotation.y + PI_2) * this.walkSpeed * delta;
      this.velocity.z += Math.cos(this.camera.rotation.y + PI_2) * this.walkSpeed * delta;
    }

    if (isRunning) {
      hud.onPlayerMove(this.actor.mesh.position);
    }

    this.isRunning = isRunning;
  }
}
