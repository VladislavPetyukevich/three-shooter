import { Actor } from '@/core/Entities/Actor';
import { Mesh, BoxGeometry, MeshPhongMaterial, Vector3, RepeatWrapping, Material } from 'three';
import { texturesStore } from '@/core/loaders/TextureLoader';

interface WallActorProps {
  size: { width: number; height: number, depth: number };
  position: Vector3;
  textureFileName: string;
  normalTextureFileName?: string;
  isHorizontalWall?: boolean;
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
    textureX.repeat.x = textureXSize / 3;
    textureX.repeat.y = 1;
    textureX.needsUpdate = true;
    let normalX;
    if (props.normalTextureFileName) {
      normalX = texturesStore.getTexture(props.normalTextureFileName);
      normalX.wrapS = normalX.wrapT = RepeatWrapping;
      normalX.repeat.x = textureX.repeat.x;
      normalX.repeat.y = textureX.repeat.y;
    }
    const materialX = new MeshPhongMaterial({
      transparent: true,
      map: textureX,
      ...(normalX && { normalMap: normalX })
    });
    const textureYSize = props.isHorizontalWall ?
      props.size.depth :
      props.size.width;
    const textureY = this.getSizeSpecificTexture(props.textureFileName, `Y${textureYSize}`);
    textureY.wrapS = textureY.wrapT = RepeatWrapping;
    textureY.repeat.x = textureYSize / 3;
    textureY.repeat.y = 1;
    textureY.needsUpdate = true;
    let normalY;
    if (props.normalTextureFileName) {
      normalY = texturesStore.getTexture(props.normalTextureFileName);
      normalY.wrapS = normalY.wrapT = RepeatWrapping;
      normalY.repeat.x = textureY.repeat.x;
      normalY.repeat.y = textureY.repeat.y;
    }
    const materialY = new MeshPhongMaterial({
      transparent: true,
      map: textureY,
      ...(normalY && { normalMap: normalY })
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
