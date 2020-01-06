import { Texture, MeshPhongMaterial, SpriteMaterial } from 'three';

interface SpriteSheetProps {
  textures: Texture[];
  material: MeshPhongMaterial | SpriteMaterial;
}

export class SpriteSheet {
  textures: Texture[];
  material: MeshPhongMaterial | SpriteMaterial;

  constructor(props: SpriteSheetProps) {
    this.textures = props.textures;
    this.material = props.material;
    this.material.map = this.textures[0];
  }

  displaySprite(spriteNumber: number) {
    this.material.map = this.textures[spriteNumber];
  }
}
