import { ReinhardToneMapping, WebGLRenderer, BasicShadowMap } from 'three';
import Scene1 from './scenes/scene1';
import imageDisplayer from './ImageDisplayer';
import HUD from './HUD';
import { EVENT_TYPES } from './constants';
import EventChannel from './EventChannel';
import ShootSound from './assets/shoot.mp3';

class ThreeShooter {
  constructor(props) {
    this.currScene = new Scene1(props);
    this.hud = new HUD();
    this.imageDisplayer = imageDisplayer;
    this.prevTime = performance.now();
    this.enabled = true;

    this.renderer = new WebGLRenderer();
    this.renderer.setSize(props.renderWidth, props.renderHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = BasicShadowMap;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.toneMapping = ReinhardToneMapping;
    this.renderer.toneMappingExposure = Math.pow(0.68, 5.0);

    props.renderContainer.appendChild(this.renderer.domElement);
    this.update();
    document.addEventListener('pointerlockchange', (event) => {
      this.enabled = document.pointerLockElement === props.renderContainer;
      this.prevTime = performance.now();
    });
    window.addEventListener('resize', (event) => {
      this.currScene.camera.aspect = window.innerWidth / window.innerHeight;
      this.currScene.camera.updateProjectionMatrix();
      this.renderer.setSize(props.renderContainer.offsetWidth, props.renderContainer.offsetHeight);
      this.hud = new HUD();
    });
  }

  update = () => {
    if (this.enabled) {
      const time = performance.now();
      const delta = (time - this.prevTime) / 1000;
      this.renderer.clear();
      this.currScene.update(delta);
      this.renderer.render(this.currScene.scene, this.currScene.camera);
      this.renderer.clearDepth();
      this.renderer.render(this.hud.scene, this.hud.camera);
      this.renderer.render(this.imageDisplayer.scene, this.imageDisplayer.camera);
      this.prevTime = time;
    }
    requestAnimationFrame(this.update);
  }
}

window.ThreeShooter = ThreeShooter;
