import { Entity } from '@/core/Entities/Entity';
import { WallActor } from '@/Entities/Wall/WallActor';
import { WallBehavior } from './WallBehavior';
import { Vector3 } from 'three';
import { ENTITY_TYPE, WALL } from '@/constants';

interface WallProps {
  position: Vector3;
}

export class Wall extends Entity {
  constructor(props: WallProps) {
    const actor = new WallActor({
      position: props.position,
      size: { width: WALL.SIZE, height: WALL.SIZE, depth: WALL.SIZE }
    });
    const behavior = new WallBehavior({});
    super(
      ENTITY_TYPE.WALL,
      actor,
      behavior
    );
  }
}
