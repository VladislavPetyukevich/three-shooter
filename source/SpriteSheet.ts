import { Texture, RepeatWrapping } from 'three';

interface SpriteSheetProps {
  texture: Texture;
  spritesHorizontal: number;
  spritesVertical: number;
}

export class SpriteSheet {
  texture: Texture;
  spritesHorizontal: number;
  spritesVertical: number;

  constructor(props: SpriteSheetProps) {
    this.texture = props.texture;
    this.texture.wrapS = RepeatWrapping;
    this.texture.wrapT = RepeatWrapping;
    this.spritesHorizontal = props.spritesHorizontal;
    this.spritesVertical = props.spritesVertical;
    this.texture.repeat.set(1 / this.spritesHorizontal, 1 / this.spritesVertical);
  }

  displaySprite(x: number, y: number) {
    this.texture.offset.x = x / this.spritesHorizontal;
    this.texture.offset.y = y / this.spritesVertical;
  }

  getTexture() {
    return this.texture;
  }
}
