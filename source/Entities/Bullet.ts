import { Entity } from '@/core/Entities/Entity';
import { BulletActor } from '@/Entities/Actors/BulletActor';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { BulletBehavior } from './Behaviors/BulletBehavior';
import { Vector3 } from 'three';

interface BulletProps {
  position: Vector3;
  velocity: Vector3;
  container: EntitiesContainer;
}

export class Bullet extends Entity {
  container: EntitiesContainer;

  constructor(props: BulletProps) {
    const actor = new BulletActor({
      sphere: { radius: 0.2, widthSegments: 16, heightSegments: 16 },
      position: props.position
    });
    const behavior = new BulletBehavior({});
    const velocity = props.velocity;
    super(actor, behavior, velocity);
    this.container = props.container;
  }

  onCollide(entity: Entity) {
    this.container.remove(this.actor.mesh);
  }
}
