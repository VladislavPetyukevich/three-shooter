interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

const enum Direction {
  Up, Right, Down, Left
}

interface Rect {
  position: Position;
  size: Size;
}

export const enum DungeonCellType {
  Empty,
  Wall
};

export class DungeonGenerator {
  size: Size;
  dungeonArr: DungeonCellType[][];

  constructor(dungeonSize: Size) {
    this.size = dungeonSize;
    this.dungeonArr = [];
    this.initDungeon();
  }

  initDungeon() {
    for (let y = 0; y < this.size.height; y++) {
      this.dungeonArr[y] = [];
      for (let x = 0; x < this.size.width; x++) {
        this.dungeonArr[y][x] = DungeonCellType.Wall;
      }
    }
  }

  dungeon() {
    return this.dungeonArr;
  }

  fillRect(rect: Rect, element: DungeonCellType) {
    for (let y = rect.position.y; y < rect.position.y + rect.size.height; y++) {
      for (let x = rect.position.x; x < rect.position.x + rect.size.width; x++) {
        this.dungeonArr[y][x] = element;
      }
    }
  }

  ifCanFillRect(rect: Rect, element: DungeonCellType) {
    if (
      rect.position.x < 0 ||
      rect.position.y < 0 ||
      rect.position.x + rect.size.width > this.size.width ||
      rect.position.y + rect.size.height > this.size.height
    ) {
      return false;
    }

    for (let y = rect.position.y; y < rect.position.y + rect.size.height; y++) {
      for (let x = rect.position.x; x < rect.position.x + rect.size.width; x++) {
        if (this.dungeonArr[y][x] === element) {
          return false;
        }
      }
    }
    return true;
  }

  addRoom(roomRect: Rect) {
    const elementToFill = DungeonCellType.Empty;

    if (!this.ifCanFillRect(roomRect, elementToFill)) {
      return;
    }

    this.fillRect(
      roomRect,
      DungeonCellType.Empty
    );
  }

  connectRooms(roomRect1: Rect, roomRect2: Rect) {
    const direction = this.getConnectRoomDirection(roomRect1, roomRect2);
    const size = this.getConnectRoomSize(roomRect1, roomRect2, direction);
    console.log('size: ', size);
    const connectRoomRect = this.getConnectRoomRect(roomRect2, direction, size);
    if (connectRoomRect) {
      this.addRoom(connectRoomRect);
    }
  }

  getConnectRoomDirection(roomRect1: Rect, roomRect2: Rect) {
    const diffX = roomRect1.position.x - roomRect2.position.x;
    if (Math.abs(diffX) > roomRect2.size.width) {
      return diffX > 0 ? Direction.Right : Direction.Left;
    }
    const diffY = roomRect1.position.y - roomRect2.position.y;
    if (Math.abs(diffY) > roomRect2.size.height) {
      return diffY > 0 ? Direction.Down : Direction.Up;
    }

    throw new Error(`Cannot get connect room direction. diffX: ${diffX}; diffY: ${diffY};`);
  }

  getConnectRoomSize(roomRect1: Rect, roomRect2: Rect, direction: Direction) {
    const width = Math.abs(roomRect1.position.x - roomRect2.position.x);
    const height = Math.abs(roomRect1.position.y - roomRect2.position.y);
    console.log(roomRect1.size);
    switch (direction) {
      case Direction.Up:
      case Direction.Down:
        return { width: 2, height: height - 4};
      case Direction.Left:
      case Direction.Right:
        return { width: Math.trunc(width / 2), height: 2 };
      default:
        throw new Error('Unsuported connect room direction');
    }
  }

  getConnectRoomRect(roomRect: Rect, direction: Direction, connectRoomSize: Size): Rect | undefined {
    switch (direction) {
      case Direction.Up:
        return {
          position: {
            x: roomRect.position.x + Math.round(roomRect.size.width / 2 - connectRoomSize.width / 2),
            y: roomRect.position.y - connectRoomSize.height
          },
          size: {
            width: connectRoomSize.width,
            height: connectRoomSize.height
          }
        };
      case Direction.Down:
        return {
          position: {
            x: roomRect.position.x + Math.round(roomRect.size.width / 2 - connectRoomSize.width / 2),
            y: roomRect.position.y + roomRect.size.height
          },
          size: {
            width: connectRoomSize.width,
            height: connectRoomSize.height
          }
        };
      case Direction.Right:
        return {
          position: {
            x: roomRect.position.x + roomRect.size.width,
            y: roomRect.position.y + Math.round(roomRect.size.height / 2 - connectRoomSize.width / 2)
          },
          size: {
            width: connectRoomSize.height,
            height: connectRoomSize.width
          }
        };
      case Direction.Left:
        return {
          position: {
            x: roomRect.position.x - connectRoomSize.height,
            y: roomRect.position.y + Math.round(roomRect.size.height / 2 - connectRoomSize.width / 2)
          },
          size: {
            width: connectRoomSize.height,
            height: connectRoomSize.width
          }
        };
      default:
        break;
    }
  }

  generate(roomRect: Rect) {
    this.addRoom(roomRect);

    for (let direction = 0; direction < 4; direction++) {
      const connectRoomRect = this.getConnectRoomRect(roomRect, direction, { width: 2, height: 4 });
      if (connectRoomRect) {
        this.addRoom(connectRoomRect);
      }
    }

  }
}
