import { Sprite, CanvasTexture } from 'three';
import { ImageGenerator } from '@/ImageGenerator/ImageGenerator';

interface HUDStatsSettings {
  size: number;
  color: string;
  fontSize: number;
}

export class HUDStats {
  totalRoomsCount: number;
  clearRoomsCount: number;
  isStatsNeedsUpdate: boolean;
  imageGenerator: ImageGenerator;
  sprite: Sprite;
  settings: HUDStatsSettings;

  constructor(settings: HUDStatsSettings) {
    this.settings = settings;
    this.totalRoomsCount = 101;
    this.clearRoomsCount = 0;
    this.isStatsNeedsUpdate = true;
    this.sprite = new Sprite();
    this.imageGenerator = new ImageGenerator({
      width: this.settings.size,
      height: this.settings.size
    });
  }

  init(totalRoomsCount: number) {
    this.totalRoomsCount = totalRoomsCount;
    this.clearRoomsCount = 0;
    this.isStatsNeedsUpdate = true;
  }

  addFreeRoom() {
    this.clearRoomsCount++;
    this.isStatsNeedsUpdate = true;
  }

  drawStats() {
    this.isStatsNeedsUpdate = false;
    this.imageGenerator.clear();
    const progress = this.clearRoomsCount / this.totalRoomsCount * 100;
    this.imageGenerator.drawCircle({
      x: 200,
      y: 200,
      width: ~~progress,
      height: 200,
      color: this.settings.color
    }, true);
    this.imageGenerator.drawCircle({
      x: 200,
      y: 200,
      width: 100,
      height: 200,
      color: this.settings.color
    }, false);

    this.drawSprite(this.imageGenerator.canvas);
  }

  drawSprite(canvas: HTMLCanvasElement) {
    this.sprite.material.map = new CanvasTexture(canvas);
  }

  update() {
    if (this.isStatsNeedsUpdate) {
      this.drawStats();
    }
  }
}

