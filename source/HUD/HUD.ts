import { Scene, OrthographicCamera, SpriteMaterial, Sprite } from 'three';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { PLAYER } from '@/constants';
import { SpriteSheet } from '@/SpriteSheet';
import { GunHudTextures } from '@/Entities/Gun/Gun';
import { TimeoutsManager } from '@/TimeoutsManager';
import { EaseProgress, easeInSine } from '@/EaseProgress';
import { SinTable } from '@/SinTable';

const CAMERA_NEAR = -500;
const CAMERA_FAR = 1000;

export class HUD {
  scene: Scene;
  camera: OrthographicCamera;
  visible: boolean;
  isRunning: boolean;
  spriteSheet?: SpriteSheet;
  gun: Sprite;
  gunTargetX: number;
  gunXMax: number;
  gunCurrX: number;
  gunShiftAmplitude: number;
  gunShiftSpeed: number;
  gunHudTextures?: GunHudTextures;
  nextGunHudTextures?: GunHudTextures;
  gunOriginalRedColor: number;
  gunSpriteHeight: number;
  swithGunAnimationProgress?: EaseProgress;
  swithGunAnimationStage: 'goingDown' | 'goingUp';
  isGunSwitchAnimationStarted: boolean;
  damageOverlay: Sprite;
  bobState: {
    sinTable: SinTable;
    currentSinValue: number;
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
    this.gunTargetX = 0;
    this.gunCurrX = 0;
    this.gunShiftAmplitude = 40;
    this.gunShiftSpeed = 4;
    this.gunXMax = 40;
    this.gunSpriteHeight = 0;
    this.gunOriginalRedColor = 0;
    this.damageOverlay = new Sprite();
    this.maxHp = PLAYER.HP;
    this.maxDamageOverlayOpacity = 0.8;
    this.bobState = this.getInitialBobState();
    this.isGunSwitchAnimationStarted = false;
    this.swithGunAnimationStage = 'goingDown';
    this.isRunning = false;
  }

  setIsRunning(isRunning: boolean) {
    this.isRunning = isRunning;
  }

  getInitialBobState() {
    const sinTable = new SinTable({
      step: 10,
      amplitude: 20,
    });
    const sinTableMinValue = Math.min.apply(undefined, sinTable.values);
    const sinTableNormalizer = (val: number) => val - sinTableMinValue;
    sinTable.mapValues(sinTableNormalizer);
    return {
      sinTable: sinTable,
      currentSinValue: sinTable.getNextSinValue(),
      timeoutsManager: new TimeoutsManager({ bob: 0.021 }),
    };
  }

  hide() {
    this.visible = false;
    this.scene.remove(this.gun);
    this.scene.remove(this.damageOverlay);
  }

  reset() {
    this.hide();
    const isFirstTimeReset = !this.gunHudTextures;
    if (!isFirstTimeReset) {
      this.updateGunHeatLevel(0);
    }
    this.gunHudTextures = undefined;
    this.nextGunHudTextures = undefined;
    this.show();
  }

  show() {
    const damageOverlayMaterial = new SpriteMaterial({
      map: texturesStore.getTexture('damageEffect'),
      opacity: 0,
    });
    this.damageOverlay.material = damageOverlayMaterial;
    this.scene.add(this.damageOverlay);
    const gunHudTextures = this.nextGunHudTextures || this.gunHudTextures;
    if (gunHudTextures) {
      this.updateGunTextures();
      this.scene.add(this.gun);
    }
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
    this.gunOriginalRedColor = this.gun.material.color.r;
  }

  updateGunHeatLevel(heatLevel: number) {
    const newRedColor = this.gunOriginalRedColor + heatLevel * 8;
    this.gun.material.color.r = newRedColor;
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

  handleResize(width: number, height: number) {
    this.camera = new OrthographicCamera(-width, width, height, -height, CAMERA_NEAR, CAMERA_FAR);
    this.bobState = this.getInitialBobState();
    const gunScale = height * 0.75;
    this.gunSpriteHeight = -height + gunScale / 2;
    this.gun.scale.set(gunScale * 2, gunScale, 1);
    this.gun.position.set(0, this.gunSpriteHeight - this.bobState.currentSinValue, 1);
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
      progressSpeed: 4,
      transitionFunction: easeInSine,
    });
  }

  setGunTranslateY(translateY: number) {
    this.gun.position.y = this.gunSpriteHeight + translateY;
  }

  addGunShiftX(shiftX: number) {
    this.gunTargetX -= shiftX * this.gunShiftAmplitude;
  }

  getGunTargetX() {
    const gunTargetX = Number(this.gunTargetX);
    if (gunTargetX > this.gunXMax) {
      return this.gunXMax;
    } else if (gunTargetX < -this.gunXMax) {
      return -this.gunXMax;
    }
    return gunTargetX;
  }

  update(delta: number) {
    let currentGunTranslateY = -this.bobState.currentSinValue;
    if (this.isGunSwitchAnimationStarted) {
      currentGunTranslateY += this.swithGunAnimationProgress?.getCurrentProgress() || 0;
      this.updateGunSwitchAnimation(delta);
    }
    if (this.isRunning) {
      this.updateGunBob(delta);
    }
    this.setGunTranslateY(currentGunTranslateY);

    const gunTargetX = this.getGunTargetX();
    this.gunTargetX = this.lerp(
      gunTargetX,
      0,
      delta * this.gunShiftSpeed
    );
    this.gun.position.setX(gunTargetX - this.gunCurrX);
  }

  updateGunSwitchAnimation(delta: number) {
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
      this.bobState.currentSinValue = this.bobState.sinTable.getNextSinValue();
    }
  }
}

export const hud = new HUD();
