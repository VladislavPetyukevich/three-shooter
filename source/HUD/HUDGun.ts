import { Sprite } from 'three';
import { SpriteSheet } from '@/SpriteSheet';
import { GunHudTextures } from '@/Entities/Gun/Gun';
import { TimeoutsManager } from '@/TimeoutsManager';
import { EaseProgress, easeInSine } from '@/EaseProgress';
import { SinTable } from '@/SinTable';

export class HUDGun {
  visible: boolean;
  isRunning: boolean;
  spriteSheet?: SpriteSheet;
  sprite: Sprite;
  targetX: number;
  xMax: number;
  currX: number;
  shiftAmplitude: number;
  shiftSpeed: number;
  hudTextures?: GunHudTextures;
  nextHudTextures?: GunHudTextures;
  originalRedColor: number;
  spriteHeight: number;
  swithAnimationProgress?: EaseProgress;
  swithAnimationStage: 'goingDown' | 'goingUp';
  isSwitchAnimationStarted: boolean;
  bobState: {
    sinTable: SinTable;
    currentSinValue: number;
    timeoutsManager: TimeoutsManager<'bob'>;
  };

  constructor() {
    this.visible = false;

    this.sprite = new Sprite();
    this.targetX = 0;
    this.currX = 0;
    this.shiftAmplitude = 40;
    this.shiftSpeed = 4;
    this.xMax = 40;
    this.spriteHeight = 0;
    this.originalRedColor = 0;
    this.bobState = this.getInitialBobState();
    this.isSwitchAnimationStarted = false;
    this.swithAnimationStage = 'goingDown';
    this.isRunning = false;

    this.updateTextures();
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

  show() {
    this.updateTextures();
  }

  hide() {
    const isFirstTimeReset = !this.hudTextures;
    if (!isFirstTimeReset) {
      this.updateHeatLevel(0);
    }
    this.hudTextures = undefined;
    this.nextHudTextures = undefined;
    this.updateTextures();
  }

  setTextures(textures: GunHudTextures) {
    const isFirstTimeUpdate = !this.hudTextures;
    if (isFirstTimeUpdate) {
      this.sprite.position.y = this.spriteHeight * 1.3;
      this.hudTextures = textures;
      this.updateTextures();
    } else {
      this.nextHudTextures = textures;
    }
    this.swithAnimationStage = isFirstTimeUpdate ? 'goingUp' : 'goingDown';
    this.initSwithAnimationProgress();
    this.isSwitchAnimationStarted = true;
  }

  updateTextures() {
    const hudTextures = this.nextHudTextures || this.hudTextures;
    if (!hudTextures) {
      this.sprite.visible = false;
      return;
    } else {
      this.sprite.visible = true;
    }
    this.spriteSheet = new SpriteSheet({
      textures: [hudTextures.idle, hudTextures.fire],
      material: this.sprite.material,
    });
    this.sprite.material.needsUpdate = true;
    this.originalRedColor = this.sprite.material.color.r;
  }

  updateHeatLevel(heatLevel: number) {
    const newRedColor = this.originalRedColor + heatLevel * 8;
    this.sprite.material.color.r = newRedColor;
  }

  fire() {
    if(this.spriteSheet && this.spriteSheet.currentIndex !== 1) {
      this.spriteSheet.displaySprite(1);
    }
  }

  idle() {
    if(this.spriteSheet && this.spriteSheet.currentIndex !== 0) {
      this.spriteSheet.displaySprite(0);
    }
  }

  lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  handleResize(height: number) {
    this.bobState = this.getInitialBobState();
    const scale = height * 0.75;
    this.spriteHeight = -height + scale / 2;
    this.sprite.scale.set(scale * 2, scale, 1);
    this.sprite.position.set(0, this.spriteHeight - this.bobState.currentSinValue, 1);
    this.initSwithAnimationProgress();
  }

  initSwithAnimationProgress() {
    const topValue = 0;
    const bottomValue = this.spriteHeight * 1.3;
    this.swithAnimationProgress = new EaseProgress({
      minValue: (this.swithAnimationStage === 'goingDown') ? topValue : bottomValue,
      maxValue: (this.swithAnimationStage === 'goingDown') ? bottomValue : topValue,
      progressSpeed: 4,
      transitionFunction: easeInSine,
    });
  }

  setTranslateY(translateY: number) {
    this.sprite.position.y = this.spriteHeight + translateY;
  }

  addShiftX(shiftX: number) {
    this.targetX -= shiftX * this.shiftAmplitude;
  }

  getTargetX() {
    const targetX = Number(this.targetX);
    if (targetX > this.xMax) {
      return this.xMax;
    } else if (targetX < -this.xMax) {
      return -this.xMax;
    }
    return targetX;
  }

  update(delta: number) {
    let currentTranslateY = -this.bobState.currentSinValue;
    if (this.isSwitchAnimationStarted) {
      currentTranslateY += this.swithAnimationProgress?.getCurrentProgress() || 0;
      this.updateSwitchAnimation(delta);
    }
    if (this.isRunning) {
      this.updateBob(delta);
    }
    this.setTranslateY(currentTranslateY);

    const targetX = this.getTargetX();
    this.targetX = this.lerp(
      targetX,
      0,
      delta * this.shiftSpeed
    );
    this.sprite.position.setX(targetX - this.currX);
  }

  updateSwitchAnimation(delta: number) {
    if (this.swithAnimationProgress?.checkIsProgressCompelete()) {
      this.updateCompleteSwitchAnimation();
      return;
    }
    if (!this.swithAnimationProgress) {
      return;
    }
    this.swithAnimationProgress.updateProgress(delta);
  }

  updateCompleteSwitchAnimation() {
    if (this.swithAnimationStage === 'goingUp') {
      this.isSwitchAnimationStarted = false;
      return;
    }
    this.swithAnimationStage = 'goingUp';
    this.updateTextures();
    this.initSwithAnimationProgress();
  }

  updateBob(delta: number) {
    this.bobState.timeoutsManager.updateTimeOut('bob', delta);
    if (this.bobState.timeoutsManager.checkIsTimeOutExpired('bob')) {
      this.bobState.timeoutsManager.updateExpiredTimeOuts();
      this.bobState.currentSinValue = this.bobState.sinTable.getNextSinValue();
    }
  }
}
