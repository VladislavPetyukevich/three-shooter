import controls from './Controls';

class Player {
	constructor(props) {
		this.height = 1.8;
		this.turnSpeed = Math.PI * 0.015;
		this.movementSpeed = 0.25;
		this.camera = props.camera;
	}

	update() {
		var camera = this.camera;
		if (controls.keyboard[37]) {
			camera.rotation.y += this.turnSpeed;
		}
		//right arrow
		if (controls.keyboard[39]) {
			camera.rotation.y -= this.turnSpeed;
		}

		//W key
		if (controls.keyboard[87]) {
			camera.position.x -= Math.sin(camera.rotation.y) * this.movementSpeed;
			camera.position.z -= Math.cos(camera.rotation.y) * this.movementSpeed;
		}

		//S key
		if (controls.keyboard[83]) {
			camera.position.x += Math.sin(camera.rotation.y) * this.movementSpeed;
			camera.position.z += Math.cos(camera.rotation.y) * this.movementSpeed;
		}

		//A key
		if (controls.keyboard[65]) {
			camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * this.movementSpeed;
			camera.position.z += Math.cos(camera.rotation.y - Math.PI / 2) * this.movementSpeed;
		}

		//D key
		if (controls.keyboard[68]) {
			camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * this.movementSpeed;
			camera.position.z += Math.cos(camera.rotation.y + Math.PI / 2) * this.movementSpeed;
		}
	}
}

export default Player;