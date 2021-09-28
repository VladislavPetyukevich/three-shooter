import { AudioListener } from 'three';
import { Enemy } from '../Enemy';
import { BulletSlowMeidum } from '@/Entities/Bullet/Inheritor/BulletSlowMedium';
import { Player } from '@/Entities/Player/Player';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { ENEMY_COLORS, ENEMY_TEXTURES } from '@/constants';

interface EnemyApathyProps {
  position: { x: number; y: number; z: number };
  player: Player;
  container: EntitiesContainer;
  audioListener: AudioListener;
}

export class EnemyCowardice extends Enemy {
  constructor(props: EnemyApathyProps) {
    super({
      ...props,
      textures: ENEMY_TEXTURES.Cowardice,
      color: ENEMY_COLORS.Cowardice,
      hp: 1,
      bullet: BulletSlowMeidum,
      bulletsPerShoot: { min: 1, max: 1 },
    });
  }
}

