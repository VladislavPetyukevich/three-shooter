import { Vector3 } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { Mesh, MeshPhongMaterial, BoxGeometry } from 'three';

interface TriggerActorProps {
  size: Vector3;
  position: Vector3;
}

export class TriggerActor implements Actor {
  mesh: Mesh;

  constructor(props: TriggerActorProps) {
    const geometry = new BoxGeometry(props.size.x, props.size.y, props.size.z);
    const material = new MeshPhongMaterial({ color: 'red' });
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.copy(props.position);
  }
 
  update() { }
}

