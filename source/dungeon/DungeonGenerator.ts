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
  Wall,
  Door
};

export type GeneratorCell = null | Rect;

interface DungeonPart {
  type: DungeonCellType;
  fillRect: Rect;
}

interface DungeonGeneratorProps {
  dungeonSize: Size;
  roomSize: Size;
}

export class DungeonGenerator {
  size: Size;
  roomSize: Size;
  dungeonArr: DungeonPart[];
  dungeonCells: GeneratorCell[][];

  constructor(props: DungeonGeneratorProps) {
    this.size = props.dungeonSize;
    this.roomSize = props.roomSize;
    this.dungeonArr = [];
    this.dungeonCells = [];
  }

  dungeon() {
    return this.dungeonArr;
  }

  cells() {
    return this.dungeonCells;
  }

  getSplitedRect(rect: Rect, splitRect: Rect) {
    const isHorizontalSplit = rect.size.width > rect.size.height;
    if (isHorizontalSplit) {
      const splitedWidth = splitRect.position.x - rect.position.x;
      const rect1: Rect = {
        position: {
          x: rect.position.x,
          y: rect.position.y
        },
        size: {
          width: splitedWidth,
          height: rect.size.height
        }
      };
      const rect2: Rect = {
        position: {
          x: rect.position.x + splitedWidth + splitRect.size.width,
          y: rect.position.y
        },
        size: {
          width: splitedWidth,
          height: rect.size.height
        }
      };
      return [rect1, rect2];
    } else {
      const splitedHeight = splitRect.position.y - rect.position.y;
      const rect1: Rect = {
        position: {
          x: rect.position.x,
          y: rect.position.y
        },
        size: {
          width: rect.size.width,
          height: splitedHeight
        }
      };
      const rect2: Rect = {
        position: {
          x: rect.position.x,
          y: rect.position.y + splitedHeight + splitRect.size.height
        },
        size: {
          width: rect.size.width,
          height: splitedHeight
        }
      };
      return [rect1, rect2];
    }
  }

  findCollideRectIndices(rect1: Rect) {
    const indices: number[] = [];
    this.dungeonArr.forEach((el, index) => {
      const rect1Pos = rect1.position;
      const rect2Pos = el.fillRect.position;
      const rect1Size = rect1.size;
      const rect2Size = el.fillRect.size;
      if (
        (rect1Pos.x < rect2Pos.x + rect2Size.width) &&
        (rect1Pos.x + rect1Size.width > rect2Pos.x) &&
        (rect1Pos.y < rect2Pos.y + rect2Size.height) &&
        (rect1Pos.y + rect1Size.height > rect2Pos.y)
      ) {
        indices.push(index);
      }
    });
    return indices;
  }

  fillRect(rect: Rect, element: DungeonCellType) {
    const collideIndices = this.findCollideRectIndices(rect);
    collideIndices.forEach(index => {
      const currRect = this.dungeonArr[index];
      const splitedRects = this.getSplitedRect(currRect.fillRect, rect);
      splitedRects.forEach(splitedRect => {
        this.dungeonArr.push({
          type: currRect.type,
          fillRect: splitedRect
        });
      });
    });
    for (let i = collideIndices.length; i--;) {
      this.dungeonArr.splice(collideIndices[i], 1);
    }
    this.dungeonArr.push({
      type: element,
      fillRect: rect
    });
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

  addRoomNew(roomRect: Rect) {
    if (this.isOutOfBounds(roomRect)) {
      return;
    }
    this.fillRect(
      {
        position: { x: roomRect.position.x, y: roomRect.position.y },
        size: { width: roomRect.size.width, height: 1 }
      },
      DungeonCellType.Wall
    );
    this.fillRect(
      {
        position: { x: roomRect.position.x, y: roomRect.position.y + roomRect.size.height - 1 },
        size: { width: roomRect.size.width, height: 1 }
      },
      DungeonCellType.Wall
    );
    this.fillRect(
      {
        position: { x: roomRect.position.x, y: roomRect.position.y + 1 },
        size: { width: 1, height: roomRect.size.height - 2 }
      },
      DungeonCellType.Wall
    );
    this.fillRect(
      {
        position: { x: roomRect.position.x + roomRect.size.width - 1, y: roomRect.position.y + 1 },
        size: { width: 1, height: roomRect.size.height - 2 }
      },
      DungeonCellType.Wall
    );
  }

  getConnectRoomsRect(roomRect1: Rect, roomRect2: Rect) {
    const direction = this.getConnectRoomDirection(roomRect1, roomRect2);
    const size = this.getConnectRoomSize(roomRect1, roomRect2, direction);
    const connectRoomRect = this.getConnectRoomRect(roomRect2, direction, size);
    return connectRoomRect;
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
    const diffX = Math.abs(roomRect1.position.x - roomRect2.position.x);
    const diffY = Math.abs(roomRect1.position.y - roomRect2.position.y);
    switch (direction) {
      case Direction.Up:
      case Direction.Down:
        return { width: 4, height: Math.trunc(diffY / 10) };
      case Direction.Left:
      case Direction.Right:
        return { width: 4, height: Math.trunc(diffX / 10) };
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
            y: roomRect.position.y - connectRoomSize.height + 1
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
            y: roomRect.position.y + roomRect.size.height - 1
          },
          size: {
            width: connectRoomSize.width,
            height: connectRoomSize.height
          }
        };
      case Direction.Right:
        return {
          position: {
            x: roomRect.position.x + roomRect.size.width - 1,
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
            x: roomRect.position.x - connectRoomSize.height + 1,
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
      size: this.roomSize,
      position: { x: x * this.roomSize.width, y: y * this.roomSize.height }
    };
    this.addRoomNew({
      size: this.roomSize,
      position: { x: x * this.roomSize.width, y: y * this.roomSize.height }
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
        size: this.roomSize,
        position: { x: x * this.roomSize.width, y: y * this.roomSize.height }
      };
      cells[y][x] = roomRect;
      const prevRoom = cells[prevY][prevX];
      if (prevRoom) {
        const connectRoomRect = this.getConnectRoomsRect(prevRoom, roomRect);
        if (connectRoomRect) {
          this.addRoomNew(roomRect);
          this.fillRect(connectRoomRect, DungeonCellType.Door);
        }
      }
      roomsRemaining--;
    }
    this.dungeonCells = cells;
  }
}
