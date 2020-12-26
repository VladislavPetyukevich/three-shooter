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
  maxOffset: number;
  isHorizontalWall?: boolean;

  constructor(props: DoorBehaviorProps) {
    this.player = props.player;
    this.actor = props.actor;
    this.isOpenAnimation = false;
    this.isHorizontalWall = props.isHorizontalWall;
    const size = props.isHorizontalWall ? props.size.width : props.size.depth;
    const position = props.isHorizontalWall ? props.position.x : props.position.z;
    this.maxOffset = size + position;
  }

  getDistanceToPlayer() {
    const diffX = this.actor.mesh.position.x - this.player.actor.mesh.position.x;
    const diffZ = this.actor.mesh.position.z - this.player.actor.mesh.position.z;
    return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffZ, 2));
  }

  offsetDoor(offset: number) {
    if (this.isHorizontalWall) {
      if (this.actor.mesh.position.x > this.maxOffset) {
        return;
      }
      this.actor.mesh.position.x += offset;
    } else {
      if (this.actor.mesh.position.z > this.maxOffset) {
        return;
      }
      this.actor.mesh.position.z += offset;
    }
  }

  update(delta: number) {
    const distanceToPlayer = this.getDistanceToPlayer();
    if (!this.isOpenAnimation && (distanceToPlayer < DOOR.OPEN_DISTANCE)) {
      this.isOpenAnimation = true;
    } else if (this.isOpenAnimation) {
      const offset = delta * DOOR.OPEN_SPEED;
      this.offsetDoor(offset);
    }
  }
}

