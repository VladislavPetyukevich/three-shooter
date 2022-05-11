import { AudioListener } from 'three';
import { Enemy } from '../Enemy';
import { BulletSlowMeidum } from '@/Entities/Bullet/Inheritor/BulletSlowMedium';
import { Player } from '@/Entities/Player/Player';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import { basicEnemySeq } from './BasicEnemyBehaviorTree';
import { ENEMY, ENEMY_COLORS, ENEMY_TEXTURES } from '@/constants';

interface EnemyWithSpawnerProps {
  position: { x: number; y: number; z: number };
  player: Player;
  container: EntitiesContainer;
  audioListener: AudioListener;
}

export class EnemyWithSpawner extends Enemy {
  constructor(props: EnemyWithSpawnerProps) {
    super({
      ...props,
      textures: ENEMY_TEXTURES.Apathy,
      color: ENEMY_COLORS.Apathy,
      hp: 1,
      BulletClass: BulletSlowMeidum,
      walkSpeed: ENEMY.WALK_SPEED,
      bulletsPerShoot: { min: 0, max: 1 },
      delays: {
        ...ENEMY.DELAYS,
        shoot: ENEMY.DELAYS.shoot * 1.7
      },
      behaviorTreeRoot: basicEnemySeq,
      onHitDamage: 0,
    });
  }
}
