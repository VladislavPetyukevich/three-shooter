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
import { ImageScaler } from '@/ImageScaler';
import { gameTextures, gameSounds } from './constants';
import { playerActions, PlayerActionName } from '@/PlayerActions';
import { globalSettings } from '@/GlobalSettings';

const SceneClass = TestScene;

export default class ThreeShooter {
  gameProps: any;
  currScene: BasicScene;
  loadedScene?: BasicScene;
  mouseSensitivity: number;
  imageDisplayer: ImageDisplayer;
  prevTime: number;
  enabled: boolean;
  loaded: boolean;
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
    this.enabled = false;
    this.loaded = false;
    this.loadTextures(props);

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
  }

  handleResize = (width: number, height: number) => {
    hud.handleResize(width, height);
    this.currScene.camera.aspect = width / height;
    this.currScene.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  };

  onUpdateGlobalSettings = () => {
    this.mouseSensitivity = globalSettings.getSetting('mouseSensitivity');
  }

  onPlayerActionStart(actionName: PlayerActionName) {
    playerActions.startAction(actionName);
  }

  onPlayerActionEnd(actionName: PlayerActionName) {
    playerActions.endAction(actionName);
  }

  onPlayerCameraMove(movementX: number) {
    playerActions.addCameraMovement(
      movementX * this.mouseSensitivity
    );
  }

  setEnabled(newValue: boolean) {
    if (!this.enabled && newValue) {
      this.prevTime = performance.now();
    }
    this.enabled = newValue;
    if (this.enabled && this.currScene instanceof LoadingScene) {
      this.loaded = true;
      if (this.loadedScene) {
        this.changeScene(this.loadedScene);
      }
    }
  }

  loadTextures(gameProps: any) {
    const imageScaler = new ImageScaler(8);
    const onLoad = () => {
      const soundsProgress = (<LoadingScene>this.currScene).soundsProgress;
      const texturesProgress = (<LoadingScene>this.currScene).texturesProgress;
      if ((soundsProgress !== 100) || (texturesProgress !== 100)) {
        return;
      }

      this.loadScene(SceneClass, gameProps, () => {
        if (this.enabled && this.loadedScene) {
          this.changeScene(this.loadedScene);
        }
      });
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
    imageScaler.addToIgnore('damageEffect');
    imageScaler.scaleImages(gameTextures, onImagesScale, onImagesScaleProgress);
    audioStore.loadSounds(gameSounds, onLoad, onSoundsProgress);
  }

  onDungeonFinish = () => {
    setTimeout(
      () => {
        this.loadScene(
          SceneClass,
          { ...this.gameProps, onFinish: this.onDungeonFinish },
          () => this.loadedScene && this.changeScene(this.loadedScene)
        );
      },
      0
    );
  }

  loadScene(constructor: typeof BasicScene, gameProps: any, onLoaded?: Function) {
    this.loadedScene = new constructor({
      ...gameProps, onFinish: this.onDungeonFinish
    });
    if (onLoaded) {
      onLoaded();
    }
  }

  changeScene(scene: BasicScene) {
    hud.reset();
    this.currScene.entitiesContainer.onDestroy();
    this.currScene = scene;
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.currScene.scene, this.currScene.camera));

    this.effectColorCorrection = new ShaderPass(ColorCorrectionShader);
    this.composer.addPass(this.effectColorCorrection);
    this.effectColorPalette = new ShaderPass(ColorPaletteShader);
    this.composer.addPass(this.effectColorPalette);
  }

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
    if (this.enabled || !this.loaded) {
      const time = performance.now();
      const delta = (time - this.prevTime) / 1000;
      if (delta < 1) {
        this.renderer.clear();
        this.currScene.update(delta);
        this.composer.render(delta);
        this.renderer.clearDepth();
        this.renderer.render(this.imageDisplayer.scene, this.imageDisplayer.camera);
        this.renderer.render(hud.scene, hud.camera);
        hud.update(delta);
      } else {
        console.warn('Performance issues. Skip frame');
      }
      this.prevTime = time;
    }
    requestAnimationFrame(this.update);
  }
}
