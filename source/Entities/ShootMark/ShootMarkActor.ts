import { Mesh, BoxGeometry, MeshPhongMaterial, Camera } from 'three';
import { Actor } from '@/core/Entities/Actor';
import { texturesStore } from '@/core/loaders/TextureLoader';
import { GAME_TEXTURE_NAME } from '@/constants';
import { SpriteSheet } from '@/SpriteSheet';

interface ActorProps {
  position: { x: number; y: number; z: number };
  playerCamera: Camera;
}

export class ShootMarkActor implements Actor {
  mesh: Mesh;
  playerCamera: Camera;
  spriteSheet: SpriteSheet;
  currentSprite: number;
  lifeTime: number;

  constructor(props: ActorProps) {
    const shootMarkFile1 = texturesStore.getTexture(GAME_TEXTURE_NAME.shootMark1);
    const shootMarkFile2 = texturesStore.getTexture(GAME_TEXTURE_NAME.shootMark2);
    const geometry = new BoxGeometry(0.1, 0.1, 0.1);
    const material = new MeshPhongMaterial();
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
