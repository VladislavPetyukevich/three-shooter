import { Scene, PerspectiveCamera, BoxGeometry, PlaneGeometry, MeshPhongMaterial, PointLight, Mesh, Vector3, AmbientLight } from 'three';
import controls from '../Controls';
import Player from '../Player';

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
		this.controls = new Player({ camera: this.camera });

		this.cube = new Mesh(
			new BoxGeometry(1, 1, 1),
			new MeshPhongMaterial({ color: 'blue' })
		);
		this.cube.position.set(5, 1.8, 0);
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
		this.controls.update();
	}
}

export default Scene1;