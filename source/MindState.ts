export interface MindStateProps {
  apathy: number;
  cowardice: number;
  sexualPerversions: number;
}

export class MindState {
  initialValue: number;
  increaseAmount: number;
  onUpdateCallbacks: Function[];
  props: MindStateProps;

  constructor() {
    this.initialValue = 0;
    this.increaseAmount = 0.01;
    this.onUpdateCallbacks = [];
    this.props = {
      apathy: this.initialValue,
      cowardice: this.initialValue,
      sexualPerversions: this.initialValue,
    };
  }

  increaseValue(prop: keyof MindStateProps) {
    this.props[prop] += this.increaseAmount;
    console.log('MindState props', this.props);
    this.onUpdate();
  }

  addUpdateListener(callback: Function) {
    this.onUpdateCallbacks.push(callback);
  }

  onUpdate() {
    this.onUpdateCallbacks.forEach(callback => callback());
  }
}

export const mindState = new MindState();

