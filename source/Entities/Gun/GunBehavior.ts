import {
  Camera,
  Vector3,
  Raycaster,
  AudioListener,
  Audio,
  Mesh,
} from 'three';
import { Entity } from '@/core/Entities/Entity';
import { Behavior } from '@/core/Entities/Behavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { audioStore } from '@/core/loaders';
import { PI_180 } from '@/constants';
import { GunFireType } from './Gun';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { randomNumbers } from '@/RandomNumbers';

export interface BehaviorProps {
  playerCamera: Camera;
  holderMesh: Mesh;
  container: EntitiesContainer;
  audioListener: AudioListener;
  shootOffsetAngle: number;
  shootOffsetInMoveAngle: number;
  bulletsPerShoot: number;
  recoilTime: number;
  shootsToMaxHeat: number;
  fireType: GunFireType;
}

export class GunBehavior implements Behavior {
  playerCamera: Camera;
  holderMesh: Mesh;
  bulletAuthor?: Entity;
  raycaster: Raycaster;
  container: EntitiesContainer;
  audioListener: AudioListener;
  shootSound: Audio;
  isShoot: boolean;
  isInMove: boolean;
  isCoolingDown: boolean;
  shootOffsetRadians: number;
  shootOffsetInMoveRadians: number;
  bulletsPerShoot: number;
  recoilTime: number;
  currentRecoilTime: number;
  secToMaxHeatLevel: number;
  heatLevel: number;
  fireType: GunFireType;
  isTriggerPulled: boolean;
  rotationY: number;
  position: Vector3;
  bulletPositionOffset: number;
  lastShootBulletClass?: typeof Bullet;

  constructor(props: BehaviorProps) {
    this.playerCamera = props.playerCamera;
    this.holderMesh = props.holderMesh;
    this.raycaster = new Raycaster();
    this.container = props.container;
    this.audioListener = props.audioListener;
    this.shootSound = new Audio(props.audioListener);
    this.isShoot = false;
    this.isInMove = false;
    this.isCoolingDown = false;
    this.shootOffsetRadians = props.shootOffsetAngle * PI_180;
    this.shootOffsetInMoveRadians = props.shootOffsetInMoveAngle * PI_180;
    this.bulletsPerShoot = props.bulletsPerShoot;
    this.recoilTime = props.recoilTime;
    this.fireType = props.fireType;
    this.isTriggerPulled = false;
    this.rotationY = 0;
    this.position = new Vector3();
    this.currentRecoilTime = 0;
    const shootsPerSec = 1 / (this.recoilTime || 0.16);
    this.secToMaxHeatLevel = props.shootsToMaxHeat / shootsPerSec;
    this.heatLevel = 0;
    const shootSoundBuffer = audioStore.getSound('gunShoot');
    this.shootSound.setBuffer(shootSoundBuffer);
    this.shootSound.isPlaying = false;
    this.bulletPositionOffset = 0;
  }

  handlePullTrigger = () => {
    if (this.isTriggerPulled) {
      return;
    }
    this.isTriggerPulled = true;
  };

  handleReleaseTrigger = () => {
    this.isTriggerPulled = false;
  };

  handleShoot = () => {
    if (this.isShoot) {
      return;
    }
    this.handlePullTrigger();
    this.isShoot = true;
    this.shootSound.play();
  };

  setRotationY(rotation: number) {
    this.rotationY = rotation;
  }

  setPosition(position: Vector3) {
    this.position = position;
  }

  shoot() {
    console.warn('Call shoot method of GunBehavior');
  }

  getAngleOffset() {
    const offset = (this.isInMove) ?
      this.shootOffsetInMoveRadians :
      this.shootOffsetRadians;
    const offsetX2 = offset * 2;
    const angleOffset =
      offsetX2 * randomNumbers.getRandom() - offset;
    return angleOffset;
  }

  setHorizontalRecoil(direction: Vector3, angleOffset: number) {
    const c = Math.cos(angleOffset);
    const s = Math.sin(angleOffset);
    direction.x = direction.x * c - direction.z * s;
    direction.z = direction.x * s + direction.z * c;
  }

  updateRecoil(delta: number) {
    if (this.recoilTime === undefined) {
      return;
    }
    if (this.currentRecoilTime < this.recoilTime) {
      this.currentRecoilTime += delta;
      return;
    }
    this.currentRecoilTime = 0;
    this.shootSound.stop();
    this.isShoot = false;
  }

  update(delta: number) {
    if (!this.isShoot || this.isCoolingDown) {
      return;
    }
    this.updateRecoil(delta);
    if (this.fireType === GunFireType.automatic) {
      this.updateAutomaticShooting();
    }
  }

  updateAutomaticShooting() {
    if (
      (this.currentRecoilTime !== 0) ||
      (!this.isTriggerPulled)
    ) {
      return;
    }
    this.shoot();
  }

  updateHeatLevel(delta: number) {
    if (this.fireType !== GunFireType.automatic) {
      return;
    }
    if (this.isTriggerPulled) {
      this.heatLevel = Math.min(
        this.heatLevel + (delta / this.secToMaxHeatLevel),
        1
      );
      if (this.heatLevel === 1) {
        this.isCoolingDown = true;
        this.handleReleaseTrigger();
      }
      return;
    }
    if (this.heatLevel !== 0) {
      this.heatLevel = Math.max(this.heatLevel - delta, 0);
    } else {
      this.isCoolingDown = false;
    }
  }
}
