import { Vector3 } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';
import { ShootTraceActor } from './ShootTraceActor';
import { ShootTraceBehavior } from './ShootTraceBehavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

export interface Props {
  startPos: Vector3;
  endPos: Vector3;
  container: EntitiesContainer;
}

export class ShootTrace extends Entity {
  lifeTime: number;
  container: EntitiesContainer;

  constructor(props: Props) {
    const actor = new ShootTraceActor({
      startPos: props.startPos,
      endPos: props.endPos,
    });
    const behavior = new ShootTraceBehavior();

    super(
      ENTITY_TYPE.SHOOT_TRACE,
      actor,
      behavior
    );
    this.container = props.container;
    this.lifeTime = 0;
  }

  update(delta: number) {
    this.actor.update(delta);
    this.lifeTime += delta;

    if (this.lifeTime >= 0.1) {
      this.container.remove(this.mesh);
    }
  }
}

