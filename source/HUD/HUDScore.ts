import { COLORS } from '@/constants';
import { Sprite, CanvasTexture, SpriteMaterial } from 'three';

interface ImageSize {
  width: number;
  height: number;
}

export class HUDScore {
  sprite: Sprite;
  texture: CanvasTexture;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(size: ImageSize) {
    this.canvas = this.initCanvas(size);
    this.context = this.initContext();
    this.texture = new CanvasTexture(this.canvas);
    const material = new SpriteMaterial({ map: this.texture });
    this.sprite = new Sprite(material);
  }

  drawScore(score: number) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillText(`💀: ${score}`, 0, 24);
    this.sprite.material.map && (this.sprite.material.map.needsUpdate = true);
  }

  initCanvas(size: ImageSize) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', `${size.width}`);
    canvas.setAttribute('height', `${size.height}`);
    return canvas;
  }

  initContext() {
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('HUDScore: Canvas context not found');
    }
    context.font = '24px sans-serif';
    context.fillStyle = 'white';
    return context;
  }
}
