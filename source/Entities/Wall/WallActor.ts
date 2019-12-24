import { Actor } from '@/core/Entities/Actor';
import { Mesh, BoxGeometry, MeshPhongMaterial, Vector3 } from 'three';
import { textureLoader } from '@/TextureLoader';
import wallTextureFile from '@/assets/wall.png';

interface WallActorProps {
  size: { width: number; height: number, depth: number };
  position: Vector3;
}

export class WallActor implements Actor {
  mesh: Mesh;

  constructor(props: WallActorProps) {
    const texture = textureLoader.load(wallTextureFile);
    const geometry = new BoxGeometry(props.size.width, props.size.height, props.size.depth);
    const material = new MeshPhongMaterial({ map: texture });
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
  }

  update(delta: number) { }
}
