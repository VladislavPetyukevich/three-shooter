import { Vector3, Color } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { ENTITY_TYPE } from '@/constants';
import { TriggerActor } from './TriggerActor';
import { TriggerBehavior } from './TriggerBehavior';

interface TriggerProps {
  size: Vector3;
  position: Vector3;
  color: Color;
  onTrigger: Function;
  entitiesContainer: EntitiesContainer;
}

export class Trigger extends Entity {
  isEnabled: boolean;
  onTrigger: Function;
  entitiesContainer: EntitiesContainer;

  constructor(props: TriggerProps) {
    const actor = new TriggerActor({
      size: props.size,
      position: props.position,
      color: props.color,
    });
    const behavior = new TriggerBehavior();
    super(ENTITY_TYPE.TRIGGER, actor, behavior);
    this.isEnabled = true;
    this.entitiesContainer = props.entitiesContainer;
    this.onTrigger = props.onTrigger;
  }

  onCollide(entity: Entity) {
    if (!this.isEnabled) {
      return true;
    }
    if (entity.type === ENTITY_TYPE.PLAYER) {
      this.isEnabled = false;
      this.onTrigger();
      this.entitiesContainer.remove(this.mesh);
    }
    return true;
  }
}

