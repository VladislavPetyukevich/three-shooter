import { Entity } from '@/core/Entities/Entity';
import { WallActor } from '@/Entities/Wall/WallActor';
import { DoorBehavior } from '../Door/DoorBehavior';
import { Vector3, Color } from 'three';
import { ENTITY_TYPE, DOOR, WALL } from '@/constants';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { SlideAnimation } from '@/Animations/SlideAnimation';

interface DoorProps {
  position: Vector3;
  container: EntitiesContainer;
  isHorizontalWall?: boolean;
  size: { width: number; height: number; depth: number };
}

export class DoorWall extends Entity<WallActor, DoorBehavior> {
  container: EntitiesContainer;

  constructor(props: DoorProps) {
    const size = props.size ?
      props.size :
      { width: WALL.SIZE, height: WALL.SIZE, depth: WALL.SIZE };
    const actor = new WallActor({
      position: props.position,
      size: size,
      textureFileName: 'wallTextureFile',
      isHorizontalWall: props.isHorizontalWall,
      textureRepeat: 3,
      color: new Color('red'),
      maxDecalsCount: 0,
    });
    const behavior = new DoorBehavior({
      animation: new SlideAnimation({
        actor: actor,
        axis: 'y',
        speed: DOOR.OPEN_SPEED,
        startPosition: actor.mesh.position.y,
        endPosition: -size.height,
      }),
    });
    super(
      ENTITY_TYPE.WALL,
      actor,
      behavior
    );
    this.mesh.renderOrder = 1;
    behavior.onOpen = () => this.onOpen();
    behavior.onClose = () => this.onClose();
    this.container = props.container;
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

