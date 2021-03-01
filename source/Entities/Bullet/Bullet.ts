import { Entity } from '@/core/Entities/Entity';
import { BulletActor } from '@/Entities/Bullet/BulletActor';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { BulletBehavior } from './BulletBehavior';
import { Vector3 } from 'three';
import { ENTITY_TYPE } from '@/constants';

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
    super(
      ENTITY_TYPE.BULLET,
      actor,
      behavior
    );
    this.velocity = velocity;
    this.container = props.container;
  }

  onCollide(entity: Entity) {
    if (entity.type === ENTITY_TYPE.BULLET) {
      return true;
    }
    entity.onHit(1);
    this.container.remove(this.actor.mesh);
    return false;
  }
}
