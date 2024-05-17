import { Actor } from '@/core/Entities/Actor';
import {
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
  Vector3,
  RepeatWrapping,
  Material,
  Color,
  Euler,
} from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { randomNumbers } from '@/RandomNumbers';
import { gameTextures } from '@/constantsAssets';
import { DECAL_COLOR } from '@/constants';

const DECAL_TEXTURES = ['wallDecal1TextureFile', 'wallDecal2TextureFile', 'wallDecal3TextureFile'];

interface WallActorProps {
  size: { width: number; height: number, depth: number };
  position: Vector3;
  textureRepeat: number;
  textureFileName: keyof typeof gameTextures;
  decalsCount: number;
  isHorizontalWall?: boolean;
  color?: Color;
}

export class WallActor implements Actor {
  mesh: Mesh;
  textureFileName: string;
  textureRepeat: number;
  decalCoordinatesHash: Set<string>;
  color?: Color;

  constructor(props: WallActorProps) {
    this.textureFileName = props.textureFileName;
    this.textureRepeat = props.textureRepeat;
    this.color = props.color;
    const geometry = new BoxGeometry(props.size.width, props.size.height, props.size.depth);
    const textureXSize = props.isHorizontalWall ?
      props.size.width :
      props.size.depth;
    const materialX = this.createMaterial(textureXSize);
    const textureYSize = props.isHorizontalWall ?
      props.size.depth :
      props.size.width;
    const materialY = this.createMaterial(textureYSize);
    const materials: Material[] = [];
    const horizontalMaterial = props.isHorizontalWall ? materialX : materialY;
    const vertivalMaterial = props.isHorizontalWall ? materialY : materialX;
    materials[0] = vertivalMaterial;
    materials[1] = vertivalMaterial;
    materials[4] = horizontalMaterial;
    materials[5] = horizontalMaterial;
    this.mesh = new Mesh(geometry, materials);

    this.decalCoordinatesHash = new Set();
    if (props.decalsCount) {
      for (let i = props.decalsCount; i--;) {
        const decal = this.createRandomDecal(props);
        decal && this.mesh.add(decal);
      }
    }

    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
  }

  createMaterial(textureSize: number) {
    const texture = this.getSizeSpecificTexture(this.textureFileName, `X${textureSize}`);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.x = textureSize / this.textureRepeat;
    texture.repeat.y = 1;
    texture.needsUpdate = true;
    const material = new MeshLambertMaterial({
      transparent: true,
      map: texture,
      ...(this.color && { color: this.color }),
    });
    return material;
  }

  createRandomDecal(props: WallActorProps) {
    const wallSize =
      props.isHorizontalWall ? props.size.depth : props.size.width;
    const wallWidth = props.isHorizontalWall ? props.size.width : props.size.depth;
    const decalWidth = 1.5;
    const xShift = (wallWidth / 2 / decalWidth) - decalWidth / 2;
    const xPos = randomNumbers.getRandomInRange(-xShift, xShift);
    const yPos = (decalWidth / 4) * (randomNumbers.getRandomInRange(0, 1) ? 1 : -1);
    const coordinateHash = `${xPos}${yPos}`;
    if (this.decalCoordinatesHash.has(coordinateHash)) {
      return;
    }
    this.decalCoordinatesHash.add(coordinateHash);
    const size = new Vector3(
      wallSize / 2,
      wallSize / 2,
      5,
    );
    const orientation = new Euler(
      0,
      props.isHorizontalWall ? 0 : 1.5708, // 1.5708 - 90 degrees
      0
    );
    const position = new Vector3(
      props.isHorizontalWall ? xPos * decalWidth : 0,
      yPos,
      props.isHorizontalWall ? 0 : xPos * decalWidth,
    );
    const decalMaterial = new MeshLambertMaterial({
      map: texturesStore.getTexture(this.getRandomDecalName()),
      color: DECAL_COLOR,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -1.3,
    });
    const decalGeometry = new DecalGeometry(
      this.mesh,
      position,
      orientation,
      size,
    );
    const decal = new Mesh(decalGeometry, decalMaterial);
    return decal;
  }

  getRandomDecalName() {
    return DECAL_TEXTURES[randomNumbers.getRandomInRange(0, DECAL_TEXTURES.length - 1)];
  }

  getSizeSpecificTexture(textureName: string, sizeId: string) {
    const textureIdName = `${textureName}${sizeId}`;
    if (texturesStore.checkIsTextureExists(textureIdName)) {
      return texturesStore.getTexture(textureIdName);
    }
    return texturesStore.cloneTexture(textureName, textureIdName);
  }

  update() { }
}
