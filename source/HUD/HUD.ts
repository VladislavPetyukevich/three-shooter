import { Scene, OrthographicCamera, SpriteMaterial, Sprite } from 'three';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GAME_TEXTURE_NAME, PLAYER } from '@/constants';
import { SpriteSheet } from '@/SpriteSheet';
import { GunHudTextures } from '@/Entities/Gun/Gun';
import { TimeoutsManager } from '@/TimeoutsManager';
import { EaseProgress, easeInSine } from '@/EaseProgress';

const CAMERA_NEAR = -500;
const CAMERA_FAR = 1000;

export class HUD {
  scene: Scene;
  camera: OrthographicCamera;
  visible: boolean;
  spriteSheet?: SpriteSheet;
  gun: Sprite;
  gunHudTextures?: GunHudTextures;
  nextGunHudTextures?: GunHudTextures;
  gunSpriteHeight: number;
  swithGunAnimationProgress?: EaseProgress;
  swithGunAnimationStage: 'goingDown' | 'goingUp';
  isGunSwitchAnimationStarted: boolean;
  damageOverlay: Sprite;
  bobState: {
    sinTable: number[];
    currentSinTableIndex: number;
    timeoutsManager: TimeoutsManager<'bob'>;
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
    this.gunSpriteHeight = 0;
    this.damageOverlay = new Sprite();
    this.handleResize();
    this.maxHp = PLAYER.HP;
    this.maxDamageOverlayOpacity = 0.6;
    this.bobState = this.getInitialBobState();
    this.isGunSwitchAnimationStarted = false;
    this.swithGunAnimationStage = 'goingDown';
  }

  getInitialBobState() {
    return {
      sinTable: this.generateSinTable(10, 1.8),
      currentSinTableIndex: 0,
      timeoutsManager: new TimeoutsManager({ bob: 0.001 }),
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
    if (!this.gunHudTextures) {
      this.gunHudTextures = textures;
      this.updateGunTextures();
      return;
    }
    this.swithGunAnimationStage = 'goingDown';
    this.initGunSwithAnimationProgress();
    this.isGunSwitchAnimationStarted = true;
    this.nextGunHudTextures = textures;
  }

  updateGunTextures() {
    const gunHudTextures = this.nextGunHudTextures || this.gunHudTextures;
    if (!gunHudTextures) {
      return;
    }
    this.spriteSheet = new SpriteSheet({
      textures: [gunHudTextures.idle, gunHudTextures.fire],
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
    this.bobState.timeoutsManager.updateTimeOut('bob', delta);
    if (this.bobState.timeoutsManager.checkIsTimeOutExpired('bob')) {
      this.bobState.timeoutsManager.updateExpiredTimeOuts();
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
    this.gunSpriteHeight = -height + gunScale / 2;
    this.gun.scale.set(gunScale, gunScale, 1);
    this.gun.position.set(0.5, this.gunSpriteHeight, 1);
    this.bobState = this.getInitialBobState();
    const damageOverlayWidth = width * 2;
    const damageOverlayHeight = height * 2;
    this.damageOverlay.scale.set(
      damageOverlayWidth,
      damageOverlayHeight,
      1
    );
    this.initGunSwithAnimationProgress();
  }

  initGunSwithAnimationProgress() {
    const topValue = this.gunSpriteHeight;
    const bottomValue = this.gunSpriteHeight * 2.2;
    this.swithGunAnimationProgress = new EaseProgress({
      minValue: (this.swithGunAnimationStage === 'goingDown') ? topValue : bottomValue,
      maxValue: (this.swithGunAnimationStage === 'goingDown') ? bottomValue : topValue,
      progressSpeed: 2.5,
      transitionFunction: easeInSine,
    });
  }

  update(delta: number) {
    if (this.isGunSwitchAnimationStarted) {
      this.updateGunSwithAnimation(delta);
    }
  }

  updateGunSwithAnimation(delta: number) {
    if (this.swithGunAnimationProgress?.checkIsProgressCompelete()) {
      this.updateCompleteGunSwitchAnimation();
      return;
    }
    if (!this.swithGunAnimationProgress) {
      return;
    }
    this.gun.position.y = this.swithGunAnimationProgress.getCurrentProgress();
    this.swithGunAnimationProgress.updateProgress(delta);
  }

  updateCompleteGunSwitchAnimation() {
    if (this.swithGunAnimationStage === 'goingUp') {
      this.isGunSwitchAnimationStarted = false;
      return;
    }
    this.swithGunAnimationStage = 'goingUp';
    this.updateGunTextures();
    this.initGunSwithAnimationProgress();
  }
}

export const hud = new HUD();
