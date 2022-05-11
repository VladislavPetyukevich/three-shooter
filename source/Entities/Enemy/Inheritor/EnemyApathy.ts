import { AudioListener } from 'three';
import { EnemyBehaviorModifier } from '../Enemy';
import { EnemyWithModifiers } from './EnemyWithModifiers';
import { BulletSlowMeidum } from '@/Entities/Bullet/Inheritor/BulletSlowMedium';
import { Player } from '@/Entities/Player/Player';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { BehaviorTreeNode } from '@/Entities/Enemy/BehaviorTree';
import { ENEMY, ENEMY_COLORS, ENEMY_TEXTURES } from '@/constants';

interface EnemyApathyProps {
  position: { x: number; y: number; z: number };
  player: Player;
  container: EntitiesContainer;
  audioListener: AudioListener;
  behaviorTreeRoot: BehaviorTreeNode;
  onHitDamage: number;
  behaviorModifier?: EnemyBehaviorModifier;
}

export class EnemyApathy extends EnemyWithModifiers {
  constructor(props: EnemyApathyProps) {
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

