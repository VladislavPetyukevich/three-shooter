import { Sprite, Texture, Vector3, Euler } from 'three';
import { ImagePixel, ImageGenerator } from '@/ImageGenerator/ImageGenerator';
import { ImageUrlGenerator } from '@/ImageGenerator/ImageUrlGenerator';
import { threeTextureLoader } from '@/core/loaders/TextureLoader';
import { GeneratorCell } from '@/dungeon/DungeonGenerator';

interface HUDMapCollors {
  room: string;
  roomCurrent: string;
  roomFree: string;
}

interface HUDMapSettings {
  mapSize: number;
  wallPixelSize: number;
  renderDistance: number;
  colors: HUDMapCollors;
}

export class HUDMap {
  settings: HUDMapSettings;
  sprite: Sprite;
  playerMeshPosition: Vector3;
  playerRotationY: number;
  imageGenerator: ImageGenerator;
  dungeonCells: GeneratorCell[][];
  visitedRooms: Set<number>;
  currentRoom: number;
  currentRoomCellPadding: number;
  isDungeonCellsNeedsUpdate: boolean;

  constructor(settings: HUDMapSettings) {
    this.settings = settings;
    this.sprite = new Sprite();
    this.playerMeshPosition = new Vector3();
    this.playerRotationY = 0;
    this.imageGenerator = new ImageGenerator({ width: this.settings.mapSize, height: this.settings.mapSize });
    this.dungeonCells = [];
    this.visitedRooms = new Set();
    this.currentRoom = -1;
    this.isDungeonCellsNeedsUpdate = false;
    this.currentRoomCellPadding = 6;
  }


  updateDungeon(cells: GeneratorCell[][]) {
    console.log('cells:', cells);
    this.dungeonCells = cells;
    this.isDungeonCellsNeedsUpdate = true;
  }

  drawDungeon() {
    this.isDungeonCellsNeedsUpdate = false;
    console.log('drawDungeon');
    this.imageGenerator.drawRect({
      x: 0,
      y: 0,
      width: this.imageGenerator.size.width,
      height: this.imageGenerator.size.height,
      color: 'black'
    });
    const cells = this.dungeonCells;
    let cellIndex = -1;
    for (let currY = 0; currY < cells.length; currY++) {
      for (let currX = 0; currX < cells[currY].length; currX++) {
        const cell = cells[currY][currX];
        if (!cell) {
          continue;
        }
        cellIndex++;
        const cellColor = this.visitedRooms.has(cellIndex) ?
          this.settings.colors.roomFree :
          this.settings.colors.room;
        this.imageGenerator.drawRect({
          x: cell.position.x,
          y: cell.position.y,
          width: cell.size.width,
          height: cell.size.height,
          color: cellColor
        });
        const isCurrentRoom = cellIndex === this.currentRoom;
        if (isCurrentRoom) {
          this.imageGenerator.drawRect({
            x: cell.position.x + this.currentRoomCellPadding,
            y: cell.position.y + this.currentRoomCellPadding,
            width: cell.size.width - this.currentRoomCellPadding * 2,
            height: cell.size.height - this.currentRoomCellPadding * 2,
            color: this.settings.colors.roomCurrent
          });
        }
      }
    }

    const imageUrlGenerator = new ImageUrlGenerator(this.imageGenerator);
    const wallsMapImageUrl = imageUrlGenerator.getImageUrl();
    this.drawSprite(wallsMapImageUrl);
  }

  drawPlayer(pixelData: ImagePixel) {
    const playerPixel: ImagePixel = {
      x: pixelData.x,
      y: pixelData.y,
      color: pixelData.color,
      width: pixelData.width,
      height: pixelData.height,
      rotation: this.playerRotationY
    };
    this.imageGenerator.drawArrow(playerPixel);
    // const imageUrlGenerator = new ImageUrlGenerator(this.imageGenerator);
    // const wallsMapImageUrl = imageUrlGenerator.getImageUrl();
    // this.drawSprite(wallsMapImageUrl);
  }

  drawSprite(imageUrl: string) {
    threeTextureLoader.load(imageUrl, (texture: Texture) => {
      this.sprite.material.map = texture;
      this.sprite.material.needsUpdate = true;
    });
  }

  updatePlayerPosition(meshPosition: Vector3) {
    this.playerMeshPosition = meshPosition;
  }

  updatePlayerRotation(cameraRotation: Euler) {
    this.playerRotationY = cameraRotation.y;
  }

  updatePlayerRoom(roomIndex: number) {
    this.currentRoom = roomIndex;
    this.isDungeonCellsNeedsUpdate = true;
  }

  addFreeRoom(roomIndex: number) {
    this.visitedRooms.add(roomIndex);
    this.isDungeonCellsNeedsUpdate = true;
  }

  update() {
    // this.drawDungeon();
    if (this.isDungeonCellsNeedsUpdate) {
      this.drawDungeon();
    }
  }
}
