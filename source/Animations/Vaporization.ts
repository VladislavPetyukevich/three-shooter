import { Material } from 'three';
import {
  ActorAnimatorEaseBased,
  ActorAnimatorEaseBasedProps,
} from '@/Animations/ActorAnimatorEaseBased';

export interface VaporizationAnimationProps extends ActorAnimatorEaseBasedProps {
}

export class VaporizationAnimation extends ActorAnimatorEaseBased {
  initialMeshY: number;
  material: Material;

  constructor(props: VaporizationAnimationProps) {
    super(props);
    this.initialMeshY = this.actor.mesh.position.y;
    this.material = Array.isArray(this.actor.mesh.material) ?
      this.actor.mesh.material[0] :
      this.actor.mesh.material;
  }

  update(delta: number) {
    const currentProgress = this.easeProgress.getCurrentProgress();
    this.material.opacity = 1 - currentProgress;
    this.actor.mesh.position.y = this.initialMeshY + currentProgress;
    return super.update(delta);
  }
}
