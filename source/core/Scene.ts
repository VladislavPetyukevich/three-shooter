import {
  Scene,
  PerspectiveCamera,
  AudioListener
} from 'three';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

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
    this.camera = new PerspectiveCamera(75, props.renderWidth / props.renderHeight, 0.1, 1000);

    this.audioListener = new AudioListener();
    this.camera.add(this.audioListener);

    this.entitiesContainer = new EntitiesContainer(this.scene);
  }

  update(delta: number) {
    this.entitiesContainer.update(delta);
  }
}
