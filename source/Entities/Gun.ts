import { Camera } from 'three';
import { Body } from 'cannon';
import Entity from '@/core/Entities/Entity';
import Behavior from '@/core/Entities/Behavior';
import EntitiesContainer from '@/core/Entities/EntitiesContainer';
import GunActor from './Actors/GunActor';
import GunBehavior from './Behaviors/GunBehavior';
import { ENTITY_TYPE } from '@/constants';

export interface GunProps {
  camera: Camera;
  holderBody: Body;
  holderBehavior?: Behavior;
  container: EntitiesContainer;
}

export default class Gun extends Entity {
  constructor(props: GunProps) {
    super(
      ENTITY_TYPE.INANIMATE,
      new GunActor(),
      new GunBehavior()
    );
    (<GunBehavior>this.behavior)
      .setActor(this.actor)
      .setHolderBody(props.holderBody)
      .setContainer(props.container)
      .setCamera(props.camera);

    if (props.holderBehavior) {
      (<GunBehavior>this.behavior)
        .setHolderBehavior(props.holderBehavior);
    }
  }

  shoot(direction: { x: number, y: number, z: number }) {
    (<GunBehavior>this.behavior).shoot(direction);
  }

  update(delta: number) {
    this.behavior.update(delta);
  }
}
