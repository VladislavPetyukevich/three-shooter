import { Scene, OrthographicCamera, SpriteMaterial, Sprite, Vector3, Euler } from 'three';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GAME_TEXTURE_NAME, HUD as HUD_CONSTANTS, WALL } from '@/constants';
import { SpriteSheet } from '@/SpriteSheet';
import { GeneratorCell } from '@/dungeon/DungeonGenerator';
import { HUDMap } from './HUDMap';
import { HUDStats } from './HUDStats';

const CAMERA_NEAR = -500;
const CAMERA_FAR = 1000;

export class HUD {
  scene: Scene;
  camera: OrthographicCamera;
  visible: boolean;
  spriteSheet?: SpriteSheet;
  gun: Sprite;
  hudMap: HUDMap;
  hudStats: HUDStats;

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
    this.hudStats = new HUDStats({
      size: HUD_CONSTANTS.STATS_SIZE,
      color: HUD_CONSTANTS.COLORS.stats,
      fontSize: HUD_CONSTANTS.STATS_FONT_SIZE
    });
    this.handleResize();
  }

  hide() {
    this.visible = false;
    this.scene.remove(this.gun);
    this.scene.remove(this.hudMap.sprite);
    this.scene.remove(this.hudStats.sprite);
  }

  show() {
    this.visible = true;
    this.scene.add(this.gun);
    this.scene.add(this.hudMap.sprite);
    this.scene.add(this.hudStats.sprite);
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

  updateMap(cells: GeneratorCell[][], roomsCount: number) {
    this.hudMap.updateDungeon(cells);
    this.hudStats.init(roomsCount);
  }

  onPlayerMove(meshPosition: Vector3) {
    this.hudMap.updatePlayerPosition(meshPosition);
  }

  onPlayerRotation(cameraRotation: Euler) {
    this.hudMap.updatePlayerRotation(cameraRotation);
  }

  onPlayerChangeRoom(roomIndex: number) {
    this.hudMap.updatePlayerRoom(roomIndex);
  }

  onPlayerFreeRoom(roomIndex: number) {
    this.hudMap.addFreeRoom(roomIndex);
    this.hudStats.addFreeRoom();
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, CAMERA_NEAR, CAMERA_FAR);
    const gunScale = height * 0.75;
    this.gun.scale.set(gunScale, gunScale, 1);
    this.gun.position.set(0.5, -height + gunScale / 2, 1);

    const mapScale = gunScale / 2;
    const mapX = -width + mapScale / 2;
    const mapY = height - mapScale / 2;
    this.hudMap.sprite.scale.set(mapScale, mapScale, 1);
    this.hudMap.sprite.position.set(mapX, mapY, 1);
    const statsX = width - mapScale / 2;
    const statsY = -height + mapScale / 2;
    this.hudStats.sprite.scale.set(mapScale, mapScale, 1);
    this.hudStats.sprite.position.set(statsX, statsY, 1);
  }

  update() {
    this.hudMap.update();
    this.hudStats.update();
  }
}

export const hud = new HUD();
