import { Scene, PerspectiveCamera, BoxGeometry, PlaneGeometry, MeshBasicMaterial, Mesh, Vector3 } from 'three';
import controls from '../Controls';
import player from '../Player';

class Scene1 {
	constructor(props) {
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(75, props.renderWidth / props.renderHeight, 0.1, 1000);

		this.camera.position.z = 5;
		this.camera.position.y = player.height;
		this.camera.lookAt(new Vector3(0, player.height, 0));
		var geometry = new BoxGeometry(1, 1, 1);
		var material = new MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
		this.cube = new Mesh(geometry, material);
		this.scene.add(this.cube);
		this.floor = new Mesh(
			new PlaneGeometry(50, 50),
			new MeshBasicMaterial({ color: 0xffffff, wireframe: true })
		);
		this.floor.rotation.x -= Math.PI / 2;
		this.scene.add(this.floor);
	}

	update() {
		this.cube.rotation.x += 0.01;
		this.cube.rotation.y += 0.02;

		if (controls.keyboard[37]) {
			this.camera.rotation.y += Math.PI * 0.01;
		}

		if (controls.keyboard[39]) {
			this.camera.rotation.y -= Math.PI * 0.01;
		}
	}
}

export default Scene1;