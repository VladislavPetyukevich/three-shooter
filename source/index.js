import { PerspectiveCamera, WebGLRenderer } from 'three';
import Scene1 from './scenes/Scene1';

class ThreeShooter {
	constructor(props) {
		this.scene = new Scene1();
		this.camera = new PerspectiveCamera(75, props.renderWidth / props.renderHeight, 0.1, 1000);
		this.camera.position.z = 5;
		this.renderer  = new WebGLRenderer();
		this.renderer .setSize(props.renderWidth, props.renderHeight);
		props.renderContainer.appendChild(this.renderer .domElement);
		this.update();
	}

	update() {
		requestAnimationFrame(this.update.bind(this));
		this.scene.update();
		this.renderer.render(this.scene.scene, this.camera);
	}
}

window.ThreeShooter = ThreeShooter;