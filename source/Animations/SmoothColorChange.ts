import { Color, Material, MeshLambertMaterial } from 'three';
import {
  ActorAnimatorDurationBased
} from '@/core/Entities/ActorAnimatorDurationBased';
import { Actor } from '@/core/Entities/Actor';
import { EaseProgress } from '@/EaseProgress';

export interface SmoothColorChangeProps {
  actor: Actor;
  targetColor: Color;
  durationSeconds: number;
  transitionFunction?: (x: number) => number;
}

export class SmoothColorChange extends ActorAnimatorDurationBased {
  targetColor: SmoothColorChangeProps['targetColor'];
  materialColor: Color;
  originalColor: Color;
  currentColor: Color;
  easeProgress: EaseProgress;

  constructor(props: SmoothColorChangeProps) {
    super(props.actor, props.durationSeconds);
    this.targetColor = props.targetColor;
    this.materialColor = this.getMaterialColor(this.getActorMaterial());
    this.originalColor = this.materialColor.clone();
    this.currentColor = this.materialColor;
    this.easeProgress = new EaseProgress({
      minValue: 0,
      maxValue: 1,
      progressSpeed: 1 / this.durationSeconds,
      transitionFunction: props.transitionFunction,
    });
  }

  getActorMaterial() {
    const material = this.actor.mesh.material;
    if (Array.isArray(material)) {
      return material[0];
    } else {
      return material;
    }
  }

  getMaterialColor(material: Material) {
    if (material.type === 'MeshLambertMaterial') {
      return (<MeshLambertMaterial>material).color;
    }
    throw new Error(`SmoothColorChange: Material type ${material.type} are not suported`);
  }


  getColor() {
    this.currentColor.copy(this.originalColor);
    this.currentColor.lerp(
      this.targetColor,
      this.easeProgress.getCurrentProgress()
    );
    return this.currentColor;
  }

  update(delta: number) {
    this.easeProgress.updateProgress(delta);
    this.materialColor = this.getColor();
    return super.update(delta);
  }
}
