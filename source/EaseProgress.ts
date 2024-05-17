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
  minCurrentProgress: number;
  maxCurrentProgress: number;
  isReversed: boolean;

  constructor(props: EaseProgressProps) {
    this.minValue = props.minValue;
    this.maxValue = props.maxValue;
    this.isReversed = this.minValue > this.maxValue;
    this.userRange = this.maxValue - this.minValue;
    this.progressSpeed = props.progressSpeed;
    this.transitionFunction = props.transitionFunction;
    this.minCurrentProgress = Number(this.isReversed);
    this.maxCurrentProgress = Number(!this.isReversed);
    this.currentProgress = this.minCurrentProgress;
  }

  updateProgress(delta: number) {
    if (this.currentProgress === this.maxCurrentProgress) {
      return;
    }
    const progressDelta = delta * this.progressSpeed;
    if (this.isReversed) {
      this.currentProgress -= progressDelta;
      this.currentProgress = Math.max(this.currentProgress, this.maxCurrentProgress);
    } else {
      this.currentProgress += progressDelta;
      this.currentProgress = Math.min(this.currentProgress, this.maxCurrentProgress);
    }
  }

  getCurrentProgress() {
    const currentProgress = (this.transitionFunction) ?
      this.transitionFunction(this.currentProgress) :
      this.currentProgress;
    return this.convertToUserRange(currentProgress);
  }

  checkIsProgressCompelete() {
    return this.currentProgress === this.maxCurrentProgress;
  }

  convertToUserRange(value: number) {
    const progressRange = this.maxCurrentProgress - this.minCurrentProgress;
    return (((value - this.minCurrentProgress) * this.userRange) / progressRange) + this.minValue;
  }
}

export const easeBounceSin = (x: number) => {
  const c = 3.1;
  return Math.sin(c * x);
};

export const easeInSine = (x: number) => {
  return 1 - Math.cos((x * Math.PI) / 2);
}

