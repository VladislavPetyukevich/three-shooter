import {
  Scene,
  PerspectiveCamera,
  AudioListener
} from 'three';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { globalSettings } from '@/GlobalSettings';
import { AudioSlices } from './AudioSlices';
import { BackgroundMusic } from './BackgroundMusic';
import { AudioSliceName, gameAudioSlices } from '@/constantsAssets';

export interface BasicSceneProps {
  renderWidth: number;
  renderHeight: number;
};

export class BasicScene {
  scene: Scene;
  camera: PerspectiveCamera;
  audioListener: AudioListener;
  audioSlices: AudioSlices<AudioSliceName>;
  backgroundMusic: BackgroundMusic;
  entitiesContainer: EntitiesContainer;

  constructor(props: BasicSceneProps) {
    this.scene = new Scene();
    const fov = globalSettings.getSetting('fov') || 95;
    this.camera = new PerspectiveCamera(fov, props.renderWidth / props.renderHeight, 0.1, 1000);

    this.audioListener = new AudioListener();
    this.audioSlices = new AudioSlices(this.audioListener, gameAudioSlices);
    this.backgroundMusic = new BackgroundMusic(this.audioListener);
    this.setAudioVolume(globalSettings.getSetting('audioVolume'));
    this.camera.add(this.audioListener);

    globalSettings.addUpdateListener(this.onUpdateGlobalSettings);

    this.entitiesContainer = new EntitiesContainer(this.scene);
  }

  onUpdateGlobalSettings = () => {
    this.setAudioVolume(globalSettings.getSetting('audioVolume'));
    this.setFov(globalSettings.getSetting('fov'));
  }

  setAudioVolume(value: number) {
    this.audioListener.setMasterVolume(value);
  }

  setFov(fov: number) {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  update(delta: number) {
    this.entitiesContainer.update(delta);
    this.backgroundMusic.update();
  }

  playAmbientMusic(): void {
    this.backgroundMusic.playPlaylist('ambient');
  }

  playCombatMusic(): void {
    this.backgroundMusic.playPlaylist('combat');
  }

  pauseMusic(): void {
    this.backgroundMusic.pause();
  }

  resumeMusic(): void {
    this.backgroundMusic.resume();
  }

  destroy(): void {
    this.backgroundMusic.destroy();
    globalSettings.removeUpdateListener(this.onUpdateGlobalSettings);
  }
}
