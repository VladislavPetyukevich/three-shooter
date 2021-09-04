import {
  Camera,
  Vector3,
  Raycaster,
  PointLight,
  AudioListener,
  Audio
} from 'three';
import { Behavior } from '@/core/Entities/Behavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { audioStore } from '@/core/loaders';
import { ENTITY_TYPE, GAME_SOUND_NAME, PI_180 } from '@/constants';
import { hud } from '@/HUD/HUD';
import { ShootMark } from '@/Entities/ShootMark/ShootMark';
import { ShootTrace } from '@/Entities/ShootTrace/ShootTrace';
import { randomNumbers } from '@/RandomNumbers';

interface BehaviorProps {
  playerCamera: Camera;
  container: EntitiesContainer;
  audioListener: AudioListener;
  shootOffsetAngle: number;
  bulletsPerShoot: number;
  recoilTime: number;
}

export class GunBehavior implements Behavior {
  playerCamera: Camera;
  raycaster: Raycaster;
  container: EntitiesContainer;
  gunShootLight: PointLight;
  audioListener: AudioListener;
  shootSound: Audio;
  isShoot: boolean;
  shootOffsetRadians: number;
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
    this.shootOffsetRadians = props.shootOffsetAngle * PI_180;
    this.bulletsPerShoot = props.bulletsPerShoot;
    this.recoilTime = props.recoilTime;
    this.currentRecoilTime = 0;
    const shootSoundBuffer = audioStore.getSound(GAME_SOUND_NAME.gunShoot);
    this.shootSound.setBuffer(shootSoundBuffer);
    this.shootSound.isPlaying = false;
    this.gunShootLight = new PointLight('white', 20, 100);
    this.gunShootLight.position.set(
      0,
      -50,
      0
    );
    this.container.scene.add(this.gunShootLight);
  }

  handleShoot = () => {
    if (this.isShoot) {
      return;
    }
    this.isShoot = true;
    this.shootSound.play();

    hud.gunFire();
    for (let i = this.bulletsPerShoot; i--;) {
      this.shootRaycast();
    }
  };

  shootRaycast() {
    const raycasterDirection = new Vector3();
    this.playerCamera.getWorldDirection(raycasterDirection);

    const angleOffsetX2 = this.shootOffsetRadians * 2;
    const angleOffset =
      angleOffsetX2 * randomNumbers.getRandom() - this.shootOffsetRadians;
    const c = Math.cos(angleOffset);
    const s = Math.sin(angleOffset);
    raycasterDirection.x = raycasterDirection.x * c - raycasterDirection.z * s;
    raycasterDirection.z = raycasterDirection.x * s + raycasterDirection.z * c;

    this.raycaster.set(this.playerCamera.position, raycasterDirection);
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

  updateRecoil(delta: number) {
    if (this.currentRecoilTime < this.recoilTime) {
      this.currentRecoilTime += delta;
      return;
    }
    this.currentRecoilTime = 0;
    this.shootSound.stop();
    this.isShoot = false;
    hud.gunIdle();
    this.gunShootLight.position.set(0, -50, 0);
  }

  update(delta: number) {
    if (this.isShoot) {
      this.gunShootLight.position.set(
        this.playerCamera.position.x,
        this.playerCamera.position.y,
        this.playerCamera.position.z
      );
      this.updateRecoil(delta);
    }
  }
}
