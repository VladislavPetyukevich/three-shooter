import { AudioListener, Camera, Vector3 } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { ENTITY_TYPE } from '@/constants';
import { GunActor } from './GunActor';
import { GunBehavior } from './GunBehavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

export interface Props {
  playerCamera: Camera;
  container: EntitiesContainer;
  audioListener: AudioListener;
  shootOffsetAngle: number;
  shootOffsetInMoveAngle: number;
  bulletsPerShoot: number;
  recoilTime: number;
}

export class Gun extends Entity {
  constructor(props: Props) {
    const actor = new GunActor();
    const behavior = new GunBehavior({
      container: props.container,
      playerCamera: props.playerCamera,
      audioListener: props.audioListener,
      shootOffsetAngle: props.shootOffsetAngle,
      shootOffsetInMoveAngle: props.shootOffsetInMoveAngle,
      bulletsPerShoot: props.bulletsPerShoot,
      recoilTime: props.recoilTime,
    });

    super(
      ENTITY_TYPE.GUN,
      actor,
      behavior
    );
  }

  checkIsRecoil() {
    return (<GunBehavior>this.behavior).isShoot;
  }

  setIsInMove(isInMove: boolean) {
    (<GunBehavior>this.behavior).isInMove = isInMove;
  }

  shootRaycast(position: Vector3, direction: Vector3) {
    return (<GunBehavior>this.behavior).shootRaycast(position, direction);
  }

  shootBullet(bullet: Bullet) {
    return (<GunBehavior>this.behavior).shootBullet(
      bullet
    );
  }

  update(delta: number) {
    this.behavior.update(delta);
  }
}
