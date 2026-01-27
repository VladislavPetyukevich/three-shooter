import { Vector3, AudioListener } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE, ENTITY_MESSAGES, ENEMY } from '@/constants';
import { EnemyActor } from './EnemyActor';
import { BehaviorTree, BehaviorTreeNode } from './BehaviorTree';
import { EnemyBehavior } from './EnemyBehavior';
import { Player } from '@/Entities/Player/Player';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { HurtAnimation } from '@/Animations/HurtAnimation';
import { EnemyKind } from '@/dungeon/DungeonRoom';
import { AudioSlices } from '@/core/AudioSlices';
import { AudioSliceName } from '@/constantsAssets';
import { DeathAnimation } from '@/Animations/DeathAnimation';
import { HitParticles } from '@/Entities/HitParticles/HitParticles';
import { SpawnAnimation } from '@/Animations/SpawnAnimation';

export interface EnemyTextures {
  walk1: string;
  walk2: string;
  hurt: string;
  death1: string;
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
  textures: EnemyTextures;
  hp: number;
  walkSpeed: number;
  onHitDamage?: { min: number; max: number; };
  bulletsPerShoot: number;
  delays: EnemyDelays;
  audioSlices: AudioSlices<AudioSliceName>;
}

export type OnDeathCallback = (entity: Enemy) => void;

export class Enemy extends Entity<EnemyActor, EnemyBehavior> {
  container: EntitiesContainer;
  behaviorTree: BehaviorTree;
  kind: EnemyKind;
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
        audioSlices: props.audioSlices,
      })
    );
    this.container = props.container;
    this.hp = props.hp;
    this.velocity = velocity;
    this.isDead = false;
    this.behavior.gun.setBulletAuthor(this);
    this.onDeathCallbacks = [];
    this.behavior.onDeathCallback = () => {
      this.handleDeath();
    };

    this.behaviorTree = new BehaviorTree(
      props.behaviorTreeRoot,
      this.behavior,
      this,
    );
    this.kind = props.kind;

    // Start with spawn animation
    this.handleSpawnAnimation();
  }

  onHit(damage: number) {
    if (this.isDead) {
      return;
    }
    super.onHit(damage);
    this.behavior.onHit();
    
    // Spawn hit particles at enemy position
    const particlePosition = this.mesh.position.clone();
    particlePosition.y += 0.5; // Slightly above center of enemy
    const hitParticles = new HitParticles({
      position: particlePosition,
      container: this.container,
    });
    this.container.add(hitParticles);
    
    if (this.hp <= 0) {
      this.handleDeath();
      return;
    }
    this.handleHurtAnimation();
  }

  onCollide(entity: Entity) {
    if (entity.type === ENTITY_TYPE.WALL || entity.type === ENTITY_TYPE.ENEMY) {
      this.behavior.velocity.negate();
      return false;
    }
    if (entity.type === ENTITY_TYPE.PLAYER) {
      this.behavior.collidedPlayer = true;
      return false;
    }
    return true;
  }

  handleSpawnAnimation() {
    this.addAnimation(new SpawnAnimation({
      actor: this.actor,
      durationSeconds: ENEMY.SPAWN_TIME_OUT,
    }));
  }

  handleHurtAnimation() {
    this.animations = [];
    this.addAnimation(new HurtAnimation({
      actor: this.actor,
      durationSeconds: ENEMY.HURT_TIME_OUT,
      hurtSpriteIndex: 3,
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
    this.behavior.onBusyStart();
    this.isDead = true;
    this.animations = [];
    this.addAnimation(new DeathAnimation({
      actor: this.actor,
      durationSeconds: ENEMY.DEATH_TIME_OUT,
      spriteIndices: [3],
    }));
    this.onDeathCallbacks.forEach(callback => callback(this));
  }

  onMessage(message: ENTITY_MESSAGES) {
    switch (message) {
      case ENTITY_MESSAGES.inPlayerGunpoint:
        this.behavior.inPlayerGunpoint = true;
        break;
      default:
        break;
    }
  }

  update(delta: number) {
    super.update(delta);
    if (!this.isDead) {
      this.behaviorTree.update(delta);
    } else if (this.animations.length === 0) {
      this.container.remove(this.mesh);
    }
    this.behavior.inPlayerGunpoint = false;
    this.behavior.collidedPlayer = false;
  }
}
