import {
  Camera,
  Vector3,
  Raycaster,
  AudioListener,
  Audio
} from 'three';
import { Behavior } from '@/core/Entities/Behavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { audioStore } from '@/core/loaders';
import { ENTITY_TYPE, GAME_SOUND_NAME, PI_180 } from '@/constants';
import { Bullet, BulletProps } from '@/Entities/Bullet/Bullet';
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
  recoilTime: number;
}

export class GunBehavior implements Behavior {
  playerCamera: Camera;
  raycaster: Raycaster;
  container: EntitiesContainer;
  audioListener: AudioListener;
  shootSound: Audio;
  isShoot: boolean;
  isInMove: boolean;
  shootOffsetRadians: number;
  shootOffsetInMoveRadians: number;
  bulletsPerShoot: number;
  recoilTime: number;
  currentRecoilTime: number;

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
    this.currentRecoilTime = 0;
    const shootSoundBuffer = audioStore.getSound(GAME_SOUND_NAME.gunShoot);
    this.shootSound.setBuffer(shootSoundBuffer);
    this.shootSound.isPlaying = false;
  }

  handleShoot = () => {
    if (this.isShoot) {
      return;
    }
    this.isShoot = true;
    this.shootSound.play();
  };

  shootRaycast(position: Vector3, direction: Vector3) {
    if (this.isShoot) {
      return;
    }
    this.handleShoot();
    for (let i = this.bulletsPerShoot; i--;) {
      const angleOffset = this.getAngleOffset();
      this.setHorizontalRecoil(direction, angleOffset);

      this.raycaster.set(position, direction);
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
        if (intersectEntity.type === ENTITY_TYPE.ENEMY) {
          intersectEntity.onHit(1);
          break;
        }
      }
    }
  }

  shootBullet(
    BulletClass: typeof Bullet,
    props: BulletProps
  ) {
    if (this.isShoot) {
      return;
    }
    this.handleShoot();
    for (let i = this.bulletsPerShoot; i--;) {
      const resultDirection = props.direction.clone();
      const angleOffset = this.getAngleOffset();
      this.setHorizontalRecoil(resultDirection, angleOffset);
      const bullet = new BulletClass({
        ...props,
        direction: resultDirection,
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
    if (this.currentRecoilTime < this.recoilTime) {
      this.currentRecoilTime += delta;
      return;
    }
    this.currentRecoilTime = 0;
    this.shootSound.stop();
    this.isShoot = false;
  }

  update(delta: number) {
    if (this.isShoot) {
      this.updateRecoil(delta);
    }
  }
}
