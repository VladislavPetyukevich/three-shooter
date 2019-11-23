import { Actor } from '@/core/Entities/Actor';
import { Mesh, BoxGeometry, MeshBasicMaterial, Vector3 } from 'three';

interface WallActorProps {
  size: { width: number; height: number, depth: number };
  position: Vector3;
}

export class WallActor implements Actor {
  mesh: Mesh;

  constructor(props: WallActorProps) {
    const geometry = new BoxGeometry(props.size.width, props.size.height, props.size.depth);
    const material = new MeshBasicMaterial({ color: 'blue' });
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
  }

  update(delta: number) { }
}
