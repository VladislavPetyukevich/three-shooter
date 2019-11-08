import { TextureLoader, Scene, OrthographicCamera, SpriteMaterial, Sprite } from 'three';
import gunTextureFile from './assets/gun.png';

const textureLoader = new TextureLoader();

export class HUD {
  scene: Scene;
  camera: OrthographicCamera;

  constructor() {
    this.scene = new Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, - 500, 1000);

    const gunTexture = textureLoader.load(gunTextureFile);
    const gunMaterial = new SpriteMaterial({ map: gunTexture });
    const gun = new Sprite(gunMaterial);
    const gunWidth = width * 0.5;
    const gunHeight = width * 0.5;
    gun.scale.set(gunWidth, gunHeight, 1);
    gun.position.set(0.5, -height + gunHeight / 2, 1);
    this.scene.add(gun);
  }
}
