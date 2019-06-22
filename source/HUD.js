import { TextureLoader, Scene, OrthographicCamera, SpriteMaterial, Sprite } from 'three';

const textureLoader = new TextureLoader();

class HUD {
  constructor() {
    this.scene = new Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, - 500, 1000);
  }
}

export default HUD;
