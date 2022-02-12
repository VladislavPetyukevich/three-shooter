import { AudioListener } from 'three';
import { EnemyBehaviorModifier } from '../Enemy';
import { EnemyWithModifiers } from './EnemyWithModifiers';
import { BulletSlowMeidum } from '@/Entities/Bullet/Inheritor/BulletSlowMedium';
import { Player } from '@/Entities/Player/Player';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { ENEMY, ENEMY_COLORS, ENEMY_TEXTURES } from '@/constants';

interface EnemyApathyProps {
  position: { x: number; y: number; z: number };
  player: Player;
  container: EntitiesContainer;
  audioListener: AudioListener;
  behaviorModifier?: EnemyBehaviorModifier;
}

export class EnemyCowardice extends EnemyWithModifiers {
  constructor(props: EnemyApathyProps) {
    super({
      ...props,
      textures: ENEMY_TEXTURES.Cowardice,
      color: ENEMY_COLORS.Cowardice,
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
        gunpointStrafe: ENEMY.DELAYS.gunpointStrafe * 0.4,
      },
    });
  }
}

