import {
  basicEnemySeq,
  kamikazeEnemySeq,
  longRangeEnemySeq,
} from '@/Entities/Enemy/Factory/behaviorTrees';
import { BulletSlowMeidum } from '@/Entities/Bullet/Inheritor/BulletSlowMedium';
import { BulletFastEasy } from '@/Entities/Bullet/Inheritor/BulletFastEasy';
import { ENEMY } from '@/constants';
import { ENEMY_TEXTURES } from '@/constantsAssets';
import { EnemiesStats } from './EnemyFactory';
import { EnemyKind } from '@/dungeon/DungeonRoom';

export const enemiesStats: EnemiesStats = {
  [EnemyKind.Flyguy]: {
    hp: 20,
    hurtChance: 0.78,
    BulletClass: BulletSlowMeidum,
    gunProps: {
      recoilTime: 0.5,
    },
    bulletsPerShoot: 3,
    walkSpeed: ENEMY.WALK_SPEED,
    delays: {
      ...ENEMY.DELAYS,
      shoot: ENEMY.DELAYS.shoot * 0.7
    },
    behaviorTreeRoot: basicEnemySeq,
    textures: ENEMY_TEXTURES.Flyguy,
  },
  [EnemyKind.Commando]: {
    hp: 30,
    hurtChance: 0.66,
    BulletClass: BulletFastEasy,
    gunProps: {
      recoilTime: 0.01,
    },
    bulletsPerShoot: 6,
    walkSpeed: ENEMY.WALK_SPEED,
    delays: {
      ...ENEMY.DELAYS,
      strafe: ENEMY.DELAYS.strafe * 0.7,
    },
    behaviorTreeRoot: longRangeEnemySeq,
    textures: ENEMY_TEXTURES.Commando,
  },
  [EnemyKind.Zombie]: {
    hp: 5,
    onHitDamage: { min: 10, max: 40 },
    hurtChance: 0.0,
    BulletClass: BulletSlowMeidum,
    gunProps: {
      recoilTime: 0.1,
    },
    bulletsPerShoot: 0,
    walkSpeed: ENEMY.WALK_SPEED * ENEMY.WALK_SPEED_FACTOR_KAMIKAZE,
    delays: {
      ...ENEMY.DELAYS,
      strafe: ENEMY.DELAYS.strafe * 0.7,
      gunpointStrafe: ENEMY.DELAYS.gunpointStrafe * 0.4,
      movement: ENEMY.KAMIKAZE_MOVEMENT_TIME_OUT,
    },
    behaviorTreeRoot: kamikazeEnemySeq,
    textures: ENEMY_TEXTURES.Zombie,
  },
  [EnemyKind.Slayer]: {
    hp: 30,
    hurtChance: 0.66,
    BulletClass: BulletFastEasy,
    gunProps: {
      recoilTime: 0.01,
    },
    bulletsPerShoot: 6,
    walkSpeed: ENEMY.WALK_SPEED,
    delays: {
      ...ENEMY.DELAYS,
      strafe: ENEMY.DELAYS.strafe * 0.7,
    },
    behaviorTreeRoot: longRangeEnemySeq,
    textures: ENEMY_TEXTURES.Slayer,
  },
  [EnemyKind.Tank]: {
    hp: 30,
    hurtChance: 0.66,
    BulletClass: BulletFastEasy,
    gunProps: {
      recoilTime: 0.01,
    },
    bulletsPerShoot: 6,
    walkSpeed: ENEMY.WALK_SPEED,
    delays: {
      ...ENEMY.DELAYS,
      strafe: ENEMY.DELAYS.strafe * 0.7,
    },
    behaviorTreeRoot: longRangeEnemySeq,
    textures: ENEMY_TEXTURES.Tank,
  },
  [EnemyKind.Soldier]: {
    hp: 30,
    hurtChance: 0.66,
    BulletClass: BulletFastEasy,
    gunProps: {
      recoilTime: 0.01,
    },
    bulletsPerShoot: 6,
    walkSpeed: ENEMY.WALK_SPEED,
    delays: {
      ...ENEMY.DELAYS,
      strafe: ENEMY.DELAYS.strafe * 0.7,
    },
    behaviorTreeRoot: longRangeEnemySeq,
    textures: ENEMY_TEXTURES.Soldier,
  },
};
