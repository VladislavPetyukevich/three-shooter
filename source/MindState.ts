export interface MindStateProps {
  apathy: number;
  cowardice: number;
  sexualPerversions: number;
}

export class MindState {
  initialValue: number;
  increaseAmount: number;
  props: MindStateProps;

  constructor() {
    this.initialValue = 0;
    this.increaseAmount = 0.01;
    this.props = {
      apathy: this.initialValue,
      cowardice: this.initialValue,
      sexualPerversions: this.initialValue,
    };
  }

  increaseValue(prop: keyof MindStateProps) {
    this.props[prop] += this.increaseAmount;
    console.log('MindState props', this.props);
  }
}

export const mindState = new MindState();

