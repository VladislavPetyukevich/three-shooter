import { Behavior } from '@/core/Entities/Behavior';
import { ActorAnimator } from '@/core/Entities/ActorAnimator';
import { StateMachine } from '@/StateMachine';

interface DoorBehaviorProps {
  animation: ActorAnimator;
}

export class DoorBehavior implements Behavior {
  animation: ActorAnimator;
  stateMachine: StateMachine;
  onOpen?: () => void;
  onClose?: () => void;

  constructor(props: DoorBehaviorProps) {
    this.animation = props.animation;
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

  update(delta: number) {
    switch (this.stateMachine.state()) {
      case 'opening':
        if (!this.animation.update(delta)) {
          this.stateMachine.doTransition('openEnd');
        }
        break;
      case 'closing':
        if (!this.animation.update(-delta)) {
          this.stateMachine.doTransition('closeEnd');
        }
        break;
      default:
        break;
    }
  }
}

