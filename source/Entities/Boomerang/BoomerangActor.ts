import { Mesh, CylinderGeometry, MeshLambertMaterial, Vector3 } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { COLORS, PI_2 } from '@/constants';

export interface BoomerangActorProps {
  position: Vector3;
}

export class BoomerangActor implements Actor {
  mesh: Mesh;
  rotationSpeed: number;

  constructor(props: BoomerangActorProps) {
    this.rotationSpeed = 10;
    const raius = 0.07;
    const geometry = new CylinderGeometry(
      raius,
      raius,
      4.5,
      5
    );
    const material = new MeshLambertMaterial({ color: COLORS.SexualPerversions });
    this.mesh = new Mesh(geometry, material);
    this.mesh.rotation.x = PI_2;
    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
  }

  update(delta: number) {
    this.mesh.rotateZ(delta * this.rotationSpeed);
  }
}

