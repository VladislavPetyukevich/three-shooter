import { Vector3 } from 'three';
import { Behavior } from '@/core/Entities/Behavior';
import { Player } from '@/Entities/Player/Player';
import { WallActor } from '@/Entities/Wall/WallActor';
import { DOOR } from '@/constants';
import { StateMachine } from '@/StateMachine';

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
  maxPosition: number;
  minPositon: number;
  isHorizontalWall?: boolean;
  stateMachine: StateMachine;
  onOpen?: Function;
  onClose?: Function;

  constructor(props: DoorBehaviorProps) {
    this.player = props.player;
    this.actor = props.actor;
    this.isHorizontalWall = props.isHorizontalWall;
    const size = props.isHorizontalWall ? props.size.width : props.size.depth;
    const position = props.isHorizontalWall ? props.position.x : props.position.z;
    this.maxPosition = size + position;
    this.minPositon = this.isHorizontalWall ?
      this.actor.mesh.position.x :
      this.actor.mesh.position.z;
    this.stateMachine = new StateMachine({
      initialState: 'closed',
      transitions: [
        { name: 'open', from: 'closed', to: 'opening' },
        { name: 'openEnd', from: 'opening', to: 'opened', callback: this.onOpneEnd },
        { name: 'close', from: 'opened', to: 'closing' },
        { name: 'closeEnd', from: 'closing', to: 'closed', callback: this.onCloseEnd }
      ]
    });
  }

  open() {
    this.stateMachine.doTransition('open');
  }

  close() {
    this.stateMachine.doTransition('close');
  }

  onOpneEnd = () => {
    if (this.onOpen) {
      this.onOpen();
    }
  }

  onCloseEnd = () => {
    if (this.onClose) {
      this.onClose();
    }
  }

  offsetDoor(offset: number) {
    if (this.isHorizontalWall) {
      this.actor.mesh.position.x += offset;
    } else {
      this.actor.mesh.position.z += offset;
    }
    let meshPosition = this.isHorizontalWall ?
      this.actor.mesh.position.x :
      this.actor.mesh.position.z;
    if (meshPosition > this.maxPosition) {
      this.stateMachine.doTransition('openEnd');
    } else if (meshPosition < this.minPositon) {
      this.stateMachine.doTransition('closeEnd');
    }
  }


  update(delta: number) {
    switch (this.stateMachine.state()) {
      case 'opening':
        this.offsetDoor(delta * DOOR.OPEN_SPEED);
        break;
      case 'closing':
        this.offsetDoor(-delta * DOOR.OPEN_SPEED);
        break;
      default:
        break;
    }
  }
}

