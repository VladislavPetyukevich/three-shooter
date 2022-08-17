import { Entity } from '@/core/Entities/Entity';
import { Player } from '@/Entities/Player/Player';
import { WallActor } from '@/Entities/Wall/WallActor';
import { DoorBehavior } from './DoorBehavior';
import { Vector3, Material } from 'three';
import { ENTITY_TYPE, GAME_TEXTURE_NAME } from '@/constants';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

interface DoorProps {
  player: Player;
  position: Vector3;
  container: EntitiesContainer;
  isHorizontalWall?: boolean;
  size: { width: number; height: number; depth: number };
}

export class Door extends Entity<WallActor, DoorBehavior> {
  container: EntitiesContainer;

  constructor(props: DoorProps) {
    const size = {
      width: props.isHorizontalWall ? props.size.width : 1,
      height: props.size.height,
      depth: props.isHorizontalWall ? 1 : props.size.depth
    };
    const actor = new WallActor({
      position: props.position,
      size: size,
      textureFileName: GAME_TEXTURE_NAME.doorTextureFile,
      isHorizontalWall: props.isHorizontalWall,
      textureRepeat: 3 * 4
    });
    const behavior = new DoorBehavior({
      player: props.player,
      actor: actor,
      isHorizontalWall: props.isHorizontalWall,
      position: props.position,
      size: props.size
    });
    super(
      ENTITY_TYPE.WALL,
      actor,
      behavior
    );
    this.actor.mesh.renderOrder = 1;
    behavior.onOpen = () => this.onOpen();
    behavior.onClose = () => this.onClose();
    this.container = props.container;
    if (props.isHorizontalWall) {
      delete (this.actor.mesh.material as Material[])[0];
      delete (this.actor.mesh.material as Material[])[1];
    } else {
      delete (this.actor.mesh.material as Material[])[4];
      delete (this.actor.mesh.material as Material[])[5];
    }
  }

  open() {
    this.behavior.open();
  }

  close() {
    this.behavior.close();
  }

  onOpen() {
    this.isCollideTransparent = true;
  }

  onClose() {
    this.isCollideTransparent = false;
  }
}

