import { ReinhardToneMapping, WebGLRenderer, BasicShadowMap } from 'three';
import Scene1 from './scenes/scene1';
import imageDisplayer from './ImageDisplayer';
import HUD from './HUD';

class ThreeShooter {
  constructor(props) {
    this.currScene = new Scene1(props);
    this.hud = new HUD();
    this.imageDisplayer = imageDisplayer;
    this.prevTime = performance.now();

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
    // this.currScene.controls.enabled = false;
    this.update();
    document.addEventListener('pointerlockchange', (event) => {
      // this.currScene.controls.enabled = document.pointerLockElement == props.renderContainer;
    });
    window.addEventListener('resize', (event) => {
      this.currScene.camera.aspect = window.innerWidth / window.innerHeight;
      this.currScene.camera.updateProjectionMatrix();
      this.renderer.setSize(props.renderContainer.offsetWidth, props.renderContainer.offsetHeight);
      this.hud = new HUD();
    });
  }


  update() {
    requestAnimationFrame(this.update.bind(this));
    var time = performance.now();
    var delta = (time - this.prevTime) / 1000;
    this.renderer.clear();
    this.currScene.update(delta);
    this.renderer.render(this.currScene.scene, this.currScene.camera);
    this.renderer.clearDepth();
    this.renderer.render(this.hud.scene, this.hud.camera);
    this.renderer.render(this.imageDisplayer.scene, this.imageDisplayer.camera);
    this.prevTime = time;
  }
}

window.ThreeShooter = ThreeShooter;