import { Entity } from '@/core/Entities/Entity';
import { DoorActor } from '@/Entities/Door/DoorActor';
import { DoorBehavior } from './DoorBehavior';
import { Vector3 } from 'three';
import { ENTITY_TYPE, WALL } from '@/constants';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

interface DoorProps {
  position: Vector3;
  container: EntitiesContainer;
}

export class Door extends Entity {
  container: EntitiesContainer;

  constructor(props: DoorProps) {
    const actor = new DoorActor({
      position: props.position,
      size: { width: WALL.SIZE, height: WALL.SIZE, depth: WALL.SIZE }
    });
    const behavior = new DoorBehavior({});
    super(
      ENTITY_TYPE.WALL,
      actor,
      behavior
    );
    this.container = props.container;
  }

  onCollide(entity: Entity) {
    if (entity.type === ENTITY_TYPE.PLAYER) {
      this.container.remove(this.actor.mesh);
      return false;
    }
    return true;
  }
}

