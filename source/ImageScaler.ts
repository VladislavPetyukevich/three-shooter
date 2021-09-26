interface ImagesInfo {
  [name: string]: string;
}

export class ImageScaler {
  scaleFactor: number;
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  canvasScaled: HTMLCanvasElement;
  canvasContextScaled: CanvasRenderingContext2D;
  ignoreNames: string[];

  constructor(scaleFactor: number) {
    this.scaleFactor = scaleFactor;
    this.canvas = document.createElement('canvas');
    this.canvasScaled = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    const contextScaled = this.canvasScaled.getContext('2d');
    if (!context || !contextScaled) {
      throw new Error('Canvas context are not found.');
    }
    this.canvasContext = context;
    this.canvasContextScaled = contextScaled;
    this.ignoreNames = [];
  }

  addToIgnore(name: string) {
    this.ignoreNames.push(name);
  }

  scaleImages(
    imagesInfo: ImagesInfo,
    onLoad: (imagesInfo: ImagesInfo) => void,
    onProgress?: (progress: number) => void
  ) {
    const totalImagesCount = Object.keys(imagesInfo).length;
    const imagesMap: ImagesInfo = {};
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
    const imagesEntries = Object.entries(imagesInfo);
    imagesEntries.forEach(
      ([name, path]) => {
        if (this.ignoreNames.includes(name)) {
          onDataUrlLoad(name)(path);
        } else {
          this.scaleImage(path, onDataUrlLoad(name));
        }
      }
    );
  }

  scaleImage(url: string, onLoad: (dataUrl: string) => void) {
    const image = new Image();
    image.onload = () => {
      this.canvas.width = image.width;
      this.canvas.height = image.height;
      this.canvasContext.clearRect(0, 0, image.width, image.height);
      this.canvasContext.drawImage(image, 0, 0);
      const imageData = this.canvasContext.getImageData(0, 0, image.width, image.height);
      const width = image.width * this.scaleFactor;
      const height = image.height * this.scaleFactor;
      this.canvasScaled.width = width;
      this.canvasScaled.height = height;
      this.canvasContextScaled.clearRect(0, 0, width, height);
      for (let currX = 0; currX < image.width; currX++) {
        for (let currY = 0; currY < image.height; currY++) {
          const pixelIndex = (Math.floor(currY) * image.width + Math.floor(currX)) * 4;
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
    };
    image.src = url;
  }
}

