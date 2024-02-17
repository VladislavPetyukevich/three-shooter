import { Sprite, CanvasTexture, SpriteMaterial } from 'three';

interface HUDScoreProps {
  size: ImageSize;
  prefix: string;
  textAlign?: HUDScore['textAlign'];
}

interface ImageSize {
  width: number;
  height: number;
}

export class HUDScore {
  fontSize: number;
  prefix: string;
  textAlign: CanvasRenderingContext2D['textAlign'];
  sprite: Sprite;
  texture: CanvasTexture;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  textX: number;

  constructor(props: HUDScoreProps) {
    this.fontSize = 34;
    this.prefix = props.prefix;
    this.textAlign = props.textAlign || 'left';
    this.canvas = this.initCanvas(props.size);
    this.context = this.initContext();
    this.texture = new CanvasTexture(this.canvas);
    const material = new SpriteMaterial({ map: this.texture });
    this.sprite = new Sprite(material);
    this.textX = this.getTextX();
  }

  drawScore(score: number) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillText(`${this.prefix}: ${score}`, this.textX, this.fontSize);
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
    context.font = `${this.fontSize}px sans-serif`;
    context.fillStyle = 'white';
    context.textAlign = this.textAlign;
    return context;
  }

  getTextX() {
    if (this.textAlign === 'center') {
      return Math.round(this.canvas.width / 2);
    }
    return 0;
  }
}
