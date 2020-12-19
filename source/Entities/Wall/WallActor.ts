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
    const textureX = texturesStore.getTexture(GAME_TEXTURE_NAME.wallTextureFile);
    const normalX = texturesStore.getTexture(GAME_TEXTURE_NAME.wallNormalFile);
    textureX.wrapS = textureX.wrapT = normalX.wrapS = textureX.wrapT = RepeatWrapping;
    normalX.repeat.x = textureX.repeat.x = ~~(props.size.depth / 3);
    normalX.repeat.y = textureX.repeat.y = 1;
    const materialX = new MeshPhongMaterial({
      map: textureX,
      normalMap: normalX
    });
    const textureY = texturesStore.getTexture(GAME_TEXTURE_NAME.wallTextureFile2);
    const normalY = texturesStore.getTexture(GAME_TEXTURE_NAME.wallNormalFile2);
    textureY.wrapS = textureY.wrapT = normalY.wrapS = textureY.wrapT = RepeatWrapping;
    normalY.repeat.x = textureY.repeat.x = ~~(props.size.width / 3);
    normalY.repeat.y = textureY.repeat.y = 1;
    const materialY = new MeshPhongMaterial({
      map: textureY,
      normalMap: normalY
    });
    const materials: Material[] = [];
    const horizontalMaterial = props.isHorizontalWall ? materialY : materialX;
    const vertivalMaterial = props.isHorizontalWall ? materialX : materialY;
    materials[0] = horizontalMaterial;
    materials[1] = horizontalMaterial;
    materials[2] = horizontalMaterial;
    materials[3] = horizontalMaterial;
    materials[4] = vertivalMaterial;
    materials[5] = vertivalMaterial;
    this.mesh = new Mesh(geometry, materials);

    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
  }

  update(delta: number) { }
}
