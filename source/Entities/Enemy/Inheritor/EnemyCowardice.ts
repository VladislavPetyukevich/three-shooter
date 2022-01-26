import { AudioListener } from 'three';
import { Enemy } from '../Enemy';
import { BulletSlowMeidum } from '@/Entities/Bullet/Inheritor/BulletSlowMedium';
import { Player } from '@/Entities/Player/Player';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { ENEMY, ENEMY_COLORS, ENEMY_TEXTURES } from '@/constants';

interface EnemyApathyProps {
  position: { x: number; y: number; z: number };
  player: Player;
  container: EntitiesContainer;
  audioListener: AudioListener;
  isKamikaze?: boolean;
  isParasite?: boolean;
}

export class EnemyCowardice extends Enemy {
  constructor(props: EnemyApathyProps) {
    const walkSpeed =
      props.isKamikaze ?
      ENEMY.WALK_SPEED_KAMIKAZE :
      props.isParasite ?
      ENEMY.WALK_SPEED_PARASITE :
      ENEMY.WALK_SPEED;
    super({
      ...props,
      textures: ENEMY_TEXTURES.Cowardice,
      color: ENEMY_COLORS.Cowardice,
      hp: 1,
      BulletClass: BulletSlowMeidum,
      walkSpeed,
      bulletsPerShoot: { min: 1, max: 1 },
      delays: {
        ...ENEMY.DELAYS,
        gunpointStrafe: ENEMY.DELAYS.gunpointStrafe * 0.4,
      },
      isKamikaze: props.isKamikaze,
    });
  }
}

