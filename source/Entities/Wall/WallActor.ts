import { Actor } from '@/core/Entities/Actor';
import { Mesh, BoxGeometry, MeshPhongMaterial, Vector3 } from 'three';
import { texturesStore } from '@/TextureLoader';
import { GAME_TEXTURE_NAME } from '@/constants';

interface WallActorProps {
  size: { width: number; height: number, depth: number };
  position: Vector3;
}

export class WallActor implements Actor {
  mesh: Mesh;

  constructor(props: WallActorProps) {
    const texture = texturesStore.getTexture(GAME_TEXTURE_NAME.wallTextureFile);
    const normal = texturesStore.getTexture(GAME_TEXTURE_NAME.wallNormalFile);
    const geometry = new BoxGeometry(props.size.width, props.size.height, props.size.depth);
    const material = new MeshPhongMaterial({
      map: texture,
      normalMap: normal
    });
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
  }

  update(delta: number) { }
}
