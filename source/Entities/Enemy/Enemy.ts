import { Vector3, AudioListener, Color } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE, ENTITY_MESSAGES, ENEMY, ENEMY_COLORS, lighter } from '@/constants';
import { EnemyActor } from './EnemyActor';
import { EnemyBehavior } from './EnemyBehavior';
import { Player } from '@/Entities/Player/Player';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { SmoothColorChange } from '@/Animations/SmoothColorChange';
import { JumpAnimation } from '@/Animations/JumpAnimation';

export interface EnemyTextures {
  walk1: string;
  walk2: string;
  death: string;
}

export const enum EnemyBehaviorModifier {
  kamikaze,
  parasite,
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
  walkSpeed: number;
  bulletsPerShoot: { min: number; max: number; };
  delays: {
    shoot: number;
    gunpointStrafe: number;
    strafe: number;
  };
  behaviorModifier?: EnemyBehaviorModifier;
}

export class Enemy extends Entity<EnemyActor, EnemyBehavior> {
  container: EntitiesContainer;
  hp: number;
  isDead: boolean;
  onDeathCallback?: (entity: Enemy) => void;

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
        behaviorModifier: props.behaviorModifier,
        walkSpeed: props.walkSpeed,
        bulletsPerShoot: props.bulletsPerShoot,
        delays: props.delays,
      })
    );
    this.container = props.container;
    this.hp = props.hp;
    this.velocity = velocity;
    this.isDead = false;
    this.behavior.onDeathCallback = () => {
      this.handleDeath();
    };
  }

  onHit(damage: number) {
    if (typeof this.hp !== 'number') {
      return;
    }
    super.onHit(damage);
    if (this.hp > 0) {
      if (this.behavior.stateMachine.not('hurted')) {
        this.behavior.hurt();
      }
    } else {
      if (this.behavior.stateMachine.not('dead')) {
        this.behavior.death();
      }
    }
  }

  onDeath(callback: Enemy['onDeathCallback']) {
    this.onDeathCallback = callback;
  }

  handleDeath() {
    this.isDead = true;
    this.animations = [];
    this.addAnimation(new JumpAnimation({
      actor: this.actor,
      jumpHeight: 0.7,
      durationSeconds: 0.43,
    }));
  }

  onCollide(entity: Entity) {
    this.behavior.onCollide(entity);
    return false;
  }

  onMessage(message: ENTITY_MESSAGES) {
    switch (message) {
      case ENTITY_MESSAGES.inPlayerGunpoint:
        this.behavior.onPlayerGunpoint();
        break;
      case ENTITY_MESSAGES.infestedByParasite:
        const hpBoost = Math.round(this.hp * ENEMY.PARASITE_HP_BOOST_FACTOR);
        this.hp += Math.min(ENEMY.PARASITE_HP_BOOST_MIN, hpBoost);
        const targetColor = lighter(
          this.actor.material.color,
          ENEMY_COLORS.PARASITE_LIGHTER_FACTOR
        );
        this.addAnimation(new SmoothColorChange({
          actor: this.actor,
          targetColor,
          durationSeconds: 2,
        }));
        break;
      default:
        break;
    }
  }

  update(delta: number) {
    super.update(delta);
    if (this.isDead && this.animations.length === 0) {
      this.container.remove(this.actor.mesh);
    }
  }
}
