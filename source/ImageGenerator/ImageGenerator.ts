export interface ImagePixel {
  x: number;
  y: number;
  color: string;
  size: number;
}

export interface ImageSize {
  width: number;
  height: number;
}

export class ImageGenerator {
  pixels: ImagePixel[];
  size: ImageSize;
  canvas?: HTMLCanvasElement;

  constructor(pixels: ImagePixel[], size: ImageSize) {
    this.pixels = pixels;
    this.size = size;
    this.initCanvas();
    this.drawOnCanvas();
  }

  initCanvas() {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', `${this.size.width}`);
    canvas.setAttribute('height', `${this.size.height}`);
    this.canvas = canvas;
  }

  drawOnCanvas() {
    if (!this.canvas) {
      throw new Error('SpriteGenerator: Canvas not initialized');
    }
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('SpriteGenerator: Canvas context not found');
    }
    context.fillStyle = 'black';
    context.fillRect(0, 0, this.size.width, this.size.height);
    this.pixels.forEach(pixel => {
      context.fillStyle = pixel.color;
      context.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
    });
  }
}
