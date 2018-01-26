import { Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';

class Scene1 {
	constructor(props) {
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(75, props.renderWidth / props.renderHeight, 0.1, 1000);
		this.camera.position.z = 5;
		var geometry = new BoxGeometry(1, 1, 1);
		var material = new MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
		this.cube = new Mesh(geometry, material);
		this.scene.add(this.cube);
	}

	update() {
		this.cube.rotation.x += 0.01;
		this.cube.rotation.y += 0.02;
	}
}

export default Scene1;