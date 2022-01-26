import { Color } from 'three';
import { EaseProgress } from '@/EaseProgress';

interface EaseColorProps {
  originalColor: Color;
  targetColor: Color;
  speed: number;
  transitionFunction?: (x: number) => number;
}

export class EaseColor {
  originalColor: Color;
  targetColor: Color;
  currentColor: Color;
  easeProgress: EaseProgress;

  constructor(props: EaseColorProps) {
    this.originalColor = props.originalColor;
    this.targetColor = props.targetColor;
    this.currentColor = props.originalColor.clone();
    this.easeProgress = new EaseProgress({
      minValue: 0,
      maxValue: 1,
      progressSpeed: props.speed,
      transitionFunction: props.transitionFunction,
    });
  }

  update(delta: number) {
    this.easeProgress.updateProgress(delta);
  }

  getColor() {
    this.currentColor.copy(this.originalColor);
    this.currentColor.lerp(
      this.targetColor,
      this.easeProgress.getCurrentProgress()
    );
    return this.currentColor;
  }

  checkIsProgressCompelete() {
    return this.easeProgress.checkIsProgressCompelete();
  }
}
