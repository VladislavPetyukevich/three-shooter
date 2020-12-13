import { Actor } from '@/core/Entities/Actor';
import { Mesh, BoxGeometry, MeshPhongMaterial, Vector3 } from 'three';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GAME_TEXTURE_NAME } from '@/constants';

interface DoorActorProps {
  size: { width: number; height: number, depth: number };
  position: Vector3;
}

export class DoorActor implements Actor {
  mesh: Mesh;

  constructor(props: DoorActorProps) {
    const texture = texturesStore.getTexture(GAME_TEXTURE_NAME.doorTextureFile);
    const geometry = new BoxGeometry(props.size.width, props.size.height, props.size.depth);
    const material = new MeshPhongMaterial({
      map: texture,
      transparent: true
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
