import { Vector2 } from 'three';
import { Entity } from '@/core/Entities/Entity';
import { RoomType } from '@/Entities/Enemy/Factory/EnemyFactory';

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
  position: Vector2;
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
  getCells: (size: Vector2) => RoomCell[];
  roomType: RoomType;
}

const enemyForDoor1Tag = 'enemyForDoor1';
const doorForEnemy1Tag = 'doorForEnemy1';

export const constructors: RoomConstructor[] = [
  {
    roomType: RoomType.SexualPerversions,
    getCells: () => {
      const doorEvent = {
        type: RoomCellEventType.OpenDoorIfNoEntitiesWithTag,
        targetEntityTag: doorForEnemy1Tag,
      };
      return [
        {
          position: new Vector2(2, 2),
          type: RoomCellType.Enemy,
          tag: enemyForDoor1Tag,
          event: doorEvent,
          kind: EnemyKind.Zombie,
        },
        {
          position: new Vector2(4, 2),
          type: RoomCellType.Enemy,
          tag: enemyForDoor1Tag,
          event: doorEvent,
          kind: EnemyKind.Commando,
        },
        { position: new Vector2(4, 4), type: RoomCellType.DoorWall, mini: false, tag: doorForEnemy1Tag },
      ];
    },
  },
  {
    roomType: RoomType.Apathy,
    getCells: (size) => {
      const stipSize = 2;
      const padding = 4;
      const centerX = Math.floor(size.x / 2);
      const centerY = Math.floor(size.y / 2);
      const cells: RoomCell[] = [
        { position: new Vector2(2, 2), type: RoomCellType.Enemy, kind: EnemyKind.Flyguy },
        { position: new Vector2(2, size.y - 3), type: RoomCellType.Enemy, kind: EnemyKind.Flyguy },
        { position: new Vector2(size.x - 3, size.y - 3), type: RoomCellType.Enemy, kind: EnemyKind.Flyguy },
        { position: new Vector2(size.x - 3, 2), type: RoomCellType.Enemy, kind: EnemyKind.Flyguy },
      ];
      for (let x = centerX - stipSize; x < centerX + stipSize; x++) {
        if (x % 2 !== 0) {
          continue;
        }
        cells.push(
          { position: new Vector2(x, padding), type: RoomCellType.DoorWall, mini: false, tag: doorForEnemy1Tag },
          { position: new Vector2(x, size.y - padding), type: RoomCellType.Wall, mini: false, },
        );
      }
      for (let y = centerY - stipSize; y < centerY + stipSize; y++) {
        if (y % 2 !== 0) {
          continue;
        }
        cells.push(
          { position: new Vector2(padding, y), type: RoomCellType.Wall, mini: false, },
          { position: new Vector2(size.x - padding, y), type: RoomCellType.Wall, mini: false, },
        );
      }
      return cells;
    },
  },
  {
    roomType: RoomType.Cowardice,
    getCells: () => {
      return [
        { position: new Vector2(3, 10), type: RoomCellType.Enemy, kind: EnemyKind.Flyguy },
        { position: new Vector2(9, 3), type: RoomCellType.Enemy, kind: EnemyKind.Flyguy },
        { position: new Vector2(10, 15), type: RoomCellType.Enemy, kind: EnemyKind.Flyguy },
        { position: new Vector2(16, 9), type: RoomCellType.Enemy, kind: EnemyKind.Flyguy },

        { position: new Vector2(3, 3), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(3, 16), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(5, 5), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(5, 14), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(7, 7), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(7, 8), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(7, 11), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(7, 12), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(8, 7), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(11, 7), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(11, 12), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(12, 7), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(12, 8), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(12, 11), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(12, 12), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(14, 5), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(14, 14), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(16, 3), type: RoomCellType.Wall, mini: false, },
        { position: new Vector2(16, 16), type: RoomCellType.Wall, mini: false, },
      ];
    },
  }
];

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

  private updateRoomConstructorIndex() {
    this.currentRoomConstructorIndex++;
    if (this.currentRoomConstructorIndex >= constructors.length) {
      this.dungeonLevel++;
      this.currentRoomConstructorIndex = 0;
    }
  }

  getNextDungeonRoomConstructor(): DungeonRoomConstructor {
    this.updateRoomConstructorIndex();
    return {
      constructor: constructors[this.currentRoomConstructorIndex],
      dungeonLevel: this.dungeonLevel,
    };
  }
}
