import { Vector3, AudioListener, Color } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE, ENTITY_MESSAGES, ENEMY, ENEMY_COLORS, lighter } from '@/constants';
import { EnemyActor } from './EnemyActor';
import { BehaviorTree, BehaviorTreeNode } from './BehaviorTree';
import { RoomType } from './Factory/EnemyFactory';
import { EnemyBehavior } from './EnemyBehavior';
import { Player } from '@/Entities/Player/Player';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { GunFireType } from '@/Entities/Gun/Gun';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { SmoothColorChange } from '@/Animations/SmoothColorChange';
import { VaporizationAnimation } from '@/Animations/Vaporization';
import { HurtAnimation } from '@/Animations/HurtAnimation';

export interface EnemyTextures {
  walk1: string;
  walk2: string;
  death: string;
}

export const enum EnemyBehaviorFlag {
  parasite,
  withSpawner,
}

export interface EnemyGunProps {
  fireType: GunFireType;
  recoilTime: number;
  isRaycast: boolean;
}

export interface EnemyDelays {
  shoot: number;
  gunpointStrafe: number;
  strafe: number;
  movement: number;
};

export interface EnemyProps {
  position: { x: number; y: number; z: number };
  player: Player;
  BulletClass: typeof Bullet;
  gunProps: EnemyGunProps;
  container: EntitiesContainer;
  audioListener: AudioListener;
  behaviorTreeRoot: BehaviorTreeNode;
  roomType: RoomType;
  color: Color;
  textures: EnemyTextures;
  hp: number;
  walkSpeed: number;
  onHitDamage?: { min: number; max: number; };
  bulletsPerShoot: { min: number; max: number; };
  hurtChance: number;
  delays: EnemyDelays;
  behaviorFlag?: EnemyBehaviorFlag;
}

export type OnDeathCallback = (entity: Enemy) => void;

export class Enemy extends Entity<EnemyActor, EnemyBehavior> {
  container: EntitiesContainer;
  behaviorTree: BehaviorTree;
  roomType: EnemyProps['roomType'];
  hp: number;
  isDead: boolean;
  onDeathCallbacks: OnDeathCallback[];

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
        gunProps: props.gunProps,
        container: props.container,
        velocity,
        actor,
        audioListener: props.audioListener,
        behaviorFlag: props.behaviorFlag,
        walkSpeed: props.walkSpeed,
        bulletsPerShoot: props.bulletsPerShoot,
        delays: props.delays,
        onHitDamage: props.onHitDamage,
        hurtChance: props.hurtChance,
      })
    );
    this.container = props.container;
    this.hp = props.hp;
    this.roomType = props.roomType;
    this.velocity = velocity;
    this.isDead = false;
    this.behavior.gun.setBulletAuthor(this);
    this.onDeathCallbacks = [];
    this.behavior.onDeathCallback = () => {
      this.handleDeath();
    };
    this.behavior.onBleedCallback = () => {
      this.handleBleed();
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
      this.handleHurtAnimation();
    }
  }

  handleHurtAnimation() {
    if (!this.behavior.isHurt) {
      return;
    }
    this.animations = [];
    this.addAnimation(new HurtAnimation({
      actor: this.actor,
      durationSeconds: ENEMY.HURT_TIME_OUT,
      hurtSpriteIndex: 2,
      onEnd: () => this.onHurtEnd(),
    }));
  }

  onHurtEnd() {
    this.behavior.onHurtEnd();
  };

  addOnDeathCallback(callback: OnDeathCallback) {
    this.onDeathCallbacks.push(callback);
  }

  handleDeath() {
    this.hp = 0;
    this.isDead = true;
    this.behavior.velocity.set(0, 0, 0);
    this.animations = [];
    this.addAnimation(new VaporizationAnimation({
      actor: this.actor,
      durationSeconds: 0.3,
    }));
    this.onDeathCallbacks.forEach(callback => callback(this));
  }

  handleBleed() {
    this.hp--;
    if (this.hp <= 0) {
      this.handleDeath();
      return;
    }
    this.behavior.isHurt = true;
    this.handleHurtAnimation();
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
      this.container.remove(this.mesh);
    }
  }
}
