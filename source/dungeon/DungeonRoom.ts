import { randomNumbers } from '@/RandomNumbers';

export const enum RoomCellType {
  Empty,
  Enemy,
  Wall,
}

interface RoomProps {
  width: number,
  height: number
}

interface RoomCell {
  position: { x: number, y: number },
  type: RoomCellType
}

type Constructor = (props: RoomProps) => RoomCell[];

export interface RoomConstructor {
  constructBeforeVisit: Constructor;
  constructAfterVisit: Constructor;
}

const emptyConstructor = () => [];

const beforeConstructors = [
  emptyConstructor,
  (props: RoomProps) => {
    const stipSize = 2;
    const padding = 4;
    const centerX = Math.floor(props.width / 2);
    const centerY = Math.floor(props.height / 2);
    const cells: RoomCell[] = [];
    for (let x = centerX - stipSize; x < centerX + stipSize; x++) {
      if (x % 2 !== 0) {
        continue;
      }
      cells.push(
        { position: { x: x, y: padding }, type: RoomCellType.Wall },
        { position: { x: x, y: props.height - padding }, type: RoomCellType.Wall },
      );
    }
    for (let y = centerY - stipSize; y < centerY + stipSize; y++) {
      if (y % 2 !== 0) {
        continue;
      }
      cells.push(
        { position: { x: padding, y: y }, type: RoomCellType.Wall },
        { position: { x: props.width - padding, y: y }, type: RoomCellType.Wall },
      );
    }
    return cells;
  },
];

const afterConstructors = [
  (props: RoomProps) => {
    const cells: RoomCell[] = [];
    const step = Math.round(props.width / 4);
    for (let x = 2; x < props.width - 2; x += step) {
      cells.push(
        { position: { x: x, y: props.height - 2 }, type: RoomCellType.Enemy },
      );
    }
    return cells;
  },
  (props: RoomProps) => {
    return [
      { position: { x: 2, y: 2 }, type: RoomCellType.Enemy },
      { position: { x: 2, y: props.height - 3 }, type: RoomCellType.Enemy },
      { position: { x: props.width - 3, y: props.height - 3 }, type: RoomCellType.Enemy },
      { position: { x: props.width - 3, y: 2 }, type: RoomCellType.Enemy },
    ];
  },
];

const getRandomConstructor = (constructors: Constructor[]) => {
  const index = Math.floor(randomNumbers.getRandom() * constructors.length);
  return constructors[index];
};

export const getRandomRoomConstructor = (): RoomConstructor => {
  const beforeConstructor = getRandomConstructor(beforeConstructors);
  let afterConstructor = getRandomConstructor(afterConstructors);
  const testRoomPorps = { width: 10, height: 10 };
  for (let i = 10; i--;) {
    const isConflictedPair = checkConfilt(beforeConstructor, afterConstructor, testRoomPorps);
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
  constructorA: Constructor,
  constructorB: Constructor,
  testRoomPorps: RoomProps
) => {
  const cellsA = constructorA(testRoomPorps);
  const cellsB = constructorB(testRoomPorps);
  const conflict = cellsA.some(cellA =>
    cellsB.some(cellB => {
      const isSameX = cellA.position.x === cellB.position.x;
      const isSameY = cellA.position.y === cellB.position.y;
      return isSameX && isSameY;
    })
  );
  return conflict;
};

