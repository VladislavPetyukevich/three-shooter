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
  }
];

