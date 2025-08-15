import { Enemy } from '@/Entities/Enemy/Enemy';

export type PlayerLogsValue = number[];

export class PlayerLogs {
  values: PlayerLogsValue;

  constructor() {
    this.values = [];
  }

  enemyKill(enemy: Enemy) {
    this.values.push(enemy.kind);
  }
}
