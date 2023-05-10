import { AudioListener } from 'three';
import { Player } from '@/Entities/Player/Player';
import { EntitiesContainer } from '@/core/Entities/EntitiesContainer';
import {
  Enemy,
  EnemyGunProps,
  EnemyDelays,
} from '@/Entities/Enemy/Enemy';
import { BehaviorTreeNode } from '../BehaviorTree';
import { Bullet } from '@/Entities/Bullet/Bullet';
import { ENEMY_COLORS } from '@/constants';
import { EnemyTexturesSet } from '@/constantsAssets';
import { enemiesStats } from './enemiesStats';
import { EnemyKind } from '@/dungeon/DungeonRoom';

export const enum RoomType {
  Neutral,
  Apathy,
  Cowardice,
  SexualPerversions,
}

interface Range {
  min: number;
  max: number;
}

interface EnemyKindStats {
  hp: number;
  onHitDamage?: Range;
  hurtChance: number;
  BulletClass: typeof Bullet;
  gunProps: EnemyGunProps;
  bulletsPerShoot: Range;
  walkSpeed: number;
  delays: EnemyDelays;
  behaviorTreeRoot: BehaviorTreeNode;
  textures: EnemyTexturesSet;
}

export type EnemiesStats = {
  [kind in EnemyKind]: EnemyKindStats;
}

export interface CreateEnemyProps {
  position: { x: number; y: number; z: number };
  player: Player;
  container: EntitiesContainer;
  audioListener: AudioListener;
  roomType: RoomType;
  kind: EnemyKind;
}

export class EnemyFactory {
  static stats: EnemiesStats = enemiesStats;
  createEnemy(props: CreateEnemyProps) {
    const stats = EnemyFactory.stats[props.kind];
    return new Enemy({
      ...props,
      ...stats,
      color: this.getEnemyColor(props),
    });
  }

  getEnemyColor(props: CreateEnemyProps) {
    const roomType = props.roomType;
    switch (roomType) {
      case RoomType.Apathy: return ENEMY_COLORS.Apathy;
      case RoomType.Cowardice: return ENEMY_COLORS.Cowardice;
      case RoomType.SexualPerversions: return ENEMY_COLORS.SP;
      default:
        throw new Error(`Unknown roomType: ${roomType}`);
    }
  }
}
