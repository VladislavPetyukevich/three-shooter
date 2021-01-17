import { Vector3, AudioListener } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';
import { EnemyActor } from './EnemyActor';
import { EnemyBehavior } from './EnemyBehavior';
import { Player } from '@/Entities/Player/Player';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

export interface EnemyProps {
  position: { x: number; y: number; z: number };
  player: Player;
  container: EntitiesContainer;
  audioListener: AudioListener;
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
        container: props.container,
        velocity,
        actor,
        audioListener: props.audioListener
      })
    );
    this.hp = 1;
    this.velocity = velocity;
  }

  onHit() {
    if (!(<EnemyBehavior>this.behavior).isDead) {
      (<EnemyBehavior>this.behavior).death();
    }
  }

  onDeath(callback?: Function) {
    (<EnemyBehavior>this.behavior).onDeathCallback = callback;
  }

  onCollide(entity: Entity) {
    if (this.velocity) {
      this.velocity.negate();
    }
    return false;
  }
}
