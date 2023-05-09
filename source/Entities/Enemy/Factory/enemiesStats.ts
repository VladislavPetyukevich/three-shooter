import {
  basicEnemySeq,
  kamikazeEnemySeq,
  parasiteEnemySeq,
  longRangeEnemySeq,
  bleedEnemySeq,
} from '@/Entities/Enemy/Factory/behaviorTrees';
import {
  EnemyBehaviorFlag,
} from '@/Entities/Enemy/Enemy';
import { BulletSlowMeidum } from '@/Entities/Bullet/Inheritor/BulletSlowMedium';
import { BulletFastEasy } from '@/Entities/Bullet/Inheritor/BulletFastEasy';
import { GunFireType } from '@/Entities/Gun/Gun';
import { ENEMY } from '@/constants';
import { ENEMY_TEXTURES } from '@/constantsAssets';
import { EnemiesStats } from './EnemyFactory';
import { EnemyKind } from '@/dungeon/DungeonRoom';

export const enemiesStats: EnemiesStats = {
  [EnemyKind.Soul]: {
    hp: 20,
    hurtChance: 0.78,
    BulletClass: BulletSlowMeidum,
    gunProps: {
      fireType: GunFireType.single,
      recoilTime: 0,
      isRaycast: false,
    },
    bulletsPerShoot: { min: 1, max: 3 },
    walkSpeed: ENEMY.WALK_SPEED,
    delays: {
      ...ENEMY.DELAYS,
      shoot: ENEMY.DELAYS.shoot * 0.7
    },
    behaviorTreeRoot: basicEnemySeq,
    textures: ENEMY_TEXTURES.Apathy,
  },
  [EnemyKind.Shooter]: {
    hp: 30,
    hurtChance: 0.66,
    BulletClass: BulletFastEasy,
    gunProps: {
      fireType: GunFireType.automatic,
      recoilTime: 0.3,
      isRaycast: true,
    },
    bulletsPerShoot: { min: 3, max: 6 },
    walkSpeed: ENEMY.WALK_SPEED,
    delays: {
      ...ENEMY.DELAYS,
      strafe: ENEMY.DELAYS.strafe * 0.7,
    },
    behaviorTreeRoot: longRangeEnemySeq,
    textures: ENEMY_TEXTURES.Cowardice,
  },
  [EnemyKind.Kamikaze]: {
    hp: 5,
    onHitDamage: { min: 10, max: 40 },
    hurtChance: 0.0,
    BulletClass: BulletSlowMeidum,
    gunProps: {
      fireType: GunFireType.single,
      recoilTime: 0.0,
      isRaycast: false,
    },
    bulletsPerShoot: { min: 0, max: 0 },
    walkSpeed: ENEMY.WALK_SPEED * ENEMY.WALK_SPEED_FACTOR_KAMIKAZE,
    delays: {
      ...ENEMY.DELAYS,
      strafe: ENEMY.DELAYS.strafe * 0.7,
      gunpointStrafe: ENEMY.DELAYS.gunpointStrafe * 0.4,
      movement: ENEMY.KAMIKAZE_MOVEMENT_TIME_OUT,
    },
    behaviorTreeRoot: kamikazeEnemySeq,
    textures: ENEMY_TEXTURES.Apathy,
  },
  [EnemyKind.Parasite]: {
    hp: 30,
    onHitDamage: { min: 10, max: 20 },
    hurtChance: 0.5,
    BulletClass: BulletSlowMeidum,
    gunProps: {
      fireType: GunFireType.single,
      recoilTime: 0.0,
      isRaycast: false,
    },
    bulletsPerShoot: { min: 0, max: 0 },
    walkSpeed: ENEMY.WALK_SPEED * ENEMY.WALK_SPEED_FACTOR_PARASITE,
    delays: {
      ...ENEMY.DELAYS,
    },
    behaviorTreeRoot: parasiteEnemySeq,
    textures: ENEMY_TEXTURES.SP,
  },
  [EnemyKind.Bleed]: {
    hp: 1000,
    hurtChance: 0.7,
    BulletClass: BulletSlowMeidum,
    gunProps: {
      fireType: GunFireType.single,
      recoilTime: 0.0,
      isRaycast: false,
    },
    bulletsPerShoot: { min: 1, max: 3 },
    walkSpeed: ENEMY.WALK_SPEED,
    delays: {
      ...ENEMY.DELAYS,
      shoot: ENEMY.DELAYS.shoot * 0.7
    },
    behaviorTreeRoot: bleedEnemySeq,
    textures: ENEMY_TEXTURES.SP,
  },
  [EnemyKind.Breeding]: {
    hp: 20,
    hurtChance: 0.78,
    BulletClass: BulletSlowMeidum,
    gunProps: {
      fireType: GunFireType.single,
      recoilTime: 0,
      isRaycast: false,
    },
    bulletsPerShoot: { min: 1, max: 3 },
    walkSpeed: ENEMY.WALK_SPEED,
    delays: {
      ...ENEMY.DELAYS,
    },
    behaviorTreeRoot: basicEnemySeq,
    behaviorFlag: EnemyBehaviorFlag.withSpawner,
    textures: ENEMY_TEXTURES.Apathy,
  },
};
