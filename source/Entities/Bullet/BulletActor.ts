import { Actor } from '@/core/Entities/Actor';
import { Mesh, SphereGeometry, MeshLambertMaterial, Vector3 } from 'three';

interface BulletActorProps {
  sphere: { radius: number; widthSegments: number, heightSegments: number };
  position: Vector3;
}

export class BulletActor implements Actor {
  mesh: Mesh;

  constructor(props: BulletActorProps) {
    const geometry = new SphereGeometry(
      props.sphere.radius,
      props.sphere.widthSegments,
      props.sphere.heightSegments
    );
    const material = new MeshLambertMaterial({ color: 0xFF0000 });
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
  }

  update(delta: number) { }
}
