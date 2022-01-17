import { Vector3, AudioListener, Color } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE, ENTITY_MESSAGES } from '@/constants';
import { EnemyActor } from './EnemyActor';
import { EnemyBehavior } from './EnemyBehavior';
import { Player } from '@/Entities/Player/Player';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';

export interface EnemyTextures {
  walk1: string;
  walk2: string;
  death: string;
}

export interface EnemyProps {
  position: { x: number; y: number; z: number };
  player: Player;
  BulletClass: typeof Bullet;
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
  isKamikaze?: boolean;
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
        BulletClass: props.BulletClass,
        container: props.container,
        velocity,
        actor,
        audioListener: props.audioListener,
        isKamikaze: props.isKamikaze,
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

  onDeath(callback?: (enemy: Entity) => void) {
    (<EnemyBehavior>this.behavior).onDeathCallback = () => {
      if (callback) {
        callback(this);
      }
    };
  }

  onCollide(entity: Entity) {
    (<EnemyBehavior>this.behavior).onCollide(entity);
    return false;
  }

  onMessage(message: ENTITY_MESSAGES) {
    switch (message) {
      case ENTITY_MESSAGES.inPlayerGunpoint:
        (<EnemyBehavior>this.behavior).onPlayerGunpoint();
        break;
      default:
        break;
    }
  }
}
