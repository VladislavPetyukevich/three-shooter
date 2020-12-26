import { Entity } from '@/core/Entities/Entity';
import { WallActor } from '@/Entities/Wall/WallActor';
import { DoorBehavior } from './DoorBehavior';
import { Vector3 } from 'three';
import { ENTITY_TYPE, WALL, GAME_TEXTURE_NAME } from '@/constants';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

interface DoorProps {
  position: Vector3;
  container: EntitiesContainer;
  size?: { width: number; height: number; depth: number };
}

export class Door extends Entity {
  container: EntitiesContainer;

  constructor(props: DoorProps) {
    const size = props.size ?
      props.size :
      { width: WALL.SIZE, height: WALL.SIZE, depth: WALL.SIZE };
    const actor = new WallActor({
      position: props.position,
      size: size,
      textureFileName: GAME_TEXTURE_NAME.doorTextureFile
    });
    const behavior = new DoorBehavior({});
    super(
      ENTITY_TYPE.WALL,
      actor,
      behavior
    );
    this.container = props.container;
  }

  onCollide(entity: Entity) {
    if (entity.type === ENTITY_TYPE.PLAYER) {
      this.container.remove(this.actor.mesh);
      return false;
    }
    return true;
  }
}

