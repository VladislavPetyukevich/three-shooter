interface Transition {
  name: string;
  from: string | string[];
  to: string;
  callback?: Function;
}

interface StateMachineProps {
  initialState: string;
  transitions: Transition[];
}

export class StateMachine {
  currentState: string;
  transitions: Transition[];

  constructor(props: StateMachineProps) {
    this.currentState = props.initialState;
    this.transitions = props.transitions;
  }

  doTransition(transitionName: string) {
    const transition = this.findTransition(transitionName);
    if (!this.checkIsCanPerformTransition(transition)) {
      return;
    }
    this.currentState = transition.to;
    if (transition.callback) {
      transition.callback();
    }
  }

  is(state: string) {
    return this.currentState === state;
  }

  not(state: string) {
    return !this.is(state);
  }

  state() {
    return this.currentState;
  }

  findTransition(transitionName: string) {
    const transition = this.transitions.find(transit => transit.name === transitionName);
    if (!transition) {
      throw new Error(`Transition ${transitionName} not found`);
    }
    return transition;
  }

  checkIsCanPerformTransition(transition: Transition) {
    if (typeof transition.from === 'string') {
      return this.currentState === transition.from;
    } else {
      return transition.from.some(fromState => this.currentState === fromState);
    }
  }
}

