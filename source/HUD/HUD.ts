import { Scene, OrthographicCamera, SpriteMaterial, Sprite  } from 'three';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GAME_TEXTURE_NAME, PLAYER } from '@/constants';
import { SpriteSheet } from '@/SpriteSheet';

const CAMERA_NEAR = -500;
const CAMERA_FAR = 1000;

export class HUD {
  scene: Scene;
  camera: OrthographicCamera;
  visible: boolean;
  spriteSheet?: SpriteSheet;
  gun: Sprite;
  damageOverlay: Sprite;
  sinTable: number[];
  currentSinTableIndex: number;
  bobTimeout: number;
  maxBobTimeout: number;
  maxHp: number;
  maxDamageOverlayOpacity: number;

  constructor() {
    this.scene = new Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, CAMERA_NEAR, CAMERA_FAR);
    this.visible = false;

    this.gun = new Sprite();
    this.damageOverlay = new Sprite();
    this.handleResize();
    this.sinTable = this.generateSinTable(10, 1.8);
    this.currentSinTableIndex = 0;
    this.bobTimeout = 0;
    this.maxBobTimeout = 0.001;
    this.maxHp = PLAYER.HP;
    this.maxDamageOverlayOpacity = 0.6;
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
    this.scene.remove(this.damageOverlay);
  }

  show() {
    const gunMaterial = new SpriteMaterial();
    const gunTexture = texturesStore.getTexture(GAME_TEXTURE_NAME.gunTextureFile);
    const gunFireTexture = texturesStore.getTexture(GAME_TEXTURE_NAME.gunFireFile);
    this.spriteSheet = new SpriteSheet({
      textures: [gunTexture, gunFireTexture],
      material: gunMaterial
    });
    this.gun.material = gunMaterial;
    const damageOverlayMaterial = new SpriteMaterial({
      map: texturesStore.getTexture(GAME_TEXTURE_NAME.damageEffect),
      opacity: 0,
    });
    this.damageOverlay.material = damageOverlayMaterial;
    this.visible = true;
    this.scene.add(this.gun);
    this.scene.add(this.damageOverlay);
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

  updateHp(hp: number) {
    const hpNormalized = hp / this.maxHp;
    const damageOverlayOpacity =
      this.lerp(this.maxDamageOverlayOpacity, 0, hpNormalized);
    this.damageOverlay.material.opacity = damageOverlayOpacity;
  }

  lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
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
    const damageOverlayWidth = width * 2;
    const damageOverlayHeight = height * 2;
    this.damageOverlay.scale.set(
      damageOverlayWidth,
      damageOverlayHeight,
      1
    );
  }
}

export const hud = new HUD();
