import { EnemyWithModifiers } from './EnemyWithModifiers';
import { BulletFastEasy } from '@/Entities/Bullet/Inheritor/BulletFastEasy';
import { ENEMY, ENEMY_COLORS, ENEMY_TEXTURES } from '@/constants';
import { EnemyInheritorProps } from './EnemyInheritor';

export class EnemySP extends EnemyWithModifiers {
  constructor(props: EnemyInheritorProps) {
    super({
      ...props,
      textures: ENEMY_TEXTURES.SP,
      color: ENEMY_COLORS.SP,
      hp: 1,
      BulletClass: BulletFastEasy,
      walkSpeed: ENEMY.WALK_SPEED,
      walkSpeedFactors: {
        kamikaze: ENEMY.WALK_SPEED_FACTOR_KAMIKAZE,
        parasite: ENEMY.WALK_SPEED_FACTOR_PARASITE,
      },
      bulletsPerShoot: { min: 1, max: 3 },
      delays: {
        ...ENEMY.DELAYS,
        strafe: ENEMY.DELAYS.strafe * 0.7,
      },
    });
  }
}

