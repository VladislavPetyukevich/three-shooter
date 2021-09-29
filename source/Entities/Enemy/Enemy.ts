import { Vector3, AudioListener, Color } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';
import { EnemyActor } from './EnemyActor';
import { EnemyBehavior } from './EnemyBehavior';
import { Player } from '@/Entities/Player/Player';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

export type EnemyMessages = 'in player gunpoint';

export interface EnemyTextures {
  walk1: string;
  walk2: string;
  death: string;
}

export interface EnemyProps {
  position: { x: number; y: number; z: number };
  player: Player;
  bullet: typeof Bullet;
  container: EntitiesContainer;
  audioListener: AudioListener;
  color: Color;
  textures: EnemyTextures;
  hp: number;
  bulletsPerShoot: { min: number; max: number; };
  delays: {
    shoot: number;
    gunpointStrafe: number;
    strafe: number;
  };
}

export class Enemy extends Entity {
  constructor(props: EnemyProps) {
    const velocity = new Vector3();
    const actor = new EnemyActor({
      position: props.position,
      player: props.player,
      color: props.color,
      textures: props.textures,
    });
    super(
      ENTITY_TYPE.ENEMY,
      actor,
      new EnemyBehavior({
        player: props.player,
        bullet: props.bullet,
        container: props.container,
        velocity,
        actor,
        audioListener: props.audioListener,
        bulletsPerShoot: props.bulletsPerShoot,
        delays: props.delays,
      })
    );
    this.hp = props.hp;
    this.velocity = velocity;
  }

  onHit(damage: number) {
    if (typeof this.hp !== 'number') {
      return;
    }
    super.onHit(damage);
    if (this.hp > 0) {
      if ((<EnemyBehavior>this.behavior).stateMachine.not('hurted')) {
        (<EnemyBehavior>this.behavior).hurt();
      }
    } else {
      if ((<EnemyBehavior>this.behavior).stateMachine.not('dead')) {
        (<EnemyBehavior>this.behavior).death();
      }
    }
  }

  onDeath(callback?: Function) {
    (<EnemyBehavior>this.behavior).onDeathCallback = callback;
  }

  onCollide() {
    (<EnemyBehavior>this.behavior).onCollide();
    return false;
  }

  onMessage(message: EnemyMessages) {
    switch (message) {
      case 'in player gunpoint':
        (<EnemyBehavior>this.behavior).onPlayerGunpoint();
        break;
      default:
        break;
    }
  }
}
