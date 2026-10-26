import { Vector3 } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';
import { HitParticlesActor } from './HitParticlesActor';
import { HitParticlesBehavior } from './HitParticlesBehavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

export interface HitParticlesProps {
  position: Vector3;
  container: EntitiesContainer;
}

export class HitParticles extends Entity {
  lifeTime: number;
  container: EntitiesContainer;
  maxLifeTime: number;

  constructor(props: HitParticlesProps) {
    const actor = new HitParticlesActor({
      position: props.position,
    });
    const behavior = new HitParticlesBehavior();

    super(
      ENTITY_TYPE.HIT_PARTICLES,
      actor,
      behavior
    );
    this.isCollideTransparent = true;
    this.container = props.container;
    this.lifeTime = 0;
    this.maxLifeTime = 0.4; // Particles last for 0.4 seconds
  }

  update(delta: number) {
    this.actor.update(delta);
    this.lifeTime += delta;

    // Remove particles after their lifetime expires
    if (this.lifeTime >= this.maxLifeTime) {
      this.container.remove(this.mesh);
    }
  }
}
