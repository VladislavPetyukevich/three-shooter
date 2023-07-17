import { Scene, OrthographicCamera, SpriteMaterial, Sprite } from 'three';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { PLAYER } from '@/constants';
import { TimeoutsManager } from '@/TimeoutsManager';
import { SinTable } from '@/SinTable';
import { HUDScore } from './HUDScore';
import { HUDGun } from './HUDGun';

const CAMERA_NEAR = -500;
const CAMERA_FAR = 1000;

export class HUD {
  scene: Scene;
  camera: OrthographicCamera;
  gun: HUDGun;
  damageOverlay: Sprite;
  maxHp: number;
  maxDamageOverlayOpacity: number;
  score: HUDScore;
  totalScore: HUDScore;

  constructor() {
    this.scene = new Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, CAMERA_NEAR, CAMERA_FAR);

    this.damageOverlay = new Sprite();
    this.maxHp = PLAYER.HP;
    this.maxDamageOverlayOpacity = 0.8;

    const damageOverlayMaterial = new SpriteMaterial({
      map: texturesStore.getTexture('damageEffect'),
      opacity: 0,
    });
    this.damageOverlay.material = damageOverlayMaterial;

    this.score = new HUDScore({
      size: { width: 256, height: 32 },
      prefix: '💀',
      textAlign: 'center',
    });
    this.scene.add(this.score.sprite);

    this.totalScore = new HUDScore({
      size: { width: 256, height: 32 },
      prefix: '🛒',
    });
    this.scene.add(this.totalScore.sprite);

    this.gun = new HUDGun();
    this.scene.add(this.gun.sprite);
  }

  setIsRunning(isRunning: boolean) {
    this.gun.isRunning = isRunning;
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

  reset() {
    this.hide();
    this.show();
  }

  hide() {
    this.damageOverlay.visible = false;
    this.gun.hide();
  }

  show() {
    this.damageOverlay.visible = true;
    this.gun.show();
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
    const scoreScale = height * 0.1;
    const scoreSpriteHeight = -height + scoreScale / 2;
    this.score.sprite.scale.set(scoreScale * 8, scoreScale, 1);
    this.score.sprite.position.set(0, -scoreSpriteHeight, 1);
    this.totalScore.sprite.scale.set(scoreScale * 8, scoreScale, 1);
    this.totalScore.sprite.position.set(0 - width * 1 + scoreScale * 4, -scoreSpriteHeight, 1);
    const damageOverlayWidth = width * 2;
    const damageOverlayHeight = height * 2;
    this.damageOverlay.scale.set(
      damageOverlayWidth,
      damageOverlayHeight,
      1
    );
    this.gun.handleResize(height);
  }

  update(delta: number) {
    this.gun.update(delta);
  }
}

export const hud = new HUD();
