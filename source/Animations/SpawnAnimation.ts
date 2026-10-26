import { Material, Vector3 } from 'three';
import {
  ActorAnimatorEaseBased,
  ActorAnimatorEaseBasedProps,
} from '@/Animations/ActorAnimatorEaseBased';

export interface SpawnAnimationProps extends ActorAnimatorEaseBasedProps {
  onEnd?: () => void;
}

const almostZero = 0.0001;

export class SpawnAnimation extends ActorAnimatorEaseBased {
  initialMeshY: number;
  material: Material;
  onEnd?: () => void;
  initialScale: Vector3;

  constructor(props: SpawnAnimationProps) {
    super(props);
    this.initialMeshY = this.actor.mesh.position.y;
    this.material = Array.isArray(this.actor.mesh.material) ?
      this.actor.mesh.material[0] :
      this.actor.mesh.material;
    this.onEnd = props.onEnd;

    // Store initial scale and start from zero
    this.initialScale = this.actor.mesh.scale.clone();
    this.actor.mesh.scale.set(almostZero, almostZero, almostZero);

    // Start transparent
    this.material.opacity = almostZero;
  }

  update(delta: number) {
    const currentProgress = this.easeProgress.getCurrentProgress();

    // Fade in
    this.material.opacity = currentProgress;

    // Scale up from 0 to initial scale
    this.actor.mesh.scale.lerpVectors(
      new Vector3(almostZero, almostZero, almostZero),
      this.initialScale,
      currentProgress
    );

    // Slight upward movement during spawn
    this.actor.mesh.position.y = this.initialMeshY - 0.5 * (1 - currentProgress);

    const isPlaying = super.update(delta);

    if (!isPlaying) {
      // Ensure final values are set
      this.material.opacity = 1;
      this.actor.mesh.scale.copy(this.initialScale);
      this.actor.mesh.position.y = this.initialMeshY;
      if (this.onEnd) {
        this.onEnd();
      }
    }

    return isPlaying;
  }
}
