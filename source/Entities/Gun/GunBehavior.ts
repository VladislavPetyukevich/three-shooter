import {
  Camera,
  Vector3,
  Raycaster,
  AudioListener,
  Audio,
  Mesh,
  PositionalAudio,
} from 'three';
import { Entity } from '@/core/Entities/Entity';
import { Behavior } from '@/core/Entities/Behavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { PI_180 } from '@/constants';
import { GunFireType } from './Gun';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { randomNumbers } from '@/RandomNumbers';
import { AudioSlices } from '@/core/AudioSlices';
import { AudioSliceName } from '@/constantsAssets';

const enum VisualRecoilFrame {
  Fire,
  Idle,
}

export interface BehaviorProps {
  playerCamera: Camera;
  holderMesh: Mesh;
  container: EntitiesContainer;
  audioListener: AudioListener;
  positionalAudio: boolean;
  shootOffsetAngle: number;
  shootOffsetInMoveAngle: number;
  bulletsPerShoot: number;
  recoilTime: number;
  shootsToMaxHeat: number;
  fireType: GunFireType;
  shootSoundName: AudioSliceName;
  audioSlices: AudioSlices<AudioSliceName>;
}

export class GunBehavior implements Behavior {
  playerCamera: Camera;
  holderMesh: Mesh;
  bulletAuthor?: Entity;
  remainingBullets: number | null;
  raycaster: Raycaster;
  container: EntitiesContainer;
  audioListener: AudioListener;
  shootSound: Audio<GainNode | PannerNode>;
  isShoot: boolean;
  isInMove: boolean;
  isCoolingDown: boolean;
  shootOffsetRadians: number;
  shootOffsetInMoveRadians: number;
  bulletsPerShoot: number;
  recoilTime: number;
  currentRecoilTime: number;
  visualRecoilTime: number;
  visualRecoilFrame: VisualRecoilFrame;
  secToMaxHeatLevel: number;
  heatLevel: number;
  fireType: GunFireType;
  isTriggerPulled: boolean;
  rotationY: number;
  position: Vector3;
  bulletPositionOffset: number;
  bulletPositionOffsetY: number | null;
  lastShootBulletClass?: typeof Bullet;
  onVisualRecoilStart?: () => void;
  onVisualRecoilEnd?: () => void;

  constructor(props: BehaviorProps) {
    this.playerCamera = props.playerCamera;
    this.holderMesh = props.holderMesh;
    this.raycaster = new Raycaster();
    this.container = props.container;
    this.audioListener = props.audioListener;
    this.remainingBullets = null;
    this.isShoot = false;
    this.isInMove = false;
    this.isCoolingDown = false;
    this.shootOffsetRadians = props.shootOffsetAngle * PI_180;
    this.shootOffsetInMoveRadians = props.shootOffsetInMoveAngle * PI_180;
    this.bulletsPerShoot = props.bulletsPerShoot;
    this.recoilTime = props.recoilTime;
    this.fireType = props.fireType;
    this.visualRecoilTime =
      this.fireType === GunFireType.automatic ?
        props.recoilTime / 5 :
        0;
    this.visualRecoilFrame = VisualRecoilFrame.Idle;
    this.isTriggerPulled = false;
    this.rotationY = 0;
    this.position = new Vector3();
    this.currentRecoilTime = 0;
    const shootsPerSec = 1 / (this.recoilTime || 0.16);
    this.secToMaxHeatLevel = props.shootsToMaxHeat / shootsPerSec;
    this.heatLevel = 0;
    this.shootSound = props.positionalAudio ? new PositionalAudio(props.audioListener) : new Audio(props.audioListener);
    props.audioSlices.loadSliceToAudio(props.shootSoundName, this.shootSound);
    this.holderMesh.add(this.shootSound);
    this.shootSound.isPlaying = false;
    this.bulletPositionOffset = 0;
    this.bulletPositionOffsetY = null;
  }

  setRemainingBullets = (value: number) => {
    this.remainingBullets = value;
  };

  pullBullet() {
    if (this.remainingBullets === null) {
      return true;
    }
    this.remainingBullets--;
    if (this.remainingBullets === -1) {
      return false;
    }
    return true;
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

  updateVisualRecoil() {
    if (!this.onVisualRecoilStart || !this.onVisualRecoilEnd) {
      return;
    }

    if (this.isCoolingDown) {
      if (this.visualRecoilFrame !== VisualRecoilFrame.Idle) {
        this.visualRecoilFrame = VisualRecoilFrame.Idle;
        this.onVisualRecoilEnd();
      }
      return;
    }

    if (!this.isShoot) {
      if (this.visualRecoilFrame !== VisualRecoilFrame.Idle) {
        this.visualRecoilFrame = VisualRecoilFrame.Idle;
        this.onVisualRecoilEnd();
      }
      return;
    }

    if (this.currentRecoilTime < this.recoilTime - this.visualRecoilTime) {
      if (this.visualRecoilFrame !== VisualRecoilFrame.Fire) {
        this.visualRecoilFrame = VisualRecoilFrame.Fire;
        this.onVisualRecoilStart();
      }
    } else if (this.visualRecoilFrame !== VisualRecoilFrame.Idle) {
      this.visualRecoilFrame = VisualRecoilFrame.Idle;
      this.onVisualRecoilEnd();
    }
  }

  updateRecoil(delta: number) {
    if (this.currentRecoilTime < this.recoilTime) {
      this.currentRecoilTime += delta;
      return;
    }
    this.currentRecoilTime = 0;
    this.shootSound.stop();
    this.isShoot = false;
  }

  update(delta: number) {
    this.updateVisualRecoil();
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

  onDestroy() {
    this.shootSound.stop();
  }
}
