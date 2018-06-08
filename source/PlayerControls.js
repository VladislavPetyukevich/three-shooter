import { Vector3 } from 'three';
import keyboardControls from './KeyboardControls';

var PI_2 = Math.PI / 2;
var PI_180 = Math.PI / 180;

class PlayerControls {
	constructor(props) {
		this.playerHeight = 1.8;
		this.turnSpeed = 3.5;
		this.movementSpeed = 0.25;
		this.camera = props.camera;
		this.camera.rotation.set(0, 0, 0);
		this.velocity = new Vector3();
		this.mouseMovementX = this.mouseMovementY = this.lon = this.lat = 0;
		this.prevTime = performance.now();
		this.enabled = false;

		document.addEventListener('mousemove', this.onMouseMove.bind(this));
	}

	onMouseMove() {
		if (!this.enabled) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozmovementY || event.webkitmovementY || 0;

		this.mouseMovementX += movementX * this.turnSpeed;
		this.mouseMovementY += movementY * this.turnSpeed;
	}

	update() {
		var camera = this.camera;
		var time = performance.now();
		var delta = (time - this.prevTime) / 1000;

		this.velocity.x -= this.velocity.x * 10.0 * delta;
		this.velocity.z -= this.velocity.z * 10.0 * delta;

		if (this.enabled) {
			//movement
			//W key
			if (keyboardControls.key[87]) {
				this.velocity.z -= 4.0 * delta;
			}

			//S key
			if (keyboardControls.key[83]) {
				this.velocity.z += 4.0 * delta;
			}

			//A key
			if (keyboardControls.key[65]) {
				this.velocity.x -= 4.0 * delta;
			}

			//D key
			if (keyboardControls.key[68]) {
				this.velocity.x += 4.0 * delta;
			}
		}

		this.camera.translateX(this.velocity.x);
		this.camera.translateZ(this.velocity.z);
		this.camera.position.y = this.playerHeight;

		if (this.enabled) {
			// Mouse look
      if (this.mouseMovementX > 0) {
        camera.rotation.y -= PI_180 * this.mouseMovementX * this.turnSpeed * delta;
      } else {
        camera.rotation.y += PI_180 * -this.mouseMovementX * this.turnSpeed * delta;
      }

			this.mouseMovementX = 0;
			this.mouseMovementY = 0;
		}

		this.prevTime = time;
	}
}

export default PlayerControls;