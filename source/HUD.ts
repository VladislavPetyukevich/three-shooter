import { Scene, OrthographicCamera, SpriteMaterial, Sprite } from 'three';
import { texturesStore } from '@/TextureLoader';
import { GAME_TEXTURE_NAME } from '@/constants';

export class HUD {
  scene: Scene;
  camera: OrthographicCamera;

  constructor(visible: boolean) {
    this.scene = new Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, - 500, 1000);

    if (!visible) {
      return;
    }
    const gunTexture = texturesStore.getTexture(GAME_TEXTURE_NAME.gunTextureFile);
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
