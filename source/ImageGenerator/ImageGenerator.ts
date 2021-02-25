export interface ImagePixel {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation?: number;
  content?: string;
}

export interface ImageSize {
  width: number;
  height: number;
}

export class ImageGenerator {
  size: ImageSize;
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;

  constructor(size: ImageSize) {
    this.size = size;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', `${this.size.width}`);
    canvas.setAttribute('height', `${this.size.height}`);
    this.canvas = canvas;
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('SpriteGenerator: Canvas context not found');
    }
    this.canvasContext = context;
  }

  clear() {
    this.canvasContext.clearRect(0, 0, this.size.width, this.size.height);
  }

  drawArrow(pixel: ImagePixel) {
    if (typeof pixel.rotation !== 'number') {
      throw new Error('ImageGenerator drawArrow: pixel rotation undefined');
    }
    this.canvasContext.strokeStyle = pixel.color;
    this.canvasContext.translate(this.size.width / 2, this.size.height / 2);
    this.canvasContext.rotate(-pixel.rotation);
    this.canvasContext.translate(-this.size.width / 2, -this.size.height / 2);

    this.canvasContext.beginPath();
    this.canvasContext.moveTo(pixel.x + pixel.width, pixel.y + pixel.height);
    this.canvasContext.lineTo(pixel.x + pixel.width / 2, pixel.y);
    this.canvasContext.lineTo(pixel.x, pixel.y + pixel.width);
    this.canvasContext.stroke();

    this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
  }

  drawRect(pixel: ImagePixel) {
    this.canvasContext.fillStyle = pixel.color;
    this.canvasContext.fillRect(pixel.x, pixel.y, pixel.width, pixel.height);
  }

  drawText(imagePixel: ImagePixel) {
    if (!imagePixel.content) {
      throw new Error('No content for text');
    }
    this.canvasContext.fillStyle = imagePixel.color;
    this.canvasContext.font = `${imagePixel.width}px Arial`;
    this.canvasContext.fillText(
      imagePixel.content,
      imagePixel.x,
      imagePixel.y
    );
  }

  toRads(angle: number) {
    return angle * Math.PI / 180;
  }

  drawCircle(imagePixel: ImagePixel, isFilled: boolean) {
    const size = imagePixel.height;
    const angle = 180 * (imagePixel.width / 100);
    const shiftAngle = 90;
    const startAngle = this.toRads(-angle + shiftAngle);
    const endAngle = this.toRads(angle + shiftAngle);
    this.canvasContext.beginPath();
    this.canvasContext.arc(
      imagePixel.x,
      imagePixel.y,
      size,
      startAngle,
      endAngle,
      false
    );
    if (isFilled) {
      this.canvasContext.fillStyle = imagePixel.color;
      this.canvasContext.fill();
    } else {
      this.canvasContext.lineWidth = 4;
      this.canvasContext.strokeStyle = imagePixel.color;
      this.canvasContext.stroke();
    }
  }
}
