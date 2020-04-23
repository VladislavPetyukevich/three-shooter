import { Sprite, Texture, SpriteMaterial, Vector3, Euler } from 'three';
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
  updatingFPS: number;
}

export class HUDMap {
  settings: HUDMapSettings;
  sprite: Sprite;
  wallsPixels?: ImagePixel[];
  nearPixels: { x: number; y: number; color: string; size: number; rotation?: number | undefined; }[];
  playerMeshPosition: Vector3;
  playerRotationY: number;

  constructor(settings: HUDMapSettings) {
    this.settings = settings;
    this.sprite = new Sprite();
    this.nearPixels = [];
    this.playerMeshPosition = new Vector3();
    this.playerRotationY = 0;
    this.startUpdating();
  }

  startUpdating = () => {
    this.calcNearPixels();
    this.initSprite();
    setTimeout(this.startUpdating, 1000 / this.settings.updatingFPS);
  }

  calcNearPixels = () => {
    if (!this.wallsPixels) {
      return;
    }
    const renderDistance = this.settings.renderDistance;
    this.nearPixels = this.wallsPixels
      .filter(wallPixel => {
        const xDiff = wallPixel.x - this.playerMeshPosition.x;
        const yDiff = wallPixel.y - this.playerMeshPosition.z;
        const distanceToPlayer = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
        return distanceToPlayer <= renderDistance;
      })
      .map(pixel => ({
        ...pixel,
        x: pixel.x - this.playerMeshPosition.x + renderDistance,
        y: pixel.y - this.playerMeshPosition.z + renderDistance
      }));
  };

  initSprite() {
    const playerPixelSize = this.settings.wallPixelSize * 2;
    const playerPixel: ImagePixel = {
      x: this.settings.renderDistance - playerPixelSize / 2,
      y: this.settings.renderDistance - playerPixelSize / 2,
      color: this.settings.colors.player,
      size: playerPixelSize,
      rotation: this.playerRotationY
    };
    const imageGenerator = new ImageGenerator([...this.nearPixels, playerPixel], { width: this.settings.mapSize, height: this.settings.mapSize });
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

  updatePlayerPosition(meshPosition: Vector3) {
    this.playerMeshPosition = meshPosition;
  }

  updatePlayerRotation(cameraRotation: Euler) {
    this.playerRotationY = cameraRotation.y;
  }
}
