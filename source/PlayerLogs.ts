import { Enemy } from '@/Entities/Enemy/Enemy';

export type PlayerLogsValue = number[][];

export class PlayerLogs {
  values: PlayerLogsValue;

  constructor(seed: number) {
    this.values = [[seed]];
  }

  roomVisit(value: number) {
    this.values.push([value]);
  }

  enemyKill(enemy: Enemy) {
    const lastRoom = this.values[this.values.length - 1];
    if (!lastRoom) {
      throw new Error('Last room not found in enemyKill');
    }
    lastRoom.push(enemy.kind);
  }
}
