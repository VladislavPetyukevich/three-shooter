import { Vector3 } from 'three';
import { Behavior } from '@/core/Entities/Behavior';
import { Player } from '@/Entities/Player/Player';
import { WallActor } from '@/Entities/Wall/WallActor';
import { DOOR } from '@/constants';

interface DoorBehaviorProps {
  actor: WallActor;
  player: Player;
  position: Vector3;
  size: { width: number; height: number; depth: number };
  isHorizontalWall?: boolean;
}

export class DoorBehavior implements Behavior {
  player: Player;
  actor: WallActor;
  isOpenAnimation: boolean;
  isOpened: boolean;
  maxOffset: number;
  isLocked: boolean;
  initialPositon: number;
  isHorizontalWall?: boolean;
  onOpen?: Function;

  constructor(props: DoorBehaviorProps) {
    this.player = props.player;
    this.actor = props.actor;
    this.isOpenAnimation = false;
    this.isOpened = false;
    this.isHorizontalWall = props.isHorizontalWall;
    const size = props.isHorizontalWall ? props.size.width : props.size.depth;
    const position = props.isHorizontalWall ? props.position.x : props.position.z;
    this.maxOffset = size + position;
    this.isLocked = false;
    this.initialPositon = this.isHorizontalWall ?
      this.initialPositon = this.actor.mesh.position.x :
      this.initialPositon = this.actor.mesh.position.z;
  }

  getDistanceToPlayer() {
    const diffX = this.actor.mesh.position.x - this.player.actor.mesh.position.x;
    const diffZ = this.actor.mesh.position.z - this.player.actor.mesh.position.z;
    return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffZ, 2));
  }

  offsetDoor(offset: number) {
    if (this.isHorizontalWall) {
      if (this.actor.mesh.position.x > this.maxOffset) {
        this.doorOpened();
        return;
      }
      this.actor.mesh.position.x += offset;
    } else {
      if (this.actor.mesh.position.z > this.maxOffset) {
        this.doorOpened();
        return;
      }
      this.actor.mesh.position.z += offset;
    }
  }

  doorOpened() {
    this.isOpenAnimation = false;
    if (this.onOpen) {
      this.onOpen();
    }
  }

  resetOpenAnimation() {
    if (this.isHorizontalWall) {
      this.actor.mesh.position.x = this.initialPositon;
    } else {
      this.actor.mesh.position.z = this.initialPositon;
    }
  }

  update(delta: number) {
    if (this.isLocked) {
      return;
    }
    const distanceToPlayer = this.getDistanceToPlayer();
    if (!this.isOpenAnimation && (distanceToPlayer < DOOR.OPEN_DISTANCE)) {
      this.isOpenAnimation = true;
    } else if (this.isOpenAnimation) {
      const offset = delta * DOOR.OPEN_SPEED;
      this.offsetDoor(offset);
    }
  }
}

