import { AudioListener } from 'three';
import { Enemy } from '../Enemy';
import { BulletFastEasy } from '@/Entities/Bullet/Inheritor/BulletFastEasy';
import { Player } from '@/Entities/Player/Player';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { ENEMY, ENEMY_COLORS, ENEMY_TEXTURES } from '@/constants';

interface EnemySPProps {
  position: { x: number; y: number; z: number };
  player: Player;
  container: EntitiesContainer;
  audioListener: AudioListener;
  isKamikaze?: boolean;
}

export class EnemySP extends Enemy {
  constructor(props: EnemySPProps) {
    const walkSpeed = props.isKamikaze ?
      ENEMY.WALK_SPEED_KAMIKAZE :
      ENEMY.WALK_SPEED;
    super({
      ...props,
      textures: ENEMY_TEXTURES.SP,
      color: ENEMY_COLORS.SP,
      hp: 1,
      BulletClass: BulletFastEasy,
      walkSpeed,
      bulletsPerShoot: { min: 1, max: 3 },
      delays: {
        ...ENEMY.DELAYS,
        strafe: ENEMY.DELAYS.strafe * 0.7,
      },
      isKamikaze: props.isKamikaze,
    });
  }
}

