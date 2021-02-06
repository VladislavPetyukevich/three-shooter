import { Texture, MeshPhongMaterial, MeshBasicMaterial, SpriteMaterial } from 'three';

interface SpriteSheetProps {
  textures: Texture[];
  material: MeshPhongMaterial | MeshBasicMaterial | SpriteMaterial;
}

export class SpriteSheet {
  textures: Texture[];
  material: MeshPhongMaterial | MeshBasicMaterial | SpriteMaterial;

  constructor(props: SpriteSheetProps) {
    this.textures = props.textures;
    this.material = props.material;
    this.material.map = this.textures[0];
  }

  displaySprite(spriteNumber: number) {
    this.material.map = this.textures[spriteNumber];
  }
}
