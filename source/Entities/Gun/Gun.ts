import { AudioListener, Camera, Vector3, Mesh, Texture, BoxGeometry } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';
import { GunActor } from './GunActor';
import { GunBehavior } from './GunBehavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { Actor } from '@/core/Entities/Actor';

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
  shootsToMaxHeat: number;
  fireType: GunFireType;
  holderMesh: Mesh;
  shootSoundName: string;
  hudTextures?: GunHudTextures;
  orderIndex?: number;
}

export interface GunProps extends GunPropsExternal {
  behavior: GunBehavior;
  shootOffsetY: boolean;
}

export class Gun extends Entity<Actor, GunBehavior> {
  hudTextures?: GunHudTextures;
  orderIndex?: number;

  constructor(props: GunProps) {
    const actor = new GunActor();
    super(
      ENTITY_TYPE.GUN,
      actor,
      props.behavior
    );
    this.hudTextures = props.hudTextures;
    this.behavior.bulletPositionOffset = this.getBulletPositionOffset(props.holderMesh.geometry);
    if (props.shootOffsetY) {
      this.behavior.bulletPositionOffsetY = this.getBulletPositionOffsetY(props.holderMesh.geometry);
    }
    this.orderIndex = props.orderIndex;
  }

  checkIsRecoil() {
    return this.behavior.isShoot;
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

  getOrderIndex() {
    if (typeof this.orderIndex === 'number') {
      return this.orderIndex;
    }
    return 9999;
  }

  private getBulletPositionOffset(geometry: Mesh['geometry']) {
    if (geometry.type !== 'BoxGeometry') {
      throw new Error(`Cant handle geometry type: ${geometry.type}`);
    }
    const width = (geometry as BoxGeometry).parameters.width;
    const depth = (geometry as BoxGeometry).parameters.depth;
    return (width > depth) ? width : depth;
  }

  private getBulletPositionOffsetY(geometry: Mesh['geometry']) {
    if (geometry.type !== 'BoxGeometry') {
      throw new Error(`Cant handle geometry type: ${geometry.type}`);
    }
    return (geometry as BoxGeometry).parameters.height / 4;
  }

  update(delta: number) {
    this.behavior.update(delta);
  }
}
