import { Vector3, AudioListener, Color } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE, ENTITY_MESSAGES, ENEMY, ENEMY_COLORS, lighter } from '@/constants';
import { EnemyActor } from './EnemyActor';
import { BehaviorTree, BehaviorTreeNode } from './BehaviorTree';
import { EnemyBehavior } from './EnemyBehavior';
import { Player } from '@/Entities/Player/Player';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { SmoothColorChange } from '@/Animations/SmoothColorChange';
import { JumpAnimation } from '@/Animations/JumpAnimation';
import { HurtAnimation } from '@/Animations/HurtAnimation';

export interface EnemyTextures {
  walk1: string;
  walk2: string;
  death: string;
}

export const enum EnemyBehaviorModifier {
  kamikaze,
  parasite,
  withSpawner,
}

export interface EnemyProps {
  position: { x: number; y: number; z: number };
  player: Player;
  BulletClass: typeof Bullet;
  container: EntitiesContainer;
  audioListener: AudioListener;
  behaviorTreeRoot: BehaviorTreeNode;
  color: Color;
  textures: EnemyTextures;
  hp: number;
  walkSpeed: number;
  onHitDamage: number;
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
  behaviorTree: BehaviorTree;
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
        onHitDamage: props.onHitDamage,
      })
    );
    this.container = props.container;
    this.hp = props.hp;
    this.velocity = velocity;
    this.isDead = false;
    this.behavior.gun.setBulletAuthor(this);
    this.behavior.onDeathCallback = () => {
      this.handleDeath();
    };

    this.behaviorTree = new BehaviorTree(
      props.behaviorTreeRoot,
      this.behavior
    );
  }

  onHit(damage: number, entity?: Entity) {
    if (entity?.type === ENTITY_TYPE.ENEMY) {
      this.behavior.setFollowingEnemy(entity);
    }
    if (this.isDead) {
      return;
    }
    super.onHit(damage);
    if (this.hp <= 0) {
      this.handleDeath();
    } else if (!this.behavior.isHurt) {
      this.behavior.onHit();
      this.animations = [];
      this.addAnimation(new HurtAnimation({
        actor: this.actor,
        durationSeconds: ENEMY.HURT_TIME_OUT,
        hurtSpriteIndex: 2,
        onEnd: () => this.onHurtEnd(),
      }));
    }
  }

  onHurtEnd() {
    this.behavior.onHurtEnd();
  };

  onDeath(callback: Enemy['onDeathCallback']) {
    this.onDeathCallback = callback;
  }

  handleDeath() {
    this.isDead = true;
    this.behavior.velocity.set(0, 0, 0);
    this.animations = [];
    this.addAnimation(new JumpAnimation({
      actor: this.actor,
      jumpHeight: 0.7,
      durationSeconds: 0.43,
    }));
    if (this.onDeathCallback) {
      this.onDeathCallback(this);
    }
  }

  onCollide(entity: Entity) {
    this.behavior.updateColidedEntity(entity);
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
    if (!this.isDead) {
      this.behaviorTree.update(delta);
      this.behavior.updateColidedEntity(undefined);
    } else if (this.animations.length === 0) {
      this.container.remove(this.actor.mesh);
    }
  }
}
