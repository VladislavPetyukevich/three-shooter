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
import { AudioSliceName, EnemyTexturesSet } from '@/constantsAssets';
import { enemiesStats } from './enemiesStats';
import { EnemyKind } from '@/dungeon/DungeonRoom';
import { AudioSlices } from '@/core/AudioSlices';

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
  bulletsPerShoot: number;
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
  dungeonLevel: number;
  kind: EnemyKind;
  audioSlices: AudioSlices<AudioSliceName>;
}

export class EnemyFactory {
  static stats: EnemiesStats = enemiesStats;
  createEnemy(props: CreateEnemyProps) {
    const stats = this.getEnemyStats(props.kind, props.dungeonLevel);
    return new Enemy({
      ...props,
      ...stats,
    });
  }

  private getEnemyStats(kind: EnemyKind, dungeonLevel: number) {
    const stats = { ...EnemyFactory.stats[kind] };
    stats.hp *= dungeonLevel + 1;
    stats.walkSpeed += dungeonLevel;
    return stats;
  }
}
