import { Vector3 } from 'three';
import keyboard from './Keyboard';

class MovementControls {
  constructor(camera) {
    this.movementSpeed = 4.0;
    this.camera = camera;
    this.velocity = new Vector3();
    this.enabled = false;
  }

  update(delta) {
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;

    if (this.enabled) {
      //W key
      if (keyboard.key[87]) {
        this.velocity.z -= this.movementSpeed * delta;
      }
      //S key
      if (keyboard.key[83]) {
        this.velocity.z += this.movementSpeed * delta;
      }
      //A key
      if (keyboard.key[65]) {
        this.velocity.x -= this.movementSpeed * delta;
      }
      //D key
      if (keyboard.key[68]) {
        this.velocity.x += this.movementSpeed * delta;
      }
    }

    this.camera.translateX(this.velocity.x);
    this.camera.translateZ(this.velocity.z);
    // this.camera.position.y = 10;
  }
}

export default MovementControls;
