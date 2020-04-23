import { Sprite, Texture, SpriteMaterial, Vector3 } from 'three';
import { ImagePixel, ImageGenerator } from '@/ImageGenerator/ImageGenerator';
import { ImageUrlGenerator } from '@/ImageGenerator/ImageUrlGenerator';
import { threeTextureLoader } from '@/core/loaders/TextureLoader';
import { Entity } from '@/core/Entities/Entity';
import { ENTITY_TYPE } from '@/constants';

interface HUDMapCollors {
  wall: string;
  player: string;
  background: string;
}

interface HUDMapSettings {
  mapSize: number;
  wallPixelSize: number;
  renderDistance: number;
  colors: HUDMapCollors;
}

export class HUDMap {
  settings: HUDMapSettings;
  sprite: Sprite;
  wallsPixels?: ImagePixel[];

  constructor(settings: HUDMapSettings) {
    this.settings = settings;
    this.sprite = new Sprite();
    this.initSprite([]);
  }

  updateEntities(entities: Entity[]) {
    const getWallPixel = (entity: Entity): ImagePixel =>
      ({
        x: entity.actor.mesh.position.x,
        y: entity.actor.mesh.position.z,
        color: this.settings.colors.wall,
        size: this.settings.wallPixelSize
      });

    this.wallsPixels =
      entities
        .filter(entity => entity.type === ENTITY_TYPE.WALL)
        .map(getWallPixel);
  }

  initSprite(imagePixels: ImagePixel[]) {
    const imageGenerator = new ImageGenerator(imagePixels, { width: this.settings.mapSize, height: this.settings.mapSize });
    const imageUrlGenerator = new ImageUrlGenerator(imageGenerator);
    const wallsMapImageUrl = imageUrlGenerator.getImageUrl();
    this.drawSprite(wallsMapImageUrl);
  }

  drawSprite(imageUrl: string) {
    threeTextureLoader.load(imageUrl, (texture: Texture) => {
      const mapMaterial = new SpriteMaterial({
        map: texture
      });
      this.sprite.material = mapMaterial;
    });
  }

  updatePlayerPosition(meshPosition: Vector3) {
    setTimeout(this.renderMap, 0, meshPosition);
  }

  renderMap = (playerMeshPosition: Vector3) => {
    if (!this.wallsPixels) {
      return;
    }
    const renderDistance = this.settings.renderDistance;
    const nearPixels = this.wallsPixels.filter(wallPixel => {
      const xDiff = wallPixel.x - playerMeshPosition.x;
      const yDiff = wallPixel.y - playerMeshPosition.z;
      const distanceToPlayer = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
      return distanceToPlayer <= renderDistance;
    });
    this.initSprite(nearPixels);
  };
}
