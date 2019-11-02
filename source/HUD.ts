import { TextureLoader, Scene, OrthographicCamera, SpriteMaterial, Sprite } from 'three';

const textureLoader = new TextureLoader();

export class HUD {
  scene: Scene;
  camera: OrthographicCamera;

  constructor() {
    this.scene = new Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, - 500, 1000);
  }
}
