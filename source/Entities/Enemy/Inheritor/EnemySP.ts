import { AudioListener } from 'three';
import { EnemyBehaviorModifier } from '../Enemy';
import { EnemyWithModifiers } from './EnemyWithModifiers';
import { BulletFastEasy } from '@/Entities/Bullet/Inheritor/BulletFastEasy';
import { Player } from '@/Entities/Player/Player';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { basicEnemySeq } from './BasicEnemyBehaviorTree';
import { ENEMY, ENEMY_COLORS, ENEMY_TEXTURES } from '@/constants';

interface EnemySPProps {
  position: { x: number; y: number; z: number };
  player: Player;
  container: EntitiesContainer;
  audioListener: AudioListener;
  behaviorModifier?: EnemyBehaviorModifier;
}

export class EnemySP extends EnemyWithModifiers {
  constructor(props: EnemySPProps) {
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
      behaviorTreeRoot: basicEnemySeq,
    });
  }
}

