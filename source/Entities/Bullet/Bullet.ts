import { Entity } from '@/core/Entities/Entity';
import { BulletActor } from '@/Entities/Bullet/BulletActor';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { BulletBehavior } from './BulletBehavior';
import { Vector3 } from 'three';
import { ENTITY_TYPE, ENEMY } from '@/constants';

export interface BulletProps {
  position: Vector3;
  direction: Vector3;
  container: EntitiesContainer;
}

export class Bullet extends Entity {
  direction: Vector3;
  container: EntitiesContainer;

  constructor(props: BulletProps) {
    const actor = new BulletActor({
      sphere: { radius: 0.2, widthSegments: 16, heightSegments: 16 },
      position: props.position
    });
    const behavior = new BulletBehavior({});
    super(
      ENTITY_TYPE.BULLET,
      actor,
      behavior
    );
    this.direction = props.direction;
    this.container = props.container;
    this.setSpeed(ENEMY.BULLET_SPEED);
  }

  setSpeed(speed: number) {
    this.velocity = this.direction.multiplyScalar(speed);
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
