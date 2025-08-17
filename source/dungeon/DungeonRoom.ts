import { Entity } from '@/core/Entities/Entity';
import { RoomType } from '@/Entities/Enemy/Factory/EnemyFactory';
import { roomsCells } from './rooms';

export const enum EnemyKind {
  Flyguy,
  Commando,
  Zombie,
  Slayer,
  Tank,
  Soldier,
}

export const enum RoomCellType {
  Enemy,
  Wall,
  DoorWall,
}

export const enum RoomCellEventType {
  OpenDoorIfNoEntitiesWithTag,
}

export interface RoomCellEvent {
  type: RoomCellEventType;
  targetEntityTag: Entity['tag'];
}

export interface BasicRoomCell {
  position: { x: number, y: number };
  tag?: Entity['tag'];
  event?: RoomCellEvent;
}

export interface EnemyRoomCell extends BasicRoomCell {
  type: RoomCellType.Enemy;
  kind: EnemyKind;
}

export interface WallRoomCell extends BasicRoomCell {
  type: RoomCellType.Wall | RoomCellType.DoorWall;
  mini: boolean;
}

export type RoomCell =
  WallRoomCell |
  EnemyRoomCell;

export interface RoomConstructor {
  cells: RoomCell[];
  roomType: RoomType;
}

export interface DungeonRoomConstructor {
  constructor: RoomConstructor;
  dungeonLevel: number;
}

export class DungeonRoom {
  currentRoomConstructorIndex: number;
  dungeonLevel: number;

  constructor() {
    this.currentRoomConstructorIndex = -1;
    this.dungeonLevel = 0;
  }

  private getRoomType() {
    const countPerType = roomsCells.length / 3;
    if (this.currentRoomConstructorIndex < countPerType) {
      return RoomType.SexualPerversions;
    } else if (this.currentRoomConstructorIndex < countPerType * 2) {
      return RoomType.Apathy;
    } else {
      return RoomType.Cowardice;
    }
  }

  private updateRoomConstructorIndex() {
    this.currentRoomConstructorIndex++;
    if (this.currentRoomConstructorIndex >= roomsCells.length) {
      this.dungeonLevel++;
      this.currentRoomConstructorIndex = 0;
    }
  }

  getNextDungeonRoomConstructor(): DungeonRoomConstructor {
    this.updateRoomConstructorIndex();
    return {
      constructor: {
        cells: roomsCells[this.currentRoomConstructorIndex],
        roomType: this.getRoomType(),
      },
      dungeonLevel: this.dungeonLevel,
    };
  }
}
