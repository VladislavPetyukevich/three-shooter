import { Scene, OrthographicCamera, SpriteMaterial, Sprite } from 'three';
import { texturesStore } from '@/TextureLoader';
import { GAME_TEXTURE_NAME } from '@/constants';
import { SpriteSheet } from './SpriteSheet';

export class HUD {
  scene: Scene;
  camera: OrthographicCamera;
  spriteSheet?: SpriteSheet;

  constructor(visible: boolean) {
    this.scene = new Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, - 500, 1000);

    if (!visible) {
      return;
    }
    const gunMaterial = new SpriteMaterial();
    const gunTexture = texturesStore.getTexture(GAME_TEXTURE_NAME.gunTextureFile);
    const gunFireTexture = texturesStore.getTexture(GAME_TEXTURE_NAME.gunFireFile);
    this.spriteSheet = new SpriteSheet({
      textures: [gunTexture, gunFireTexture],
      material: gunMaterial
    });
    const gun = new Sprite(gunMaterial);
    const gunMaxScaleWidth = width * 0.5;
    const gunMaxScaleHeight = height * 0.5;
    const gunScale = Math.max(gunMaxScaleWidth, gunMaxScaleHeight);
    gun.scale.set(gunScale, gunScale, 1);
    gun.position.set(0.5, -height + gunScale / 2, 1);
    this.scene.add(gun);

    document.addEventListener('click', () => this.shoot());
  }

  shoot() {
    if (!this.spriteSheet) {
      return;
    }
    this.spriteSheet.displaySprite(1);
    setTimeout(() => this.spriteSheet && this.spriteSheet.displaySprite(0), 300);
  }
}
