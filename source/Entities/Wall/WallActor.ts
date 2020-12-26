import { Actor } from '@/core/Entities/Actor';
import { Mesh, BoxGeometry, MeshPhongMaterial, Vector3, RepeatWrapping, Material } from 'three';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GAME_TEXTURE_NAME } from '@/constants';

interface WallActorProps {
  size: { width: number; height: number, depth: number };
  position: Vector3;
  isHorizontalWall?: boolean;
}

export class WallActor implements Actor {
  mesh: Mesh;

  constructor(props: WallActorProps) {
    const geometry = new BoxGeometry(props.size.width, props.size.height, props.size.depth);
    const textureXSize = props.isHorizontalWall ?
      props.size.width :
      props.size.depth;
    const textureX = this.getSizeSpecificTexture(GAME_TEXTURE_NAME.wallTextureFile, `X${textureXSize}`);
    const normalX = texturesStore.getTexture(GAME_TEXTURE_NAME.wallNormalFile);
    textureX.wrapS = textureX.wrapT = normalX.wrapS = normalX.wrapT = RepeatWrapping;
    normalX.repeat.x = textureX.repeat.x = textureXSize / 3;
    normalX.repeat.y = textureX.repeat.y = 1;
    textureX.needsUpdate = true;
    const materialX = new MeshPhongMaterial({
      map: textureX,
      normalMap: normalX
    });
    const textureYSize = props.isHorizontalWall ?
      props.size.depth :
      props.size.width;
    const textureY = this.getSizeSpecificTexture(GAME_TEXTURE_NAME.wallTextureFile, `Y${textureYSize}`);
    const normalY = texturesStore.getTexture(GAME_TEXTURE_NAME.wallNormalFile);
    textureY.wrapS = textureY.wrapT = normalY.wrapS = normalY.wrapT = RepeatWrapping;
    normalY.repeat.x = textureY.repeat.x = textureYSize / 3;
    normalY.repeat.y = textureY.repeat.y = 1;
    textureY.needsUpdate = true;
    const materialY = new MeshPhongMaterial({
      map: textureY,
      normalMap: normalY
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
