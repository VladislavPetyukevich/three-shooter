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
  isRunning: boolean;
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
    this.maxHp = PLAYER.HP;
    this.maxDamageOverlayOpacity = 0.6;
    this.bobState = this.getInitialBobState();
    this.isGunSwitchAnimationStarted = false;
    this.swithGunAnimationStage = 'goingDown';
    this.isRunning = false;
    this.handleResize();
  }

  setIsRunning(isRunning: boolean) {
    this.isRunning = isRunning;
  }

  getInitialBobState() {
    const sinTable = this.generateSinTable({
      step: 10,
      amplitude: 20,
    });
    const sinTableMinValue = Math.min.apply(undefined, sinTable);
    const sinTableNormalized = sinTable.map(val => val - sinTableMinValue);
    return {
      sinTable: sinTableNormalized,
      currentSinTableIndex: 0,
      timeoutsManager: new TimeoutsManager({ bob: 0.001 }),
    };
  }

  generateSinTable(
    { step, amplitude }: { step: number; amplitude: number; }
  ) {
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
    const gunHudTextures = this.nextGunHudTextures || this.gunHudTextures;
    if (!gunHudTextures) {
      return;
    }
    this.updateGunTextures();
    const damageOverlayMaterial = new SpriteMaterial({
      map: texturesStore.getTexture(GAME_TEXTURE_NAME.damageEffect),
      opacity: 0,
    });
    this.damageOverlay.material = damageOverlayMaterial;
    this.scene.add(this.gun);
    this.scene.add(this.damageOverlay);
    this.visible = true;
  }

  setGunTextures(textures: GunHudTextures) {
    const isFirstTimeUpdate = !this.gunHudTextures;
    if (isFirstTimeUpdate) {
      this.gun.position.y = this.gunSpriteHeight * 1.3;
      this.gunHudTextures = textures;
      this.updateGunTextures();
      this.scene.add(this.gun);
    } else {
      this.nextGunHudTextures = textures;
    }
    this.swithGunAnimationStage = isFirstTimeUpdate ? 'goingUp' : 'goingDown';
    this.initGunSwithAnimationProgress();
    this.isGunSwitchAnimationStarted = true;
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

  updateHp(hp: number) {
    const hpNormalized = hp / this.maxHp;
    const damageOverlayOpacity =
      this.lerp(this.maxDamageOverlayOpacity, 0, hpNormalized);
    this.damageOverlay.material.opacity = damageOverlayOpacity;
  }

  lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  getCurrentSinValue() {
    return this.bobState.sinTable[this.bobState.currentSinTableIndex];
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, CAMERA_NEAR, CAMERA_FAR);
    const gunScale = height * 0.75;
    this.gunSpriteHeight = -height + gunScale / 2;
    this.gun.scale.set(gunScale, gunScale, 1);
    this.gun.position.set(0.5, this.gunSpriteHeight - this.getCurrentSinValue(), 1);
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
    const topValue = 0;
    const bottomValue = this.gunSpriteHeight * 1.3;
    this.swithGunAnimationProgress = new EaseProgress({
      minValue: (this.swithGunAnimationStage === 'goingDown') ? topValue : bottomValue,
      maxValue: (this.swithGunAnimationStage === 'goingDown') ? bottomValue : topValue,
      progressSpeed: 2.5,
      transitionFunction: easeInSine,
    });
  }

  setGunTranslateY(translateY: number) {
    this.gun.position.y = this.gunSpriteHeight + translateY;
  }

  update(delta: number) {
    let currentGunTranslateY = -this.getCurrentSinValue();
    if (this.isGunSwitchAnimationStarted) {
      currentGunTranslateY += this.swithGunAnimationProgress?.getCurrentProgress() || 0;
      this.updateGunSwithAnimation(delta);
    }
    if (this.isRunning) {
      this.updateGunBob(delta);
    }
    this.setGunTranslateY(currentGunTranslateY);
  }

  updateGunSwithAnimation(delta: number) {
    if (this.swithGunAnimationProgress?.checkIsProgressCompelete()) {
      this.updateCompleteGunSwitchAnimation();
      return;
    }
    if (!this.swithGunAnimationProgress) {
      return;
    }
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

  updateGunBob(delta: number) {
    this.bobState.timeoutsManager.updateTimeOut('bob', delta);
    if (this.bobState.timeoutsManager.checkIsTimeOutExpired('bob')) {
      this.bobState.timeoutsManager.updateExpiredTimeOuts();
      if (this.bobState.currentSinTableIndex === this.bobState.sinTable.length - 1) {
        this.bobState.currentSinTableIndex = 0;
      } else {
        this.bobState.currentSinTableIndex++;
      }
    }
  }
}

export const hud = new HUD();
