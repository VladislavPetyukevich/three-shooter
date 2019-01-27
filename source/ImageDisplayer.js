import { Scene, OrthographicCamera, SpriteMaterial, Sprite } from 'three';

let currentId = 0;

class ImageDisplayer {
  constructor() {
    this.scene = new Scene();
    this.width = window.innerWidth / 2;
    this.height = window.innerHeight / 2;
    this.camera = new OrthographicCamera(-this.width, this.width, this.height, -this.height, - 500, 1000);
  }

  add(texture) {
    const material = new SpriteMaterial({ map: texture });
    let sprite = new Sprite(material);
    sprite.scale.set(this.width * 2, this.height * 2);
    sprite.name = ++currentId;
    this.scene.add(sprite);
    return currentId;
  }

  remove(imageId) {
    var image = this.scene.getObjectByName(imageId);
    this.scene.remove(image);
  }
}

const imageDisplayer = new ImageDisplayer()

export default imageDisplayer;
