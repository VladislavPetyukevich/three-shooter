import { ENTITY_TYPE } from '@/constants';
import { Entity } from '@/core/Entities/Entity';
import { FireFlareActor } from './FireFlareActor';
import { FireFlareBehavior } from './FireFlareBehavior';

export interface FireFlareProps {
  position: { x: number; y: number; z: number };
}

export class FireFlare extends Entity {
  constructor(props: FireFlareProps) {
    const actor = new FireFlareActor({
      position: props.position,
    });
    super(
      ENTITY_TYPE.TORCH,
      actor,
      new FireFlareBehavior()
    );
  }
}
