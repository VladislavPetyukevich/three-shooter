import { Vector3 } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';
import { EnemyActor } from './Actors/EnemyActor';
import { EnemyBehavior } from './Behaviors/EnemyBehavior';
import { Player } from './Player';

export interface EnemyProps {
  position: { x: number; y: number; z: number };
  player: Player;
}

export class Enemy extends Entity {
  constructor(props: EnemyProps) {
    const velocity = new Vector3();
    const actor = new EnemyActor({
      position: props.position,
      player: props.player
    });
    super(
      ENTITY_TYPE.ENEMY,
      actor,
      new EnemyBehavior({
        player: props.player,
        velocity,
        actor
      })
    );

    this.velocity = velocity;
  }

  onCollide(entity: Entity) {
    if (this.velocity) {
      this.velocity.negate();
    }
    return false;
  }
}
