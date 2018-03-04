import { PerspectiveCamera, WebGLRenderer, BasicShadowMap } from 'three';
import Scene1 from './scenes/scene1';

class ThreeShooter {
	constructor(props) {
		this.currScene = new Scene1(props);
		this.renderer = new WebGLRenderer();
		this.renderer.setSize(props.renderWidth, props.renderHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = BasicShadowMap;
		props.renderContainer.appendChild(this.renderer.domElement);
		this.currScene.controls.enabled = true;
		this.update();
		this.currScene.controls.enabled = false;
		props.renderContainer.addEventListener('click', (event) => {
			props.renderContainer.requestPointerLock();
			this.currScene.controls.enabled = true;
		});
		document.addEventListener('pointerlockchange', (event) => {
			this.currScene.controls.enabled = document.pointerLockElement == props.renderContainer;
		});
	}

	update() {
		requestAnimationFrame(this.update.bind(this));
		this.currScene.update();
		this.renderer.render(this.currScene.scene, this.currScene.camera);
	}
}

window.ThreeShooter = ThreeShooter;