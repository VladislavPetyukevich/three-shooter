import { EnemyWithModifiers } from './EnemyWithModifiers';
import { BulletSlowMeidum } from '@/Entities/Bullet/Inheritor/BulletSlowMedium';
import { ENEMY, ENEMY_COLORS, ENEMY_TEXTURES } from '@/constants';
import { EnemyInheritorProps } from './EnemyInheritor';

export class EnemyApathy extends EnemyWithModifiers {
  constructor(props: EnemyInheritorProps) {
    super({
      ...props,
      textures: ENEMY_TEXTURES.Apathy,
      color: ENEMY_COLORS.Apathy,
      hp: 1,
      BulletClass: BulletSlowMeidum,
      walkSpeed: ENEMY.WALK_SPEED,
      walkSpeedFactors: {
        kamikaze: ENEMY.WALK_SPEED_FACTOR_KAMIKAZE,
        parasite: ENEMY.WALK_SPEED_FACTOR_PARASITE,
      },
      bulletsPerShoot: { min: 1, max: 1 },
      delays: {
        ...ENEMY.DELAYS,
        shoot: ENEMY.DELAYS.shoot * 0.7
      },
    });
  }
}

