import { Sprite, Texture, Vector3, Euler } from 'three';
import { ImagePixel, ImageGenerator } from '@/ImageGenerator/ImageGenerator';
import { ImageUrlGenerator } from '@/ImageGenerator/ImageUrlGenerator';
import { threeTextureLoader } from '@/core/loaders/TextureLoader';
import { GeneratorCell } from '@/dungeon/DungeonGenerator';

interface HUDMapCollors {
  wall: string;
  player: string;
  background: string;
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
  isDungeonCellsNeedsUpdate: boolean;

  constructor(settings: HUDMapSettings) {
    this.settings = settings;
    this.sprite = new Sprite();
    this.playerMeshPosition = new Vector3();
    this.playerRotationY = 0;
    this.imageGenerator = new ImageGenerator({ width: this.settings.mapSize, height: this.settings.mapSize });
    this.dungeonCells = [];
    this.isDungeonCellsNeedsUpdate = false;
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
    for (let currY = 0; currY < cells.length; currY++) {
      for (let currX = 0; currX < cells[currY].length; currX++) {
        const cell = cells[currY][currX];
        if (!cell) {
          continue;
        }
        console.log('cell:', cell);
        this.imageGenerator.drawRect({
          x: cell.position.x,
          y: cell.position.y,
          width: cell.size.width,
          height: cell.size.height,
          color: 'red'
        });
      }
    }

    const imageUrlGenerator = new ImageUrlGenerator(this.imageGenerator);
    const wallsMapImageUrl = imageUrlGenerator.getImageUrl();
    this.drawSprite(wallsMapImageUrl);
  }

  drawPlayer() {
    const playerPixelSize = this.settings.wallPixelSize * 2;
    const playerPixel: ImagePixel = {
      x: this.settings.renderDistance - playerPixelSize / 2,
      y: this.settings.renderDistance - playerPixelSize / 2,
      color: this.settings.colors.player,
      width: playerPixelSize,
      height: playerPixelSize,
      rotation: this.playerRotationY
    };
    this.imageGenerator.clear();
    this.imageGenerator.drawArrow(playerPixel);
    const imageUrlGenerator = new ImageUrlGenerator(this.imageGenerator);
    const wallsMapImageUrl = imageUrlGenerator.getImageUrl();
    this.drawSprite(wallsMapImageUrl);
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

  update() {
    // this.drawDungeon();
    if (this.isDungeonCellsNeedsUpdate) {
      this.drawDungeon();
    }
  }
}
