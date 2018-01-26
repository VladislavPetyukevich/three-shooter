import { Scene, PerspectiveCamera, BoxGeometry, PlaneGeometry, MeshPhongMaterial, PointLight, Mesh, Vector3, AmbientLight } from 'three';
import controls from '../Controls';
import player from '../Player';

class Scene1 {
	constructor(props) {
		this.scene = new Scene();
		this.scene.add(new AmbientLight(0x404040, 0.2));

		this.pointLight = new PointLight(0xffffff, 0.8, 50);
		this.pointLight.position.set(-3, 6, -3);
		this.pointLight.castShadow = true;
		this.pointLight.shadow.camera.near = 0.1;
		this.pointLight.shadow.camera.far = 25;
		this.scene.add(this.pointLight);

		this.camera = new PerspectiveCamera(75, props.renderWidth / props.renderHeight, 0.1, 1000);
		this.camera.position.z = 5;
		this.camera.position.y = player.height;
		this.camera.lookAt(new Vector3(0, player.height, 0));

		this.cube = new Mesh(
			new BoxGeometry(1, 1, 1),
			new MeshPhongMaterial({ color: 'blue' })
		);
		this.cube.position.y = 1.8;
		this.cube.receiveShadow = true;
		this.cube.castShadow = true;
		this.scene.add(this.cube);

		this.floor = new Mesh(
			new PlaneGeometry(50, 50),
			new MeshPhongMaterial({ color: 'white' })
		);
		this.floor.receiveShadow = true;
		this.floor.rotation.x -= Math.PI / 2;
		this.scene.add(this.floor);
	}

	update() {
		this.cube.rotation.x += 0.01;
		this.cube.rotation.y += 0.02;

		var camera = this.camera;
		//left arrow
		if (controls.keyboard[37]) {
			camera.rotation.y += player.turnSpeed;
		}
		//right arrow
		if (controls.keyboard[39]) {
			camera.rotation.y -= player.turnSpeed;
		}

		//W key
		if (controls.keyboard[87]) {
			camera.position.x -= Math.sin(camera.rotation.y) * player.movementSpeed;
			camera.position.z -= Math.cos(camera.rotation.y) * player.movementSpeed;
		}

		//S key
		if (controls.keyboard[83]) {
			camera.position.x += Math.sin(camera.rotation.y) * player.movementSpeed;
			camera.position.z += Math.cos(camera.rotation.y) * player.movementSpeed;
		}

		//A key
		if (controls.keyboard[65]) {
			camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.movementSpeed;
			camera.position.z += Math.cos(camera.rotation.y - Math.PI / 2) * player.movementSpeed;
		}

		//D key
		if (controls.keyboard[68]) {
			camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.movementSpeed;
			camera.position.z += Math.cos(camera.rotation.y + Math.PI / 2) * player.movementSpeed;
		}
	}
}

export default Scene1;