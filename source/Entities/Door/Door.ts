import { Entity } from '@/core/Entities/Entity';
import { WallActor } from '@/Entities/Wall/WallActor';
import { DoorBehavior } from './DoorBehavior';
import { Vector3, Material, MeshBasicMaterial } from 'three';
import { ENTITY_TYPE, DOOR } from '@/constants';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { SlideAnimation } from '@/Animations/SlideAnimation';

interface DoorProps {
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
      textureFileName: 'doorTextureFile',
      isHorizontalWall: props.isHorizontalWall,
      textureRepeat: 3 * 4,
      decalsCount: 0,
    });
    const absoluteWidth = props.isHorizontalWall ? props.size.width : props.size.depth;
    const position = props.isHorizontalWall ? props.position.x : props.position.z;
    const behavior = new DoorBehavior({
      animation: new SlideAnimation({
        actor: actor,
        axis: props.isHorizontalWall ? 'x' : 'z',
        speed: DOOR.OPEN_SPEED,
        startPosition: props.isHorizontalWall ?
          actor.mesh.position.x :
          actor.mesh.position.z,
        endPosition: absoluteWidth + position,
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
    const emptyMaterial = new MeshBasicMaterial({ visible: false });
    if (props.isHorizontalWall) {
      (this.mesh.material as Material[])[0] = emptyMaterial;
      (this.mesh.material as Material[])[1] = emptyMaterial;
    } else {
      (this.mesh.material as Material[])[4] = emptyMaterial;
      (this.mesh.material as Material[])[5] = emptyMaterial;
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

