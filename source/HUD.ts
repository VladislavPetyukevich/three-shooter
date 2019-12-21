import { Scene, OrthographicCamera, SpriteMaterial, Sprite } from 'three';
import { textureLoader } from '@/TextureLoader';
import gunTextureFile from './assets/gun.png';

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
    const gunMaxScaleWidth = width * 0.5;
    const gunMaxScaleHeight = height * 0.5;
    const gunScale = Math.max(gunMaxScaleWidth, gunMaxScaleHeight);
    gun.scale.set(gunScale, gunScale, 1);
    gun.position.set(0.5, -height + gunScale / 2, 1);
    this.scene.add(gun);
  }
}
