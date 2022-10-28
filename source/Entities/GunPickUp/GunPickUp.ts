import { Vector3 } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { Gun } from '@/Entities/Gun/Gun';
import { GunPickUpActor } from './GunPickUpActor';
import { GunPickUpBehavior } from './GunPickUpBehavior';
import { ENTITY_TYPE, gameTextures } from '@/constants';

interface GunPickUpProps {
  size: Vector3;
  position: Vector3;
  gun: Gun;
  gunTextureName: keyof typeof gameTextures;
}

export class GunPickUp extends Entity {
  gun: Gun;

  constructor(props: GunPickUpProps) {
    super(
      ENTITY_TYPE.GUN_PICK_UP,
      new GunPickUpActor({
        size: props.size,
        position: props.position,
        gunTextureName: props.gunTextureName,
      }),
      new GunPickUpBehavior(),
    );
    this.gun= props.gun;
  }

  getGun() {
    return this.gun;
  }
}

