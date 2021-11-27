export interface EaseProgressProps {
  minValue: number;
  maxValue: number;
  progressSpeed: number;
  transitionFunction?: (x: number) => number;
}

export class EaseProgress {
  minValue: number;
  maxValue: number;
  userRange: number;
  progressSpeed: number;
  transitionFunction?: (x: number) => number;
  currentProgress: number;

  constructor(props: EaseProgressProps) {
    this.minValue = props.minValue;
    this.maxValue = props.maxValue;
    this.userRange = this.maxValue - this.minValue;
    this.progressSpeed = props.progressSpeed;
    this.transitionFunction = props.transitionFunction;
    this.currentProgress = 0;
  }

  updateProgress(delta: number) {
    if (this.currentProgress === 1) {
      return;
    }
    this.currentProgress += delta * this.progressSpeed;
    this.currentProgress = Math.min(this.currentProgress, 1);
  }

  getCurrentProgress() {
    const currentProgress = (!!this.transitionFunction) ?
      this.transitionFunction(this.currentProgress) :
      this.currentProgress;
    return this.convertToUserRange(currentProgress);
  }

  convertToUserRange(value: number) {
    return value * this.userRange + this.minValue;
  }
}

export const easeBounceSin = (x: number) => {
  const c = 3.1;
  return Math.sin(c * x);
};
