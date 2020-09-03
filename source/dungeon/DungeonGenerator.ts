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
