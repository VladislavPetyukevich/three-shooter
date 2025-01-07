import { Vector3 } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';
import { ShootTraceActor } from './ShootTraceActor';
import { ShootTraceBehavior } from './ShootTraceBehavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

export interface Props {
  startPos: Vector3;
  endPos: Vector3;
  rotationY: number;
  container: EntitiesContainer;
}

export class ShootTrace extends Entity<ShootTraceActor, ShootTraceBehavior> {
  lifeTime: number;
  container: EntitiesContainer;

  constructor(props: Props) {
    const actor = new ShootTraceActor(props);
    const behavior = new ShootTraceBehavior();

    super(
      ENTITY_TYPE.SHOOT_TRACE,
      actor,
      behavior
    );
    this.container = props.container;
    this.lifeTime = 0;
    this.isCollideTransparent = true;
  }

  update(delta: number) {
    this.actor.update(delta);
    this.lifeTime += delta;

    if (this.lifeTime >= 0.1) {
      this.actor.mesh.remove(this.actor.line);
    }
    if (this.lifeTime >= 1.0) {
      this.container.remove(this.mesh);
    }
  }
}

