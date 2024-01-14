import {
  ReinhardToneMapping,
  WebGLRenderer,
  BasicShadowMap,
} from 'three';
import { BasicScene } from './core/Scene';
import { TestScene } from './scenes/testScene';
import { LoadingScene } from './scenes/loadingScene';
import { ImageDisplayer, imageDisplayer } from './ImageDisplayer';
import { hud } from './HUD/HUD';
import { ShaderPass } from './Postprocessing/ShaderPass';
import { RenderPass } from './Postprocessing/RenderPass';
import { EffectComposer } from './Postprocessing/EffectComposer';
import { ColorCorrectionShader } from './Postprocessing/Shaders/ColorCorrectionShader';
import { ColorPaletteShader } from './Postprocessing/Shaders/ColorPalette';
import { texturesStore, audioStore } from '@/core/loaders';
import { SpriteSheetLoader } from '@/SpriteSheetLoader';
import { gameTextures, gameSounds, spriteSheet } from './constantsAssets';
import { playerActions, PlayerActionName } from '@/PlayerActions';
import { globalSettings } from '@/GlobalSettings';
import { PlayerLogsValue } from './PlayerLogs';

const SceneClass = TestScene;

export type OnScoreSubmit = (playerLogs: PlayerLogsValue) => void;

export default class ThreeShooter {
  gameProps: any;
  currScene: BasicScene;
  loadedScene?: BasicScene;
  mouseSensitivity: number;
  imageDisplayer: ImageDisplayer;
  prevTime: number;
  enabled: boolean;
  controlsEnabled: boolean;
  pixelRatio: number;
  renderer: WebGLRenderer;
  composer: EffectComposer;
  effectColorCorrection?: ShaderPass;
  effectColorPalette?: ShaderPass;

  constructor(props: any) {
    this.gameProps = props;
    this.currScene = new LoadingScene(props);
    this.mouseSensitivity = globalSettings.getSetting('mouseSensitivity');
    globalSettings.addUpdateListener(this.onUpdateGlobalSettings);
    this.imageDisplayer = imageDisplayer;
    this.prevTime = performance.now();
    this.enabled = true;
    this.controlsEnabled = false;

    this.pixelRatio = 1;
    this.renderer = new WebGLRenderer({
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(this.pixelRatio);
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
    this.handleResize(props.renderWidth, props.renderHeight);

    this.loadResources(() => this.changeToMainScene());
  }

  handleResize = (width: number, height: number) => {
    hud.handleResize(width, height);
    this.currScene.camera.aspect = width / height;
    this.currScene.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.updateRenderer(0);
  };

  onUpdateGlobalSettings = () => {
    this.mouseSensitivity = globalSettings.getSetting('mouseSensitivity');
  }

  onPlayerActionStart(actionName: PlayerActionName) {
    if (!this.controlsEnabled) {
      return;
    }
    playerActions.startAction(actionName);
  }

  onPlayerActionEnd(actionName: PlayerActionName) {
    playerActions.endAction(actionName);
  }

  onPlayerCameraMove(movementX: number) {
    if (!this.controlsEnabled) {
      return;
    }
    playerActions.addCameraMovement(
      movementX * this.mouseSensitivity
    );
  }

  setEnabled(newValue: boolean) {
    if (!this.enabled && newValue) {
      this.prevTime = performance.now();
    }
    this.enabled = newValue;
    this.controlsEnabled = newValue;
  }

  loadResources(onLoad: Function) {
    const spriteSheetLoader = new SpriteSheetLoader(spriteSheet, 8);
    const onLoadSome = () => {
      const soundsProgress = (<LoadingScene>this.currScene).soundsProgress;
      const texturesProgress = (<LoadingScene>this.currScene).texturesProgress;
      if ((soundsProgress !== 100) || (texturesProgress !== 100)) {
        return;
      }

      onLoad();
    };

    const checkIsInLoadingScene = () => {
      return this.currScene instanceof LoadingScene;
    };

    const onTexturesProgress = (progress: number) => {
      if (!checkIsInLoadingScene()) {
        return;
      }
      (<LoadingScene>this.currScene).onTexturesProgress(progress);
    };

    const onSoundsProgress = (progress: number) => {
      if (!checkIsInLoadingScene()) {
        return;
      }
      (<LoadingScene>this.currScene).onSoundsProgress(progress);
    };

    const onImagesScale = (imagesInfo: { [name: string]: string }) => {
      texturesStore.loadTextures(imagesInfo, onLoadSome, onTexturesProgress);
    };

    const onImagesScaleProgress = (progress: number) => {
      if (!checkIsInLoadingScene()) {
        return;
      }
      (<LoadingScene>this.currScene).onImagesScaleProgress(progress);
    };
    spriteSheetLoader.loadImages(gameTextures, onImagesScale, onImagesScaleProgress);
    audioStore.loadSounds(gameSounds, onLoadSome, onSoundsProgress);
  }

  onSceneFinish = () => {
    this.changeToMainScene();
  }

  changeToMainScene() {
    const mainScene = new SceneClass({
      ...this.gameProps,
      onFinish: this.onSceneFinish,
    });
    this.changeScene(mainScene);
  }

  changeScene(scene: BasicScene) {
    hud.reset();
    this.currScene.entitiesContainer.onDestroy();
    this.currScene = scene;
    this.changeRenderingScene(this.currScene);
  }

  changeRenderingScene(scene: BasicScene) {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(scene.scene, scene.camera));
    this.effectColorCorrection = new ShaderPass(ColorCorrectionShader);
    this.composer.addPass(this.effectColorCorrection);
    this.effectColorPalette = new ShaderPass(ColorPaletteShader);
    this.composer.addPass(this.effectColorPalette);
  }

  setPixelRatio = (value: number) => {
    this.renderer.setPixelRatio(value);
    this.changeRenderingScene(this.currScene);
    this.updateRenderer(0);
  };

  updateMouseSensitivity = (value: number) => {
    globalSettings.setSetting('mouseSensitivity', value);
  };

  updateAudioVolume = (value: number) => {
    globalSettings.setSetting('audioVolume', value);
  };

  updateFov = (value: number) => {
    globalSettings.setSetting('fov', value);
  };

  update = () => {
    if (this.enabled) {
      const time = performance.now();
      const delta = (time - this.prevTime) / 1000;
      if (delta < 1) {
        this.currScene.update(delta);
        this.updateRenderer(delta);
        hud.update(delta);
      } else {
        console.warn('Performance issues. Skip frame');
      }
      this.prevTime = time;
    }
    requestAnimationFrame(this.update);
  }

  updateRenderer(delta: number) {
    this.renderer.clear();
    this.composer.render(delta);
    this.renderer.clearDepth();
    this.renderer.render(this.imageDisplayer.scene, this.imageDisplayer.camera);
    this.renderer.render(hud.scene, hud.camera);
  }
}
