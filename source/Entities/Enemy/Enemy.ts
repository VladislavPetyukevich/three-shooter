import { Vector3, AudioListener } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE, ENTITY_MESSAGES, ENEMY } from '@/constants';
import { EnemyActor } from './EnemyActor';
import { BehaviorTree, BehaviorTreeNode } from './BehaviorTree';
import { RoomType } from './Factory/EnemyFactory';
import { EnemyBehavior } from './EnemyBehavior';
import { Player } from '@/Entities/Player/Player';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { HurtAnimation } from '@/Animations/HurtAnimation';
import { EnemyKind } from '@/dungeon/DungeonRoom';
import { AudioSlices } from '@/core/AudioSlices';
import { AudioSliceName } from '@/constantsAssets';
import { DeathAnimation } from '@/Animations/DeathAnimation';

export interface EnemyTextures {
  walk1: string;
  walk2: string;
  walk3: string;
  walk4: string;
  hurt: string;
  death1: string;
  death2: string;
  death3: string;
  death4: string;
  attack: string;
}

export interface EnemyGunProps {
  recoilTime: number;
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
  kind: EnemyKind;
  roomType: RoomType;
  textures: EnemyTextures;
  hp: number;
  walkSpeed: number;
  onHitDamage?: { min: number; max: number; };
  bulletsPerShoot: number;
  hurtChance: number;
  delays: EnemyDelays;
  audioSlices: AudioSlices<AudioSliceName>;
}

export type OnDeathCallback = (entity: Enemy) => void;

export class Enemy extends Entity<EnemyActor, EnemyBehavior> {
  container: EntitiesContainer;
  behaviorTree: BehaviorTree;
  kind: EnemyKind;
  roomType: EnemyProps['roomType'];
  hp: number;
  isDead: boolean;
  onDeathCallbacks: OnDeathCallback[];

  constructor(props: EnemyProps) {
    const velocity = new Vector3();
    const actor = new EnemyActor({
      position: props.position,
      player: props.player,
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
        walkSpeed: props.walkSpeed,
        bulletsPerShoot: props.bulletsPerShoot,
        delays: props.delays,
        onHitDamage: props.onHitDamage,
        hurtChance: props.hurtChance,
        audioSlices: props.audioSlices,
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
    this.behavior.onAttackCallback = () => {
      this.handleAttack();
    };

    this.behaviorTree = new BehaviorTree(
      props.behaviorTreeRoot,
      this.behavior
    );
    this.kind = props.kind;
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
      return;
    } else if (!this.behavior.isBusy) {
      this.behavior.onHit();
    }
    this.handleHurtAnimation();
  }

  handleHurtAnimation() {
    this.animations = [];
    this.addAnimation(new HurtAnimation({
      actor: this.actor,
      durationSeconds: ENEMY.HURT_TIME_OUT,
      hurtSpriteIndex: 4,
      onEnd: () => this.onBusyEnd(),
    }));
  }

  onBusyEnd() {
    this.behavior.onBusyEnd();
  };

  addOnDeathCallback(callback: OnDeathCallback) {
    this.onDeathCallbacks.push(callback);
  }

  handleDeath() {
    this.hp = 0;
    this.isDead = true;
    this.behavior.velocity.set(0, 0, 0);
    this.animations = [];
    this.addAnimation(new DeathAnimation({
      actor: this.actor,
      durationSeconds: ENEMY.DEATH_TIME_OUT,
      spriteIndices: [5, 6, 7, 8],
    }));
    this.onDeathCallbacks.forEach(callback => callback(this));
  }

  handleAttack() {
    this.addAnimation(new HurtAnimation({
      actor: this.actor,
      durationSeconds: ENEMY.HURT_TIME_OUT,
      hurtSpriteIndex: 9,
      onEnd: () => this.onBusyEnd(),
    }));
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
