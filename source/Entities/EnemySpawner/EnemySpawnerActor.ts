import { Vector3, Color } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { Mesh, MeshLambertMaterial, BoxGeometry } from 'three';

interface EnemySpawnerActorProps {
  size: Vector3;
  position: Vector3;
  color: Color;
}

export class EnemySpawnerActor implements Actor {
  mesh: Mesh;

  constructor(props: EnemySpawnerActorProps) {
    const geometry = new BoxGeometry(props.size.x, props.size.y, props.size.z);
    const material = new MeshLambertMaterial({ color: props.color });
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.copy(props.position);
  }

  update() { }
}
