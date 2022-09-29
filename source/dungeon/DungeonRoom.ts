import { Vector2 } from 'three';
import { randomNumbers } from '@/RandomNumbers';
import { Entity } from '@/core/Entities/Entity';

export const enum RoomCellType {
  Empty,
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

export interface RoomCell {
  position: Vector2;
  type: RoomCellType;
  tag?: Entity['tag'];
  event?: RoomCellEvent;
}

export type RoomConstructor = (size: Vector2) => RoomCell[];

export interface RoomConstructors {
  constructBeforeVisit: RoomConstructor;
  constructAfterVisit: RoomConstructor;
}

const enemyForDoor1Tag = 'enemyForDoor1';
const doorForEnemy1Tag = 'doorForEnemy1';

const emptyConstructor = () => [];

const beforeConstructors = [
  emptyConstructor,
  (size: Vector2) => {
    const stipSize = 2;
    const padding = 4;
    const centerX = Math.floor(size.x / 2);
    const centerY = Math.floor(size.y / 2);
    const cells: RoomCell[] = [];
    for (let x = centerX - stipSize; x < centerX + stipSize; x++) {
      if (x % 2 !== 0) {
        continue;
      }
      cells.push(
        { position: new Vector2(x, padding), type: RoomCellType.DoorWall, tag: doorForEnemy1Tag },
        { position: new Vector2(x, size.y - padding), type: RoomCellType.Wall },
      );
    }
    for (let y = centerY - stipSize; y < centerY + stipSize; y++) {
      if (y % 2 !== 0) {
        continue;
      }
      cells.push(
        { position: new Vector2(padding, y), type: RoomCellType.Wall },
        { position: new Vector2(size.x - padding, y), type: RoomCellType.Wall },
      );
    }
    return cells;
  },
  () => {
    return [
      { position: new Vector2(3, 3 ), type: RoomCellType.Wall },
      { position: new Vector2(3, 16 ), type: RoomCellType.Wall },
      { position: new Vector2(5, 5 ), type: RoomCellType.Wall },
      { position: new Vector2(5, 14 ), type: RoomCellType.Wall },
      { position: new Vector2(7, 7 ), type: RoomCellType.Wall },
      { position: new Vector2(7, 8 ), type: RoomCellType.Wall },
      { position: new Vector2(7, 11 ), type: RoomCellType.Wall },
      { position: new Vector2(7, 12 ), type: RoomCellType.Wall },
      { position: new Vector2(8, 7 ), type: RoomCellType.Wall },
      { position: new Vector2(11, 7 ), type: RoomCellType.Wall },
      { position: new Vector2(11, 12 ), type: RoomCellType.Wall },
      { position: new Vector2(12, 7 ), type: RoomCellType.Wall },
      { position: new Vector2(12, 8 ), type: RoomCellType.Wall },
      { position: new Vector2(12, 11 ), type: RoomCellType.Wall },
      { position: new Vector2(12, 12 ), type: RoomCellType.Wall },
      { position: new Vector2(14, 5 ), type: RoomCellType.Wall },
      { position: new Vector2(14, 14 ), type: RoomCellType.Wall },
      { position: new Vector2(16, 3 ), type: RoomCellType.Wall },
      { position: new Vector2(16, 16 ), type: RoomCellType.Wall },
    ];
  },
  () => {
    return [
      { position: new Vector2(4, 8), type: RoomCellType.Wall },
      { position: new Vector2(4, 11), type: RoomCellType.Wall },
      { position: new Vector2(5, 8), type: RoomCellType.Wall },
      { position: new Vector2(5, 11), type: RoomCellType.Wall },
      { position: new Vector2(8, 4), type: RoomCellType.Wall },
      { position: new Vector2(8, 5), type: RoomCellType.Wall },
      { position: new Vector2(8, 8), type: RoomCellType.Wall },
      { position: new Vector2(8, 11), type: RoomCellType.Wall },
      { position: new Vector2(8, 14), type: RoomCellType.Wall },
      { position: new Vector2(8, 15), type: RoomCellType.Wall },
      { position: new Vector2(11, 4), type: RoomCellType.Wall },
      { position: new Vector2(11, 5), type: RoomCellType.Wall },
      { position: new Vector2(11, 8), type: RoomCellType.Wall },
      { position: new Vector2(11, 11), type: RoomCellType.Wall },
      { position: new Vector2(11, 14), type: RoomCellType.Wall },
      { position: new Vector2(11, 15), type: RoomCellType.Wall },
      { position: new Vector2(14, 8), type: RoomCellType.Wall },
      { position: new Vector2(14, 11), type: RoomCellType.Wall },
      { position: new Vector2(15, 8), type: RoomCellType.Wall },
      { position: new Vector2(15, 11), type: RoomCellType.Wall },
    ];
  },
  () => {
    return [
      { position: new Vector2(4, 8), type: RoomCellType.Wall },
      { position: new Vector2(4, 11), type: RoomCellType.Wall },
      { position: new Vector2(5, 8), type: RoomCellType.Wall },
      { position: new Vector2(5, 11), type: RoomCellType.Wall },
      { position: new Vector2(6, 8), type: RoomCellType.Wall },
      { position: new Vector2(6, 11), type: RoomCellType.Wall },
      { position: new Vector2(7, 8), type: RoomCellType.Wall },
      { position: new Vector2(7, 11), type: RoomCellType.Wall },
      { position: new Vector2(8, 4), type: RoomCellType.Wall },
      { position: new Vector2(8, 5), type: RoomCellType.Wall },
      { position: new Vector2(8, 6), type: RoomCellType.Wall },
      { position: new Vector2(8, 7), type: RoomCellType.Wall },
      { position: new Vector2(8, 12), type: RoomCellType.Wall },
      { position: new Vector2(8, 13), type: RoomCellType.Wall },
      { position: new Vector2(8, 14), type: RoomCellType.Wall },
      { position: new Vector2(8, 15), type: RoomCellType.Wall },
      { position: new Vector2(11, 4), type: RoomCellType.Wall },
      { position: new Vector2(11, 5), type: RoomCellType.Wall },
      { position: new Vector2(11, 6), type: RoomCellType.Wall },
      { position: new Vector2(11, 7), type: RoomCellType.Wall },
      { position: new Vector2(11, 12), type: RoomCellType.Wall },
      { position: new Vector2(11, 13), type: RoomCellType.Wall },
      { position: new Vector2(11, 14), type: RoomCellType.Wall },
      { position: new Vector2(11, 15), type: RoomCellType.Wall },
      { position: new Vector2(12, 8), type: RoomCellType.Wall },
      { position: new Vector2(12, 11), type: RoomCellType.Wall },
      { position: new Vector2(13, 8), type: RoomCellType.Wall },
      { position: new Vector2(13, 11), type: RoomCellType.Wall },
      { position: new Vector2(14, 8), type: RoomCellType.Wall },
      { position: new Vector2(14, 11), type: RoomCellType.Wall },
      { position: new Vector2(15, 8), type: RoomCellType.Wall },
      { position: new Vector2(15, 11), type: RoomCellType.Wall },
    ];
  },
];

const afterConstructors = [
  () => {
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
      },
      {
        position: new Vector2(4, 2),
        type: RoomCellType.Enemy,
        tag: enemyForDoor1Tag,
        event: doorEvent,
      },
    ];
  },
  (size: Vector2) => {
    const cells: RoomCell[] = [];
    const step = 2;
    for (let y = 2; y < size.y / 2; y += step) {
      cells.push(
        { position: new Vector2(2, y), type: RoomCellType.Enemy },
      );
      cells.push(
        { position: new Vector2(size.x - 2, y), type: RoomCellType.Enemy },
      );
    }
    return cells;
  },
  (size: Vector2) => {
    return [
      { position: new Vector2(2, 2), type: RoomCellType.Enemy },
      { position: new Vector2(2, size.y - 3), type: RoomCellType.Enemy },
      { position: new Vector2(size.x - 3, size.y - 3), type: RoomCellType.Enemy },
      { position: new Vector2(size.x - 3, 2), type: RoomCellType.Enemy },
    ];
  },
  () => {
    return [
      { position: new Vector2(4, 4), type: RoomCellType.Enemy },
      { position: new Vector2(4, 15), type: RoomCellType.Enemy },
      { position: new Vector2(15, 4), type: RoomCellType.Enemy },
      { position: new Vector2(15, 15), type: RoomCellType.Enemy },
    ];
  },
  () => {
    return [
      { position: new Vector2(3, 10), type: RoomCellType.Enemy },
      { position: new Vector2(9, 3), type: RoomCellType.Enemy },
      { position: new Vector2(10, 15), type: RoomCellType.Enemy },
      { position: new Vector2(16, 9), type: RoomCellType.Enemy },
    ];
  },
  () => {
    return [
      { position: new Vector2(5, 5), type: RoomCellType.Enemy },
      { position: new Vector2(5, 14), type: RoomCellType.Enemy },
      { position: new Vector2(14, 5), type: RoomCellType.Enemy },
      { position: new Vector2(14, 14), type: RoomCellType.Enemy },
    ];
  },
];

