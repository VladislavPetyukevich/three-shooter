import { Scene, OrthographicCamera, SpriteMaterial, Sprite, Vector3, Euler } from 'three';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GAME_TEXTURE_NAME, HUD as HUD_CONSTANTS, WALL } from '@/constants';
import { SpriteSheet } from '@/SpriteSheet';
import { GeneratorCell } from '@/dungeon/DungeonGenerator';
import { HUDMap } from './HUDMap';

const CAMERA_NEAR = -500;
const CAMERA_FAR = 1000;

export class HUD {
  scene: Scene;
  camera: OrthographicCamera;
  visible: boolean;
  spriteSheet?: SpriteSheet;
  gun: Sprite;
  hudMap: HUDMap;

  constructor() {
    this.scene = new Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, CAMERA_NEAR, CAMERA_FAR);
    this.visible = false;

    this.gun = new Sprite();
    this.hudMap = new HUDMap({
      mapSize: HUD_CONSTANTS.MAP_SIZE,
      renderDistance: HUD_CONSTANTS.MAP_RENDER_DISTANCE,
      wallPixelSize: WALL.SIZE,
      colors: HUD_CONSTANTS.COLORS
    });
    this.handleResize();
  }

  hide() {
    this.visible = false;
    this.scene.remove(this.gun);
    this.scene.remove(this.hudMap.sprite);
  }

  show() {
    this.visible = true;
    this.scene.add(this.gun);
    this.scene.add(this.hudMap.sprite);
    const gunMaterial = new SpriteMaterial();
    const gunTexture = texturesStore.getTexture(GAME_TEXTURE_NAME.gunTextureFile);
    const gunFireTexture = texturesStore.getTexture(GAME_TEXTURE_NAME.gunFireFile);
    this.spriteSheet = new SpriteSheet({
      textures: [gunTexture, gunFireTexture],
      material: gunMaterial
    });
    this.gun.material = gunMaterial;
  }

  gunFire() {
    this.spriteSheet && this.spriteSheet.displaySprite(1);
  }

  gunIdle() {
    this.spriteSheet && this.spriteSheet.displaySprite(0);
  }

  updateMap(cells: GeneratorCell[][]) {
    this.hudMap.updateDungeon(cells);
  }

  onPlayerMove(meshPosition: Vector3) {
    this.hudMap.updatePlayerPosition(meshPosition);
  }

  onPlayerRotation(cameraRotation: Euler) {
    this.hudMap.updatePlayerRotation(cameraRotation);
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, CAMERA_NEAR, CAMERA_FAR);
    const gunMaxScaleWidth = width * 0.5;
    const gunMaxScaleHeight = height * 0.5;
    const gunScale = Math.max(gunMaxScaleWidth, gunMaxScaleHeight);
    this.gun.scale.set(gunScale, gunScale, 1);
    this.gun.position.set(0.5, -height + gunScale / 2, 1);

    const mapScale = gunScale / 2;
    const mapX = -width + mapScale / 2;
    const mapY = height - mapScale / 2;
    this.hudMap.sprite.scale.set(mapScale, mapScale, 1);
    this.hudMap.sprite.position.set(mapX, mapY, 1);
  }

  update() {
    this.hudMap.update();
  }
}

export const hud = new HUD();
