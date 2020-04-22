import { Sprite, Texture, SpriteMaterial } from 'three';
import { ImagePixel, ImageGenerator } from '@/ImageGenerator/ImageGenerator';
import { ImageUrlGenerator } from '@/ImageGenerator/ImageUrlGenerator';
import { threeTextureLoader } from '@/core/loaders/TextureLoader';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE, WALL, HUD } from '@/constants';

export class HUDMap {
  sprite: Sprite;

  constructor() {
    this.sprite = new Sprite();
  }

  updateSprite(entities: Entity[]) {
    const getWallPixel = (entity: Entity): ImagePixel =>
      ({ x: entity.actor.mesh.position.x, y: entity.actor.mesh.position.z, color: 'red', size: WALL.SIZE });

    const imagePixels: ImagePixel[] =
      entities
        .filter(entity => entity.type === ENTITY_TYPE.WALL)
        .map(getWallPixel);

    this.initSprite(imagePixels);
  }

  initSprite(imagePixels: ImagePixel[]) {
    const imageGenerator = new ImageGenerator(imagePixels, { width: HUD.MAP_SIZE, height: HUD.MAP_SIZE });
    const imageUrlGenerator = new ImageUrlGenerator(imageGenerator);
    const mapImageUrl = imageUrlGenerator.getImageUrl();
    threeTextureLoader.load(mapImageUrl, (texture: Texture) => {
      const mapMaterial = new SpriteMaterial({
        map: texture
      });
      this.sprite.material = mapMaterial;
    });
  }
}
