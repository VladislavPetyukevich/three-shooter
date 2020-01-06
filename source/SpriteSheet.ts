import { Texture, MeshPhongMaterial } from 'three';

interface SpriteSheetProps {
  textures: Texture[];
  material: MeshPhongMaterial;
}

export class SpriteSheet {
  textures: Texture[];
  material: MeshPhongMaterial;

  constructor(props: SpriteSheetProps) {
    this.textures = props.textures;
    this.material = props.material;
    this.material.map = this.textures[0];
  }

  displaySprite(spriteNumber: number) {
    this.material.map = this.textures[spriteNumber];
  }
}
