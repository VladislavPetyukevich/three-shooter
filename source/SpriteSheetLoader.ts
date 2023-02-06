interface ImageInfo {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ImagesInfo = Record<string, ImageInfo>;

interface ImagesMap {
  [name: string]: string;
}

export class SpriteSheetLoader {
  scaleFactor: number;
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  canvasScaled: HTMLCanvasElement;
  canvasContextScaled: CanvasRenderingContext2D;
  sheetImageUrl: string;
  sheetImage: HTMLImageElement;

  constructor(sheetImageUrl:string, scaleFactor: number) {
    this.sheetImageUrl = sheetImageUrl;
    this.sheetImage = new Image();
    this.scaleFactor = scaleFactor;
    this.canvas = document.createElement('canvas');
    this.canvasScaled = document.createElement('canvas');
    const context = this.canvas.getContext(
      '2d',
      { willReadFrequently: true }
    );
    const contextScaled = this.canvasScaled.getContext('2d');
    if (!context || !contextScaled) {
      throw new Error('Canvas context are not found.');
    }
    this.canvasContext = context;
    this.canvasContextScaled = contextScaled;
  }

  loadImages(
    imagesInfo: ImagesInfo,
    onLoad: (imagesInfo: ImagesMap) => void,
    onProgress?: (progress: number) => void
  ) {
    const totalImagesCount = Object.keys(imagesInfo).length;
    const imagesMap: ImagesMap = {};
    const onDataUrlLoad = (imageName: string) => (dataUrl: string) => {
      imagesMap[imageName] = dataUrl;
      const loadedImagesCount = Object.keys(imagesMap).length;
      if (onProgress) {
        onProgress(loadedImagesCount / totalImagesCount * 100);
      }
      if (loadedImagesCount === totalImagesCount) {
        onLoad(imagesMap);
      }
    };
    this.sheetImage.onload = () => {
      const imagesEntries = Object.entries(imagesInfo);
      imagesEntries.forEach(
        ([name, info]) => {
          this.loadImage(info, onDataUrlLoad(name));
        }
      );
    };
    this.sheetImage.src = this.sheetImageUrl;
  }

  loadImage(info: ImageInfo, onLoad: (dataUrl: string) => void) {
    this.canvas.width = info.width;
    this.canvas.height = info.height;
    this.canvasContext.clearRect(0, 0, info.width, info.height);
    this.canvasContext.drawImage(
      this.sheetImage,
      info.x, info.y, info.width, info.height,
      0, 0, info.width, info.height
    );
    const imageData = this.canvasContext.getImageData(0, 0, info.width, info.height);
    const width = info.width * this.scaleFactor;
    const height = info.height * this.scaleFactor;
    this.canvasScaled.width = width;
    this.canvasScaled.height = height;
    this.canvasContextScaled.clearRect(0, 0, width, height);
    for (let currX = 0; currX < info.width; currX++) {
      for (let currY = 0; currY < info.height; currY++) {
        const pixelIndex = (Math.floor(currY) * info.width + Math.floor(currX)) * 4;
        const r = imageData.data[pixelIndex];
        const g = imageData.data[pixelIndex + 1];
        const b = imageData.data[pixelIndex + 2];
        const a = imageData.data[pixelIndex + 3];
        this.canvasContextScaled.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        this.canvasContextScaled.fillRect(
          currX * this.scaleFactor,
          currY * this.scaleFactor,
          this.scaleFactor,
          this.scaleFactor
        );
      }
    }
    const dataUrl = this.canvasScaled.toDataURL();
    onLoad(dataUrl);
  }
}
