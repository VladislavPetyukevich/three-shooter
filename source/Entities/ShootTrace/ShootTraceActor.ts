import { BufferGeometry, LineBasicMaterial, Mesh, Vector3, Line, Color } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { randomNumbers } from '@/RandomNumbers';

interface ActorProps {
  startPos: Vector3;
  endPos: Vector3;
}

export class ShootTraceActor implements Actor {
  material: LineBasicMaterial;
  mesh: Mesh;

  constructor(props: ActorProps) {
    this.material = new LineBasicMaterial({
      color: 'red',
    });
    const points = [
      props.startPos,
      props.endPos,
    ];
    const geometry = new BufferGeometry().setFromPoints(points);
    const line = new Line(geometry, this.material);
    this.mesh = new Mesh();
    this.mesh.add(line);
  }

  update() {
    if (randomNumbers.getRandom() > 0.5) {
      this.material.color = new Color('red');
    } else {
      this.material.color = new Color('white');
    }
  }
}

