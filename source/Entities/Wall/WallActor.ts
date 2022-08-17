import { Actor } from '@/core/Entities/Actor';
import {
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
  Vector3,
  RepeatWrapping,
  Material,
  Color,
} from 'three';
import { texturesStore } from '@/core/loaders/TextureLoader';

interface WallActorProps {
  size: { width: number; height: number, depth: number };
  position: Vector3;
  textureRepeat: number;
  textureFileName: string;
  isHorizontalWall?: boolean;
  color?: Color;
}

export class WallActor implements Actor {
  mesh: Mesh;
  textureFileName: string;
  textureRepeat: number;
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

  getSizeSpecificTexture(textureName: string, sizeId: string) {
    const textureIdName = `${textureName}${sizeId}`;
    return texturesStore.getTexture(textureIdName) ||
      texturesStore.cloneTexture(textureName, textureIdName);
  }

  update() { }
}
