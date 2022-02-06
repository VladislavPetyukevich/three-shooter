import { Color, Material, MeshLambertMaterial } from 'three';
import {
  ActorAnimatorEaseBased
} from '@/Animations/ActorAnimatorEaseBased';
import { Actor } from '@/core/Entities/Actor';

export interface SmoothColorChangeProps {
  actor: Actor;
  targetColor: Color;
  durationSeconds: number;
  transitionFunction?: (x: number) => number;
}

export class SmoothColorChange extends ActorAnimatorEaseBased {
  targetColor: SmoothColorChangeProps['targetColor'];
  materialColor: Color;
  originalColor: Color;
  currentColor: Color;

  constructor(props: SmoothColorChangeProps) {
    super({
      actor: props.actor,
      durationSeconds: props.durationSeconds,
      transitionFunction: props.transitionFunction,
    });
    this.targetColor = props.targetColor;
    this.materialColor = this.getMaterialColor(this.getActorMaterial());
    this.originalColor = this.materialColor.clone();
    this.currentColor = this.materialColor;
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
    this.materialColor = this.getColor();
    return super.update(delta);
  }
}
