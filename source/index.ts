import {
  ReinhardToneMapping,
  WebGLRenderer,
  BasicShadowMap,
  Vector2,
  Data3DTexture,
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
import { SharpenShader } from './Postprocessing/Shaders/Sharpen';
import { texturesStore, audioStoreSfx } from '@/core/loaders';
import { SpriteSheetLoader } from '@/SpriteSheetLoader';
import { gameTextures, gameSounds, spriteSheet, gameSoundsMusic } from './constantsAssets';
import { playerActions, PlayerActionName } from '@/PlayerActions';
import { globalSettings } from '@/GlobalSettings';
import { PlayerLogsValue } from './PlayerLogs';
import { LUTImageLoader } from '@/core/loaders/LUTImageLoader';
import { audioStoreMusic } from './core/loaders/AudioLoader';

const SceneClass = TestScene;

export type OnScoreSubmit = (playerLogs: PlayerLogsValue) => void;

interface GameProps {
  renderContainer: HTMLElement;
  renderWidth: number;
  renderHeight: number;
  onScoreSubmit: () => void;
}

export default class ThreeShooter {
  gameProps: GameProps;
  currScene: BasicScene;
  loadedScene?: BasicScene;
  imageDisplayer: ImageDisplayer;
  prevTime: number;
  enabled: boolean;
  firstPlayClick: boolean;
  controlsEnabled: boolean;
  pixelRatio: number;
  renderer: WebGLRenderer;
  composer: EffectComposer;
  effectColorCorrection?: ShaderPass;
  effectColorPalette?: ShaderPass;
  effectSharpen?: ShaderPass;

  constructor(props: GameProps) {
    this.gameProps = props;
    this.currScene = new LoadingScene(props);
    this.imageDisplayer = imageDisplayer;
    this.prevTime = performance.now();
    this.enabled = true;
    this.controlsEnabled = false;
    this.firstPlayClick = true;
    this.pixelRatio = 1;
    this.renderer = new WebGLRenderer({
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = BasicShadowMap;
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
    this.updateSharpenSize(width, height);
    this.updateRenderer(0);
  };

  updateSharpenSize(width: number, height: number) {
    if (!this.effectSharpen) {
      return;
    }
    this.effectSharpen.uniforms.width.value = width;
    this.effectSharpen.uniforms.height.value = height;
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
      movementX
    );
  }

  setEnabled(newValue: boolean) {
    if (!this.enabled && newValue) {
      this.prevTime = performance.now();
    }
    if (!newValue) {
      this.pauseMusic();
    } else {
      this.resumeMusic();
    }
    this.enabled = newValue;
    this.controlsEnabled = newValue;
  }

  onPlayClick() {
    if (!this.firstPlayClick) {
      return;
    }
    this.currScene.playAmbientMusic();
    this.firstPlayClick = false;
  }

  loadResources(onLoad: () => void) {
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
    audioStoreSfx.loadSounds(gameSounds, onLoadSome, onSoundsProgress);
    audioStoreMusic.loadSounds(gameSoundsMusic, () => { }, () => { });
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
    // Cleanup previous scene's resources
    if (this.currScene.destroy) {
      this.currScene.destroy();
    } else {
      this.currScene.entitiesContainer.onDestroy();
    }
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
    this.effectSharpen = new ShaderPass(SharpenShader);
    const rendererSize = new Vector2();
    this.renderer.getSize(rendererSize);
    this.updateSharpenSize(rendererSize.x, rendererSize.y);
    this.composer.addPass(this.effectSharpen);
    new LUTImageLoader()
      .load(`film_default.png`, (result: { size: number; texture3D: Data3DTexture; }) => {
        if (this.effectColorPalette) {
          this.effectColorPalette.uniforms.lut.value = result.texture3D;
          this.effectColorPalette.uniforms.lutSize.value = result.texture3D.image.width;
        }
      });
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

  updateMusicVolume = (value: number) => {
    globalSettings.setSetting('musicVolume', value);
  };

  updateFov = (value: number) => {
    globalSettings.setSetting('fov', value);
  };

  pauseMusic() {
    this.currScene.pauseMusic();
  }

  resumeMusic() {
    this.currScene.resumeMusic();
  }

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
