import { Entity } from '@/core/Entities/Entity';
import { WallActor } from '@/Entities/Wall/WallActor';
import { WallBehavior } from './WallBehavior';
import { Vector3 } from 'three';
import { ENTITY_TYPE, WALL, GAME_TEXTURE_NAME } from '@/constants';

interface WallProps {
  position: Vector3;
  size?: { width: number; height: number; depth: number };
  isHorizontalWall?: boolean;
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
      textureFileName: GAME_TEXTURE_NAME.wallTextureFile,
      normalTextureFileName: GAME_TEXTURE_NAME.wallNormalFile
    });
    const behavior = new WallBehavior({});
    super(
      ENTITY_TYPE.WALL,
      actor,
      behavior
    );
  }
}
