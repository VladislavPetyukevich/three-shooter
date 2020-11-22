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

type GeneratorCell = null | Rect;

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
        this.dungeonArr[y][x] = DungeonCellType.Empty;
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

  isOutOfBounds(rect: Rect) {
    if (
      rect.position.x < 0 ||
      rect.position.y < 0 ||
      rect.position.x + rect.size.width > this.size.width ||
      rect.position.y + rect.size.height > this.size.height
    ) {
      return true;
    }

    return false;
  }

  addRoom(roomRect: Rect) {
    if (this.isOutOfBounds(roomRect)) {
      return;
    }

    this.fillRect(
      roomRect,
      DungeonCellType.Wall
    );

    const innerFillRect: Rect = {
      position: { x: roomRect.position.x + 1, y: roomRect.position.y + 1 },
      size: { width: roomRect.size.width - 2, height: roomRect.size.height - 2 }
    };
    this.fillRect(
      innerFillRect,
      DungeonCellType.Empty
    );
  }

  connectRooms(roomRect1: Rect, roomRect2: Rect) {
    const direction = this.getConnectRoomDirection(roomRect1, roomRect2);
    const size = this.getConnectRoomSize(roomRect1, roomRect2, direction);
    const connectRoomRect = this.getConnectRoomRect(roomRect2, direction, size);
    if (connectRoomRect) {
      this.fillRect(connectRoomRect, DungeonCellType.Empty);
    }
  }

  getConnectRoomDirection(roomRect1: Rect, roomRect2: Rect) {
    const diffX = roomRect1.position.x - roomRect2.position.x;
    if (Math.abs(diffX) >= roomRect2.size.width) {
      return diffX >= 0 ? Direction.Right : Direction.Left;
    }
    const diffY = roomRect1.position.y - roomRect2.position.y;
    if (Math.abs(diffY) >= roomRect2.size.height) {
      return diffY >= 0 ? Direction.Down : Direction.Up;
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

  generate() {
    const width = 10;
    const height = 10;
    const roomSize = { width: 10, height: 10 };
    const cells: GeneratorCell[][] = [];
    for (let i = 0; i < height; i++) {
      cells[i] = [];
      for (let j = 0; j < width; j++) {
        cells[i][j] = null;
      }
    }

    const xStart = 4;
    const yStart = 4;
    let x = xStart;
    let y = yStart;
    let roomsRemaining = 10;
    cells[y][x] = {
      size: roomSize,
      position: { x: x * 10, y: y * 10 }
    };
    this.addRoom({
      size: roomSize,
      position: { x: x * 10, y: y * 10 }
    });

    while (roomsRemaining > 0) {
      const prevX = x;
      const prevY = y;
      if (Math.random() > 0.5) {
        x = Math.random() > 0.5 ? x - 1 : x + 1;
      } else {
        y = Math.random() > 0.5 ? y - 1 : y + 1;
      }
      const isXOutOfBounds = x > width - 2 || x < 1;
      const isYOutOfBounds = y > height - 2 || y < 1;
      if (isXOutOfBounds || isYOutOfBounds) {
        x = xStart;
        y = yStart;
        continue;
      }
      if (cells[y][x]) {
        continue;
      }
      const roomRect = {
        size: roomSize,
        position: { x: x * 10, y: y * 10 }
      };
      cells[y][x] = roomRect;
      this.addRoom(roomRect);
      const prevRoom = cells[prevY][prevX];
      if (prevRoom) {
        this.connectRooms(roomRect, prevRoom);
        this.connectRooms(prevRoom, roomRect);
      }
      roomsRemaining--;
    }
    console.log('cells: ', cells);
  }
}
