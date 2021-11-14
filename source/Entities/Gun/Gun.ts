import { AudioListener, Camera, Vector3, Mesh } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { ENTITY_TYPE } from '@/constants';
import { GunActor } from './GunActor';
import { GunBehavior } from './GunBehavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

export type GunFireType = 'single' | 'automatic';

export interface Props {
  playerCamera: Camera;
  container: EntitiesContainer;
  audioListener: AudioListener;
  shootOffsetAngle: number;
  shootOffsetInMoveAngle: number;
  bulletsPerShoot: number;
  recoilTime?: number;
  fireType: GunFireType;
  holderGeometry: Mesh['geometry'];
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
      fireType: props.fireType,
    });

    super(
      ENTITY_TYPE.GUN,
      actor,
      behavior
    );
    (<GunBehavior>this.behavior).bulletPositionOffset = this.getBulletPosisionOffset(props.holderGeometry);
  }

  checkIsRecoil() {
    return (<GunBehavior>this.behavior).isShoot;
  }

  setIsCanShoot(isCanShoot: boolean) {
    (<GunBehavior>this.behavior).isShoot = !isCanShoot;
  }

  setIsInMove(isInMove: boolean) {
    (<GunBehavior>this.behavior).isInMove = isInMove;
  }

  shootRaycast() {
    return (<GunBehavior>this.behavior).shootRaycast();
  }

  shootBullet(bullet: typeof Bullet, additionalProps?: Record<string, any>) {
    return (<GunBehavior>this.behavior).shootBullet(
      bullet, additionalProps
    );
  }

  releaseTrigger() {
    (<GunBehavior>this.behavior).handleReleaseTrigger();
  }

  setRotationY(rotation: number) {
    (<GunBehavior>this.behavior).setRotationY(rotation);
  }

  setPosition(position: Vector3) {
    (<GunBehavior>this.behavior).setPosition(position);
  }

  private getBulletPosisionOffset(geometry: Mesh['geometry']) {
    switch (geometry.type) {
      case 'BoxGeometry':
        const width = (<any>geometry).parameters.width;
        const depth = (<any>geometry).parameters.depth;
        return (width > depth) ? width : depth;
      default:
        throw new Error(`Cant handle geometry type: ${geometry.type}`);
    }
  }

  update(delta: number) {
    this.behavior.update(delta);
  }
}
