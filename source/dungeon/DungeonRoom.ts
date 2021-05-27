import { randomNumbers } from '@/RandomNumbers';

export const enum RoomCellType {
  Empty,
  Enemy
}

interface RoomProps {
  width: number,
  height: number
}

interface RoomCell {
  position: { x: number, y: number },
  type: RoomCellType
}

export type RoomConstructor = (props: RoomProps) => RoomCell[];

export const rooms: RoomConstructor[] = [
  (props: RoomProps) => {
    return [
      { position: { x: 2, y: 2 }, type: RoomCellType.Enemy },
      { position: { x: 2, y: props.height - 3 }, type: RoomCellType.Enemy },
      { position: { x: props.width - 3, y: props.height - 3 }, type: RoomCellType.Enemy },
      { position: { x: props.width - 3, y: 2 }, type: RoomCellType.Enemy },
    ];
  },
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
];

export const getRandomRoomIndex = () => {
  return Math.floor(randomNumbers.getRandom() * rooms.length);
};

