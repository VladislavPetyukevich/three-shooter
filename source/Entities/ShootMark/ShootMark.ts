import { Camera, Vector3 } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';
import { ShootMarkActor } from './ShootMarkActor';
import { ShootMarkBehavior } from './ShootMarkBehavior';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

export interface Props {
  position: Vector3;
  playerCamera: Camera;
  container: EntitiesContainer;
}

export class ShootMark extends Entity {
  lifeTime: number;
  container: EntitiesContainer;

  constructor(props: Props) {
    const actor = new ShootMarkActor({
      position: props.position,
      playerCamera: props.playerCamera
    });
    const behavior = new ShootMarkBehavior();

    super(
      ENTITY_TYPE.SHOOT_MARK,
      actor,
      behavior
    );
    this.container = props.container;
    this.lifeTime = 0;
  }

  update(delta: number) {
    this.actor.update(delta);
    this.lifeTime += delta;

    if (this.lifeTime >= 0.2) {
      this.container.remove(this.mesh);
    }
  }
}
