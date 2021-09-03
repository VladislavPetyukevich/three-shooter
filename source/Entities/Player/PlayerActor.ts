import { Actor } from '@/core/Entities/Actor';
import { Mesh, BoxGeometry, MeshBasicMaterial, Vector3 } from 'three';

interface ActorProps {
  size: { width: number; height: number, depth: number };
  position: Vector3;
}

export class PlayerActor implements Actor {
  mesh: Mesh;

  constructor(props: ActorProps) {
    const geometry = new BoxGeometry(props.size.width, props.size.height, props.size.depth);
    const material = new MeshBasicMaterial();
    material.visible = false;
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
  }

  update() { }
}
