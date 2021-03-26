import { BufferGeometry, LineBasicMaterial, Mesh, Vector3, Line } from 'three';
import { Actor } from '@/core/Entities/Actor';

interface ActorProps {
  startPos: Vector3;
  endPos: Vector3;
}

export class ShootTraceActor implements Actor {
  mesh: Mesh;

  constructor(props: ActorProps) {
    const material = new LineBasicMaterial({
      color: 'red',
    });
    const points = [
      props.startPos,
      props.endPos,
    ];
    const geometry = new BufferGeometry().setFromPoints(points);
    const line = new Line(geometry, material);
    this.mesh = new Mesh();
    this.mesh.add(line);
  }

  update() {}
}

