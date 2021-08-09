import {
  Scene,
  PerspectiveCamera,
  AudioListener
} from 'three';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { globalSettings } from '@/GlobalSettings';

export interface BasicSceneProps {
  renderWidth: number;
  renderHeight: number;
};

export class BasicScene {
  scene: Scene;
  camera: PerspectiveCamera;
  audioListener: AudioListener;
  entitiesContainer: EntitiesContainer;

  constructor(props: BasicSceneProps) {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(95, props.renderWidth / props.renderHeight, 0.1, 1000);

    this.audioListener = new AudioListener();
    this.setAudioVolume(globalSettings.getSetting('audioVolume'));
    this.camera.add(this.audioListener);

    globalSettings.addUpdateListener(this.onUpdateGlobalSettings);

    this.entitiesContainer = new EntitiesContainer(this.scene);
  }

  onUpdateGlobalSettings = () => {
    this.setAudioVolume(globalSettings.getSetting('audioVolume'));
  }

  setAudioVolume(value: number) {
    this.audioListener.setMasterVolume(value);
  }

  update(delta: number) {
    this.entitiesContainer.update(delta);
  }
}
