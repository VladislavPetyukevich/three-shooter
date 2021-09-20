import { Scene, OrthographicCamera, SpriteMaterial, Sprite  } from 'three';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GAME_TEXTURE_NAME, HUD as HUD_CONSTANTS } from '@/constants';
import { SpriteSheet } from '@/SpriteSheet';
import { HUDStats } from './HUDStats';

const CAMERA_NEAR = -500;
const CAMERA_FAR = 1000;

export class HUD {
  scene: Scene;
  camera: OrthographicCamera;
  visible: boolean;
  spriteSheet?: SpriteSheet;
  gun: Sprite;
  hudStats: HUDStats;
  sinTable: number[];
  currentSinTableIndex: number;
  bobTimeout: number;
  maxBobTimeout: number;

  constructor() {
    this.scene = new Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, CAMERA_NEAR, CAMERA_FAR);
    this.visible = false;

    this.gun = new Sprite();
    this.hudStats = new HUDStats({
      size: HUD_CONSTANTS.STATS_SIZE,
      color: HUD_CONSTANTS.COLORS.stats,
      fontSize: HUD_CONSTANTS.STATS_FONT_SIZE
    });
    this.handleResize();
    this.sinTable = this.generateSinTable(10, 1.8);
    this.currentSinTableIndex = 0;
    this.bobTimeout = 0;
    this.maxBobTimeout = 0.001;
  }

  generateSinTable(step: number, amplitude: number) {
    const toRadians = (degrees:number) => {
      return degrees * (Math.PI / 180);
    }
    const sinTable = [];
    for (let i = 0; i < 360; i+=step) {
      const sinValue = Math.sin(toRadians(i));
      sinTable.push(amplitude * sinValue);
    }
    return sinTable;
  }

  hide() {
    this.visible = false;
    this.scene.remove(this.gun);
    this.scene.remove(this.hudStats.sprite);
  }

  show() {
    this.visible = true;
    this.scene.add(this.gun);
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

  gunBob(delta: number) {
    this.bobTimeout += delta;
    if (this.bobTimeout >= this.maxBobTimeout) {
      this.bobTimeout = 0;
      const sinValue = this.getNextSinValue();
      this.gun.translateY(-sinValue);
    }
  }

  getNextSinValue() {
    if (this.currentSinTableIndex === this.sinTable.length - 1) {
      this.currentSinTableIndex = 0;
    } else {
      this.currentSinTableIndex++;
    }
    return this.sinTable[this.currentSinTableIndex];
  }


  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, CAMERA_NEAR, CAMERA_FAR);
    const gunScale = height * 0.75;
    this.gun.scale.set(gunScale, gunScale, 1);
    this.gun.position.set(0.5, -height + gunScale / 2, 1);

    const mapScale = gunScale / 2;
    const statsX = width - mapScale / 2;
    const statsY = -height + mapScale / 2;
    this.hudStats.sprite.scale.set(mapScale, mapScale, 1);
    this.hudStats.sprite.position.set(statsX, statsY, 1);
  }

  update() {
    this.hudStats.update();
  }
}

export const hud = new HUD();
