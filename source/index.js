import { PerspectiveCamera, WebGLRenderer, BasicShadowMap } from 'three';
import Scene1 from './scenes/scene1';

class ThreeShooter {
	constructor(props) {
    this.currScene = new Scene1(props);
    this.prevTime = performance.now();

		this.renderer = new WebGLRenderer();
		this.renderer.setSize(props.renderWidth, props.renderHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = BasicShadowMap;

		props.renderContainer.appendChild(this.renderer.domElement);
		this.currScene.controls.enabled = true;
		this.update();
		this.currScene.controls.enabled = false;
		document.addEventListener('pointerlockchange', (event) => {
			this.currScene.controls.enabled = document.pointerLockElement == props.renderContainer;
		});
		window.addEventListener('resize', (event) => {
			this.currScene.camera.aspect = window.innerWidth / window.innerHeight;
			this.currScene.camera.updateProjectionMatrix();
			this.renderer.setSize(props.renderContainer.offsetWidth, props.renderContainer.offsetHeight);
		});
	}


	update() {
		requestAnimationFrame(this.update.bind(this));
    var time = performance.now();
		var delta = (time - this.prevTime) / 1000;
		this.currScene.update(delta);
    this.renderer.render(this.currScene.scene, this.currScene.camera);
    this.prevTime = time;
	}
}

window.ThreeShooter = ThreeShooter;