const getRandomConstructor = (constructors: RoomConstructor[]) => {
  const index = Math.floor(randomNumbers.getRandom() * constructors.length);
  return constructors[index];
};

export const getRandomRoomConstructor = (): RoomConstructors => {
  const beforeConstructor = getRandomConstructor(beforeConstructors);
  let afterConstructor = getRandomConstructor(afterConstructors);
  const testRoomSize = new Vector2(10, 10);
  for (let i = 10; i--;) {
    const isConflictedPair = checkConfilt(beforeConstructor, afterConstructor, testRoomSize);
    if (!isConflictedPair) {
      break;
    }
    if (i === 0) {
      afterConstructor = emptyConstructor;
      break;
    }
    afterConstructor = getRandomConstructor(afterConstructors);
  }
  return {
    constructBeforeVisit: beforeConstructor,
    constructAfterVisit: afterConstructor,
  };
};

const checkConfilt = (
  constructorA: RoomConstructor,
  constructorB: RoomConstructor,
  testRoomSize: Vector2
) => {
  const cellsA = constructorA(testRoomSize);
  const cellsB = constructorB(testRoomSize);
  const conflict = cellsA.some(cellA =>
    cellsB.some(cellB => {
      const isSameX = cellA.position.x === cellB.position.x;
      const isSameY = cellA.position.y === cellB.position.y;
      return isSameX && isSameY;
    })
  );
  return conflict;
};

