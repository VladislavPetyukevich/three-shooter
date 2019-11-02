import {
  ReinhardToneMapping,
  WebGLRenderer,
  BasicShadowMap
} from 'three';
import { BasicScene } from './core/Scene';
import { TestScene } from './scenes/testScene';
import { ImageDisplayer, imageDisplayer } from './ImageDisplayer';
import { HUD } from './HUD';
import { ShaderPass } from './Postprocessing/ShaderPass';
import { RenderPass } from './Postprocessing/RenderPass';
import { EffectComposer } from './Postprocessing/EffectComposer';
import { FilmPass } from './Postprocessing/FilmPass';
import { ColorCorrectionShader } from './Postprocessing/Shaders/ColorCorrectionShader';

export default class ThreeShooter {
  currScene: BasicScene;
  hud: HUD;
  imageDisplayer: ImageDisplayer;
  prevTime: number;
  enabled: boolean;
  renderer: WebGLRenderer;
  composer: EffectComposer;

  constructor(props: any) {
    this.currScene = new TestScene(props);
    this.hud = new HUD();
    this.imageDisplayer = imageDisplayer;
    this.prevTime = performance.now();
    this.enabled = false;

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

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.currScene.scene, this.currScene.camera));

    const effectColorCorrection = new ShaderPass(ColorCorrectionShader);
    this.composer.addPass(effectColorCorrection);

    const effectFilm = new FilmPass(0.15, 0.015, 648, 0);
    this.composer.addPass(effectFilm);

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
      this.composer.setSize(props.renderContainer.offsetWidth, props.renderContainer.offsetHeight);
      this.hud = new HUD();
    });
  }

  update = () => {
    if (this.enabled) {
      const time = performance.now();
      const delta = (time - this.prevTime) / 1000;
      this.renderer.clear();
      this.currScene.update(delta);
      this.composer.render(delta);
      this.renderer.clearDepth();
      this.renderer.render(this.hud.scene, this.hud.camera);
      this.renderer.render(this.imageDisplayer.scene, this.imageDisplayer.camera);
      this.prevTime = time;
    }
    requestAnimationFrame(this.update);
  }
}
