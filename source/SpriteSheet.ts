import { Texture, MeshPhongMaterial, MeshBasicMaterial, SpriteMaterial, MeshLambertMaterial } from 'three';

interface SpriteSheetProps {
  textures: Texture[];
  material: MeshPhongMaterial | MeshBasicMaterial | SpriteMaterial | MeshLambertMaterial;
}

export class SpriteSheet {
  textures: Texture[];
  material: MeshPhongMaterial | MeshBasicMaterial | SpriteMaterial | MeshLambertMaterial;
  currentIndex: number;

  constructor(props: SpriteSheetProps) {
    this.textures = props.textures;
    this.material = props.material;
    this.currentIndex = 0;
    this.displayCurrentSprite();
  }

  displaySprite(spriteNumber: number) {
    this.currentIndex = spriteNumber;
    this.displayCurrentSprite();
  }

  displayCurrentSprite() {
    this.material.map = this.textures[this.currentIndex];
  }
}
