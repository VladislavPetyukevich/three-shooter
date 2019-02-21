import { TextureLoader, Scene, OrthographicCamera, SpriteMaterial, Sprite } from 'three';
import crosshairFile from './assets/crosshair.png';

const textureLoader = new TextureLoader();

class HUD {
  constructor() {
    this.scene = new Scene();
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new OrthographicCamera(-width, width, height, -height, - 500, 1000);

    const crosshairTexture = textureLoader.load(crosshairFile);
    const crosshairMaterial = new SpriteMaterial({ map: crosshairTexture });
    const crosshair = new Sprite(crosshairMaterial);
    crosshair.scale.set(39, 39);
    this.scene.add(crosshair);
  }
}

export default HUD;
