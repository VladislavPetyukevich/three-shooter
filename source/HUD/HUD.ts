import { Scene, OrthographicCamera, SpriteMaterial, Sprite } from 'three';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GAME_TEXTURE_NAME, PLAYER } from '@/constants';
import { SpriteSheet } from '@/SpriteSheet';
import { GunHudTextures } from '@/Entities/Gun/Gun';

const CAMERA_NEAR = -500;
const CAMERA_FAR = 1000;

export class HUD {
  scene: Scene;
  camera: OrthographicCamera;
  visible: boolean;
  spriteSheet?: SpriteSheet;
  gun: Sprite;
  gunHudTextures?: GunHudTextures;
  damageOverlay: Sprite;
  bobState: {
    sinTable: number[];
    currentSinTableIndex: number;
    currentTimeout: number;
    maxTimeout: number;
  };
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
    this.maxHp = PLAYER.HP;
    this.maxDamageOverlayOpacity = 0.6;
    this.bobState = this.getInitialBobState();
  }

  getInitialBobState() {
    return {
      sinTable: this.generateSinTable(10, 1.8),
      currentSinTableIndex: 0,
      currentTimeout: 0,
      maxTimeout: 0.001,
    };
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
    this.updateGunTextures();
    const damageOverlayMaterial = new SpriteMaterial({
      map: texturesStore.getTexture(GAME_TEXTURE_NAME.damageEffect),
      opacity: 0,
    });
    this.damageOverlay.material = damageOverlayMaterial;
    this.visible = true;
    this.scene.add(this.gun);
    this.scene.add(this.damageOverlay);
  }

  setGunTextures(textures: GunHudTextures) {
    this.gunHudTextures = textures;
    this.updateGunTextures();
  }

  updateGunTextures() {
    if (!this.gunHudTextures) {
      return;
    }
    this.spriteSheet = new SpriteSheet({
      textures: [this.gunHudTextures.idle, this.gunHudTextures.fire],
      material: this.gun.material,
    });
    this.gun.material.needsUpdate = true;
  }

  gunFire() {
    this.spriteSheet && this.spriteSheet.displaySprite(1);
  }

  gunIdle() {
    this.spriteSheet && this.spriteSheet.displaySprite(0);
  }

  gunBob(delta: number) {
    this.bobState.currentTimeout += delta;
    if (this.bobState.currentTimeout >= this.bobState.maxTimeout) {
      this.bobState.currentTimeout = 0;
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
    if (this.bobState.currentSinTableIndex === this.bobState.sinTable.length - 1) {
      this.bobState.currentSinTableIndex = 0;
    } else {
      this.bobState.currentSinTableIndex++;
    }
    return this.bobState.sinTable[this.bobState.currentSinTableIndex];
  }


  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, CAMERA_NEAR, CAMERA_FAR);
    const gunScale = height * 0.75;
    this.gun.scale.set(gunScale, gunScale, 1);
    this.gun.position.set(0.5, -height + gunScale / 2, 1);
    this.bobState = this.getInitialBobState();
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
