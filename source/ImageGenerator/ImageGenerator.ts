export interface ImagePixel {
  x: number;
  y: number;
  color: string;
  size: number;
  rotation?: number
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
      if (typeof pixel.rotation === 'number') {
        this.drawArrow(context, pixel);
      } else {
        this.drawRect(context, pixel);
      }
    });
  }

  drawArrow(context: CanvasRenderingContext2D, pixel: ImagePixel) {
    if (typeof pixel.rotation !== 'number') {
      throw new Error('ImageGenerator drawArrow: pixel rotation undefined');
    }
    context.strokeStyle = pixel.color;
    context.translate(this.size.width / 2, this.size.height / 2);
    context.rotate(-pixel.rotation);
    context.translate(-this.size.width / 2, -this.size.height / 2);

    context.beginPath();
    context.moveTo(pixel.x + pixel.size, pixel.y + pixel.size);
    context.lineTo(pixel.x + pixel.size / 2, pixel.y);
    context.lineTo(pixel.x, pixel.y + pixel.size);
    context.stroke();
  }

  drawRect(context: CanvasRenderingContext2D, pixel: ImagePixel) {
    context.fillStyle = pixel.color;
    context.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
  }
}
