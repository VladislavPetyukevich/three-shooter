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
import { ENTITY_TYPE, GAME_SOUND_NAME } from '@/constants';
import { hud } from '@/HUD/HUD';
import { ShootMark } from '@/Entities/ShootMark/ShootMark';
import { ShootTrace } from '@/Entities/ShootTrace/ShootTrace';
import { randomNumbers } from '@/RandomNumbers';

interface BehaviorProps {
  playerCamera: Camera;
  container: EntitiesContainer;
  audioListener: AudioListener;
}

export class GunBehavior implements Behavior {
  playerCamera: Camera;
  container: EntitiesContainer;
  gunShootLight: PointLight;
  audioListener: AudioListener;
  shootSound: Audio;
  isShoot: boolean;

  constructor(props: BehaviorProps) {
    this.playerCamera = props.playerCamera;
    this.container = props.container;
    this.audioListener = props.audioListener;
    this.shootSound = new Audio(props.audioListener);
    this.isShoot = false;
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
    const raycasterDirection = new Vector3();
    this.playerCamera.getWorldDirection(raycasterDirection);

    const angleOffset = randomNumbers.getRandom() / 4 - 0.125;
    const c = Math.cos(angleOffset);
    const s = Math.sin(angleOffset);
    raycasterDirection.x = raycasterDirection.x * c - raycasterDirection.z * s;
    raycasterDirection.z = raycasterDirection.x * s + raycasterDirection.z * c;

    const raycaster = new Raycaster(this.playerCamera.position, raycasterDirection);

    const intersects = raycaster.intersectObjects(this.container.entitiesMeshes);

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
        const shootTrace = new ShootTrace({
          endPos: this.playerCamera.position,
          startPos: intersect.point,
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
  };

  update() {
    if (this.isShoot && !this.shootSound.isPlaying) {
      this.shootSound.stop();
      this.isShoot = false;
      hud.gunIdle();
      this.gunShootLight.position.set(0, -50, 0);
    }
    if (this.isShoot) {
      this.gunShootLight.position.set(
        this.playerCamera.position.x,
        this.playerCamera.position.y,
        this.playerCamera.position.z
      );
    }
  }
}
