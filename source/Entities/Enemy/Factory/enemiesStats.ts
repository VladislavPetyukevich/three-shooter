import {
  apathyEnemyTree,
  sexualPerversionsEnemyTree,
} from '@/Entities/Enemy/Factory/behaviorTrees';
import { BulletSlowMeidum } from '@/Entities/Bullet/Inheritor/BulletSlowMedium';
import { BulletFastEasy } from '@/Entities/Bullet/Inheritor/BulletFastEasy';
import { ENEMY } from '@/constants';
import { ENEMY_TEXTURES } from '@/constantsAssets';
import { EnemiesStats } from './EnemyFactory';
import { EnemyKind } from '@/dungeon/DungeonRoom';

export const enemiesStats: EnemiesStats = {
  [EnemyKind.Apathy]: {
    hp: 20,
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
    behaviorTreeRoot: apathyEnemyTree,
    textures: ENEMY_TEXTURES.Apathy,
  },
  [EnemyKind.Cowardice]: {
    hp: 30,
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
    behaviorTreeRoot: apathyEnemyTree,
    textures: ENEMY_TEXTURES.Cowardice,
  },
  [EnemyKind.SexualPerversions]: {
    hp: 5,
    onHitDamage: { min: 10, max: 40 },
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
    behaviorTreeRoot: sexualPerversionsEnemyTree,
    textures: ENEMY_TEXTURES.SexualPerversions,
  },
};
