import { Scene, Texture, OrthographicCamera, SpriteMaterial, Sprite } from 'three';

let currentId = 0;

export class ImageDisplayer {
  scene: Scene;
  width: number;
  height: number;
  camera: OrthographicCamera;

  constructor() {
    this.scene = new Scene();
    this.width = window.innerWidth / 2;
    this.height = window.innerHeight / 2;
    this.camera = new OrthographicCamera(-this.width, this.width, this.height, -this.height, - 500, 1000);
  }

  add(texture: Texture, width = 2, height = 2) {
    const material = new SpriteMaterial({ map: texture });
    let sprite = new Sprite(material);
    sprite.scale.set(this.width * width, this.height * height, 0.0001);
    sprite.name = `${++currentId}`;
    this.scene.add(sprite);
    return sprite;
  }

  remove(image: Sprite) {
    this.scene.remove(image);
  }
}

const imageDisplayer = new ImageDisplayer();

export {imageDisplayer};
