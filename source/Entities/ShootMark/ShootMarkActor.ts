import { Mesh, BoxGeometry, MeshLambertMaterial, Camera } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { SpriteSheet } from '@/SpriteSheet';

interface ShootMarkActorProps {
  position: { x: number; y: number; z: number };
  playerCamera: Camera;
}

export class ShootMarkActor implements Actor {
  mesh: Mesh;
  playerCamera: Camera;
  spriteSheet: SpriteSheet;
  currentSprite: number;
  lifeTime: number;

  constructor(props: ShootMarkActorProps) {
    const shootMarkFile1 = texturesStore.getTexture('shootMark1');
    const shootMarkFile2 = texturesStore.getTexture('shootMark2');
    const size = 0.19;
    const geometry = new BoxGeometry(size, size, size);
    const material = new MeshLambertMaterial();
    material.transparent = true;
    this.spriteSheet = new SpriteSheet({
      textures: [shootMarkFile1, shootMarkFile2],
      material
    });
    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
    this.playerCamera = props.playerCamera;
    this.lifeTime = 0;
    this.currentSprite = 0;
  }

  update(delta: number) {
    this.mesh.rotation.y = Math.atan2(
      (this.playerCamera.position.x - this.mesh.position.x),
      (this.playerCamera.position.z - this.mesh.position.z)
    );

    this.lifeTime += delta;
    if ((this.currentSprite === 0) && (this.lifeTime >= 0.1)) {
      this.spriteSheet.displaySprite(1);
    }
  }
}
