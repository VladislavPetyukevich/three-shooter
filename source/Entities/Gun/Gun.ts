import { AudioListener, Camera, Vector3, Mesh, Texture } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';
import { GunActor } from './GunActor';
import { GunBehavior } from './GunBehavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

export const enum GunFireType {
  single,
  automatic,
}

export interface GunHudTextures {
  idle: Texture;
  fire: Texture;
}

export interface GunPropsExternal {
  playerCamera: Camera;
  container: EntitiesContainer;
  audioListener: AudioListener;
  shootOffsetAngle: number;
  shootOffsetInMoveAngle: number;
  bulletsPerShoot: number;
  recoilTime: number;
  fireType: GunFireType;
  holderMesh: Mesh;
  hudTextures?: GunHudTextures;
}

export interface GunProps extends GunPropsExternal {
  behavior: GunBehavior;
}

export class Gun extends Entity<GunActor, GunBehavior> {
  hudTextures?: GunHudTextures;

  constructor(props: GunProps) {
    const actor = new GunActor();
    super(
      ENTITY_TYPE.GUN,
      actor,
      props.behavior
    );
    this.hudTextures = props.hudTextures;
    this.behavior.bulletPositionOffset = this.getBulletPosisionOffset(props.holderMesh.geometry);
  }

  checkIsRecoil() {
    return this.behavior.isShoot;
  }

  setIsCanShoot(isCanShoot: boolean) {
    this.behavior.isShoot = !isCanShoot;
  }

  setIsInMove(isInMove: boolean) {
    this.behavior.isInMove = isInMove;
  }

  setBulletAuthor(entity: Entity) {
    this.behavior.bulletAuthor = entity;
  }

  shoot() {
    this.behavior.shoot();
  }

  releaseTrigger() {
    this.behavior.handleReleaseTrigger();
  }

  setRotationY(rotation: number) {
    this.behavior.setRotationY(rotation);
  }

  setPosition(position: Vector3) {
    this.behavior.setPosition(position);
  }

  getHudTextures() {
    return this.hudTextures;
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
