import { Entity } from '@/core/Entities/Entity';
import { WallActor } from '@/Entities/Wall/WallActor';
import { WallBehavior } from './WallBehavior';
import { Vector3, Color } from 'three';
import { ENTITY_TYPE, WALL } from '@/constants';

export interface WallProps {
  position: Vector3;
  size?: { width: number; height: number; depth: number };
  isHorizontalWall?: boolean;
  withDecals?: boolean;
  color?: Color;
}

export class Wall extends Entity {
  constructor(props: WallProps) {
    const size = props.size ?
      props.size :
      { width: WALL.SIZE, height: WALL.SIZE, depth: WALL.SIZE };
    const actor = new WallActor({
      position: props.position,
      size: size,
      isHorizontalWall: props.isHorizontalWall,
      textureFileName: 'wallTextureFile',
      textureRepeat: 3,
      color: props.color,
      maxDecalsCount: props.withDecals ? 5 : 0,
    });
    const behavior = new WallBehavior({});
    super(
      ENTITY_TYPE.WALL,
      actor,
      behavior
    );
  }
}
