import { Actor } from '@/core/Entities/Actor';
import {
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  Vector3,
  RepeatWrapping,
  Material,
  Color,
} from 'three';
import { texturesStore } from '@/core/loaders/TextureLoader';

interface WallActorProps {
  size: { width: number; height: number, depth: number };
  position: Vector3;
  textureSize: number;
  textureFileName: string;
  isHorizontalWall?: boolean;
  color?: Color;
}

export class WallActor implements Actor {
  mesh: Mesh;

  constructor(props: WallActorProps) {
    const geometry = new BoxGeometry(props.size.width, props.size.height, props.size.depth);
    const textureXSize = props.isHorizontalWall ?
      props.size.width :
      props.size.depth;
    const textureX = this.getSizeSpecificTexture(props.textureFileName, `X${textureXSize}`);
    textureX.wrapS = textureX.wrapT = RepeatWrapping;
    textureX.repeat.x = textureXSize / props.textureSize;
    textureX.repeat.y = 1;
    textureX.needsUpdate = true;
    const materialX = new MeshBasicMaterial({
      transparent: true,
      map: textureX,
      ...(props.color && { color: props.color }),
    });
    const textureYSize = props.isHorizontalWall ?
      props.size.depth :
      props.size.width;
    const textureY = this.getSizeSpecificTexture(props.textureFileName, `Y${textureYSize}`);
    textureY.wrapS = textureY.wrapT = RepeatWrapping;
    textureY.repeat.x = textureYSize / props.textureSize;
    textureY.repeat.y = 1;
    textureY.needsUpdate = true;
    const materialY = new MeshBasicMaterial({
      transparent: true,
      map: textureY,
      ...(props.color && { color: props.color }),
    });
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

  getSizeSpecificTexture(textureName: string, sizeId: string) {
    const textureIdName = `${textureName}${sizeId}`;
    return texturesStore.getTexture(textureIdName) ||
      texturesStore.cloneTexture(textureName, textureIdName);
  }

  update() { }
}
