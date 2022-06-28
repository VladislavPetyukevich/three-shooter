import {
  Camera,
  Vector3,
  Raycaster,
  AudioListener,
  Audio,
} from 'three';
import { Entity } from '@/core/Entities/Entity';
import { Behavior } from '@/core/Entities/Behavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { audioStore } from '@/core/loaders';
import { ENTITY_TYPE, GAME_SOUND_NAME, PI_180 } from '@/constants';
import { GunFireType } from './Gun';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { ShootMark } from '@/Entities/ShootMark/ShootMark';
import { ShootTrace } from '@/Entities/ShootTrace/ShootTrace';
import { randomNumbers } from '@/RandomNumbers';

interface BehaviorProps {
  playerCamera: Camera;
  container: EntitiesContainer;
  audioListener: AudioListener;
  shootOffsetAngle: number;
  shootOffsetInMoveAngle: number;
  bulletsPerShoot: number;
  recoilTime?: number;
  fireType: GunFireType;
}

export class GunBehavior implements Behavior {
  playerCamera: Camera;
  bulletAuthor?: Entity;
  raycaster: Raycaster;
  container: EntitiesContainer;
  audioListener: AudioListener;
  shootSound: Audio;
  isShoot: boolean;
  isInMove: boolean;
  shootOffsetRadians: number;
  shootOffsetInMoveRadians: number;
  bulletsPerShoot: number;
  recoilTime?: number;
  currentRecoilTime: number;
  fireType: GunFireType;
  isTriggerPulled: boolean;
  rotationY: number;
  position: Vector3;
  bulletPositionOffset: number;
  lastShootBulletClass?: typeof Bullet;

  constructor(props: BehaviorProps) {
    this.playerCamera = props.playerCamera;
    this.raycaster = new Raycaster();
    this.container = props.container;
    this.audioListener = props.audioListener;
    this.shootSound = new Audio(props.audioListener);
    this.isShoot = false;
    this.isInMove = false;
    this.shootOffsetRadians = props.shootOffsetAngle * PI_180;
    this.shootOffsetInMoveRadians = props.shootOffsetInMoveAngle * PI_180;
    this.bulletsPerShoot = props.bulletsPerShoot;
    this.recoilTime = props.recoilTime;
    this.fireType = props.fireType;
    this.isTriggerPulled = false;
    this.rotationY = 0;
    this.position = new Vector3();
    this.currentRecoilTime = 0;
    const shootSoundBuffer = audioStore.getSound(GAME_SOUND_NAME.gunShoot);
    this.shootSound.setBuffer(shootSoundBuffer);
    this.shootSound.isPlaying = false;
    this.bulletPositionOffset = 0;
  }

  handlePullTrigger = () => {
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

  shootRaycast() {
    if (this.isShoot) {
      return;
    }
    this.handleShoot();
    this.lastShootBulletClass = undefined;
    const bulletDirection = new Vector3(
      Math.sin(this.rotationY),
      0,
      Math.cos(this.rotationY)
    ).normalize();
    for (let i = this.bulletsPerShoot; i--;) {
      const bulletDirectionWithOffset = bulletDirection.clone();
      const angleOffset = this.getAngleOffset();
      this.setHorizontalRecoil(bulletDirectionWithOffset, angleOffset);

      this.raycaster.set(this.position, bulletDirectionWithOffset);
      const intersects = this.raycaster.intersectObjects(this.container.entitiesMeshes);

      for (let i = 0; i < intersects.length; i++) {
        const intersect = intersects[i];
        const intersectEntity = this.container.entities.find(
          entity => entity.actor.mesh.id === intersect.object.id
        );
        if (!intersectEntity) {
          continue;
        }

        if (intersectEntity.type === ENTITY_TYPE.WALL) {
          const shootMark = new ShootMark({
            playerCamera: this.playerCamera,
            position: intersect.point,
            container: this.container
          });
          const shootTraceStartPos = new Vector3(
            this.playerCamera.position.x,
            0,
            this.playerCamera.position.z,
          );
          const shootTrace = new ShootTrace({
            startPos: shootTraceStartPos,
            endPos: intersect.point,
            container: this.container,
          });
          this.container.add(shootTrace);
          this.container.add(shootMark);
          break;
        }
        if (
          (intersectEntity.type === ENTITY_TYPE.ENEMY) ||
          (intersectEntity.type === ENTITY_TYPE.ENEMY_SPAWNER)
        ) {
          intersectEntity.onHit(1, this.bulletAuthor);
          break;
        }
      }
    }
  }

  shootBullet(BulletClass: typeof Bullet, additionalProps?: Record<string, any>) {
    if (this.isShoot) {
      return;
    }
    this.handleShoot();
    this.lastShootBulletClass = BulletClass;
    const offsetX = this.bulletPositionOffset * Math.sin(this.rotationY);
    const offsetZ = this.bulletPositionOffset * Math.cos(this.rotationY);
    const bulletPosition = new Vector3(
      this.position.x + offsetX,
      this.position.y,
      this.position.z + offsetZ
    );
    const bulletDirection = new Vector3(
      Math.sin(this.rotationY),
      0,
      Math.cos(this.rotationY)
    ).normalize();
    for (let i = this.bulletsPerShoot; i--;) {
      const bulletDirectionWithOffset = bulletDirection.clone();
      const angleOffset = this.getAngleOffset();
      this.setHorizontalRecoil(bulletDirectionWithOffset, angleOffset);
      const bullet = new BulletClass({
        position: bulletPosition,
        direction: bulletDirectionWithOffset,
        container: this.container,
        author: this.bulletAuthor,
        ...additionalProps,
      });
      this.container.add(bullet);
    }
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
    if (!this.isShoot) {
      return;
    }
    this.updateRecoil(delta);
    if (this.fireType === 'automatic') {
      this.updateAutomaticShooting();
    }
  }

  updateAutomaticShooting() {
    if (
      (this.currentRecoilTime !== 0) ||
      (this.isTriggerPulled === false)
    ) {
      return;
    }
    if (this.lastShootBulletClass) {
      this.shootBullet(this.lastShootBulletClass);
    } else {
      this.shootRaycast();
    }
  }
}
