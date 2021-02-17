import {
  ReinhardToneMapping,
  WebGLRenderer,
  BasicShadowMap
} from 'three';
import { BasicScene } from './core/Scene';
import { TestScene } from './scenes/testScene';
import { LoadingScene } from './scenes/loadingScene';
import { ImageDisplayer, imageDisplayer } from './ImageDisplayer';
import { hud } from './HUD/HUD';
import { ShaderPass } from './Postprocessing/ShaderPass';
import { RenderPass } from './Postprocessing/RenderPass';
import { EffectComposer } from './Postprocessing/EffectComposer';
import { FilmPass } from './Postprocessing/FilmPass';
import { ColorCorrectionShader } from './Postprocessing/Shaders/ColorCorrectionShader';
import { texturesStore, audioStore } from '@/core/loaders';
import { ImageScaler } from '@/ImageScaler';
import { gameTextures, gameSounds } from './constants';

export default class ThreeShooter {
  currScene: BasicScene;
  imageDisplayer: ImageDisplayer;
  prevTime: number;
  enabled: boolean;
  loaded: boolean;
  renderer: WebGLRenderer;
  composer: EffectComposer;

  constructor(props: any) {
    this.currScene = new LoadingScene(props);
    this.imageDisplayer = imageDisplayer;
    this.prevTime = performance.now();
    this.enabled = false;
    this.loaded = false;
    this.loadTextures(props);

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

    props.renderContainer.appendChild(this.renderer.domElement);
    this.update();
    document.addEventListener('pointerlockchange', () => {
      this.enabled = document.pointerLockElement === props.renderContainer;
      this.prevTime = performance.now();
    });
    window.addEventListener('resize', () => {
      hud.handleResize();
      this.currScene.camera.aspect = window.innerWidth / window.innerHeight;
      this.currScene.camera.updateProjectionMatrix();
      this.renderer.setSize(props.renderContainer.offsetWidth, props.renderContainer.offsetHeight);
      this.composer.setSize(props.renderContainer.offsetWidth, props.renderContainer.offsetHeight);
    });
  }

  loadTextures(gameProps: any) {
    const imageScaler = new ImageScaler(8);
    const onLoad = () => {
      const soundsProgress = (<LoadingScene>this.currScene).soundsProgress;
      const texturesProgress = (<LoadingScene>this.currScene).texturesProgress;
      if ((soundsProgress !== 100) || (texturesProgress !== 100)) {
        return;
      }

      const pointerlockHandler = () => {
        const isRenderContainer = document.pointerLockElement === gameProps.renderContainer;
        if (!isRenderContainer) {
          return;
        }
        this.loaded = true;
        this.changeScene(
          new TestScene(gameProps)
        );
        document.removeEventListener('pointerlockchange', pointerlockHandler);
      };
      document.addEventListener('pointerlockchange', pointerlockHandler);
      gameProps.onLoad();
    };

    const onTexturesProgress = (progress: number) => {
      (<LoadingScene>this.currScene).onTexturesProgress(progress);
    };

    const onSoundsProgress = (progress: number) => {
      (<LoadingScene>this.currScene).onSoundsProgress(progress);
    };

    const onImagesScale = (imagesInfo: { [name: string]: string }) => {
      texturesStore.loadTextures(imagesInfo, onLoad, onTexturesProgress);
    };

    const onImagesScaleProgress = (progress: number) => {
      (<LoadingScene>this.currScene).onImagesScaleProgress(progress);
    };
    imageScaler.scaleImages(gameTextures, onImagesScale, onImagesScaleProgress);
    audioStore.loadSounds(gameSounds, onLoad, onSoundsProgress);
  }

  changeScene(scene: BasicScene) {
    hud.show();
    this.currScene = scene;
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.currScene.scene, this.currScene.camera));

    const effectColorCorrection = new ShaderPass(ColorCorrectionShader);
    this.composer.addPass(effectColorCorrection);

    const effectFilm = new FilmPass(0.15, 0.015, 648, 0);
    this.composer.addPass(effectFilm);
  }

  update = () => {
    if (this.enabled || !this.loaded) {
      const time = performance.now();
      const delta = (time - this.prevTime) / 1000;
      this.renderer.clear();
      this.currScene.update(delta);
      hud.update();
      this.composer.render(delta);
      this.renderer.clearDepth();
      this.renderer.render(hud.scene, hud.camera);
      this.renderer.render(this.imageDisplayer.scene, this.imageDisplayer.camera);
      this.prevTime = time;
    }
    requestAnimationFrame(this.update);
  }
}
