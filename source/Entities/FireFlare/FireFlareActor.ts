import { Mesh, BoxGeometry, MeshLambertMaterial } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { texturesStore } from '@/core/loaders/TextureLoader';

interface ActorProps {
  position: { x: number; y: number; z: number };
}

export class FireFlareActor implements Actor {
  mesh: Mesh;

  constructor(props: ActorProps) {
    const geometry = new BoxGeometry(3, 3, 0.001);
    const material = new MeshLambertMaterial({
      map: texturesStore.getTexture('fireFlare'),
      alphaMap: texturesStore.getTexture('fireFlareAlpha'),
      transparent: true,
      opacity: 0.5
    });
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
    this.mesh.renderOrder = 1;
  }

  update() {}
}

