import { ImageGenerator } from './ImageGenerator';

export class ImageUrlGenerator {
  imageGenerator: ImageGenerator;

  constructor(imageGenerator: ImageGenerator) {
    this.imageGenerator = imageGenerator;
  }

  getImageUrl() {
    const canvas = this.imageGenerator.canvas;
    if (!canvas) {
      throw new Error('ImageUrlGenerator: imageGenerator canvas not defined');
    }
    return canvas.toDataURL();
  }
}
